"""Dataset service — business logic dataset management"""

import os
import re
import unicodedata
import uuid as _uuid
from collections import Counter
from threading import Thread

import pandas as pd
from sqlalchemy import asc, desc, or_

from app.config.extensions import db
from app.layers.models.dataset import Dataset, DatasetStatus, PreprocessingStatus
from app.layers.models.preprocessed_row import PreprocessedRow
from app.layers.services.sse_service import sse_manager
from app.utils.exceptions import BadRequestError, NotFoundError
from app.utils.logger import logger

DATASET_DIR = os.path.join(
    os.path.dirname(__file__), "..", "..", "storage", "uploads", "datasets"
)
MIN_ROWS = 100
MIN_COLS = 2


def _ensure_dir(path: str):
    os.makedirs(path, exist_ok=True)


# ── Preprocessing teks ─────────────────────────────────────────────────────────


def preprocess_text(text: str) -> str:
    """
    Bersihkan teks dari noise:
    URL, email, mention, hashtag (#word → word), HTML tag, whitespace berlebih.
    Tidak lowercase — biarkan user yang tentukan saat training.
    """
    # if not isinstance(text, str):
    #     text = str(text) if text is not None else ""

    # text = unicodedata.normalize("NFKC", text)
    # text = re.sub(r"https?://\S+|www\.\S+", " ", text)  # URL
    # text = re.sub(r"\S+@\S+\.\S+", " ", text)  # email
    # text = re.sub(r"@[\w_]+", " ", text)  # @mention
    # text = re.sub(r"#([\w]+)", r"\1", text)  # #hashtag → hashtag
    # text = re.sub(r"<[^>]+>", " ", text)  # HTML tag
    # text = re.sub(r"[\r\n\t]+", " ", text)  # newline/tab
    # text = re.sub(r"\s+", " ", text).strip()  # whitespace
    return text


# ── CRUD Dataset ───────────────────────────────────────────────────────────────


def get_by_id(dataset_id: str) -> Dataset:
    ds = db.session.get(Dataset, dataset_id)
    if not ds:
        raise NotFoundError("Dataset tidak ditemukan")
    return ds


def get_all(
    page=1,
    per_page=20,
    search=None,
    status=None,
    sort_by="created_at",
    sort_order="desc",
):
    query = db.session.query(Dataset)

    if search:
        term = f"%{search}%"
        query = query.filter(
            or_(Dataset.name.ilike(term), Dataset.description.ilike(term))
        )
    if status:
        query = query.filter(Dataset.status == DatasetStatus(status))

    total = query.count()
    col = getattr(Dataset, sort_by, Dataset.created_at)
    fn = desc if sort_order == "desc" else asc
    datasets = (
        query.order_by(fn(col)).offset((page - 1) * per_page).limit(per_page).all()
    )

    return datasets, total


def upload(file, name: str, description: str | None, user_id: str | None) -> Dataset:
    """
    1. Simpan file sementara
    2. Baca dengan pandas, validasi min rows & cols
    3. Cleaning dasar: hapus baris kosong total & duplikat persis
    4. Validasi ulang setelah cleaning
    5. Tulis ulang file yang sudah bersih
    6. Simpan record Dataset ke DB
    """
    _ensure_dir(DATASET_DIR)

    filename = file.filename
    if not filename:
        raise BadRequestError("Nama file tidak valid")

    ext = os.path.splitext(filename)[1].lower()
    if ext not in (".csv", ".tsv", ".txt"):
        raise BadRequestError("Format file harus CSV, TSV, atau TXT")

    unique_name = f"{_uuid.uuid4().hex}{ext}"
    file_path = os.path.join(DATASET_DIR, unique_name)
    file.save(file_path)

    try:
        delimiter = "\t" if ext == ".tsv" else ";"

        # Baca dengan fallback encoding
        try:
            df = pd.read_csv(
                file_path,
                delimiter=delimiter,
                encoding="utf-8",
                on_bad_lines="skip",
                dtype=str,
            )
        except UnicodeDecodeError:
            df = pd.read_csv(
                file_path,
                delimiter=delimiter,
                encoding="latin-1",
                on_bad_lines="skip",
                dtype=str,
            )

        # Strip spasi di nama kolom
        df.columns = [str(c).strip() for c in df.columns]

        # Validasi sebelum cleaning
        if len(df.columns) < MIN_COLS:
            raise BadRequestError(
                f"Dataset harus memiliki minimal {MIN_COLS} kolom "
                f"(ditemukan {len(df.columns)} kolom)"
            )
        if len(df) < MIN_ROWS:
            raise BadRequestError(
                f"Dataset harus memiliki minimal {MIN_ROWS} baris "
                f"(ditemukan {len(df)} baris)"
            )

        # Cleaning dasar
        df = df.dropna(how="all")  # hapus baris yang semuanya kosong/NaN
        df = df.drop_duplicates()  # hapus baris duplikat persis
        df = df.reset_index(drop=True)

        # Validasi setelah cleaning
        if len(df) < MIN_ROWS:
            raise BadRequestError(
                f"Setelah menghapus baris kosong dan duplikat, tersisa {len(df)} baris. "
                f"Minimal {MIN_ROWS} baris diperlukan."
            )

        # Tulis ulang file yang sudah dibersihkan
        df.to_csv(file_path, sep=delimiter, index=False, encoding="utf-8")
        file_size = os.path.getsize(file_path)
        columns = list(df.columns)

        dataset = Dataset(
            name=name,
            description=description,
            file_path=file_path,
            file_name=filename,
            file_size=file_size,
            columns=columns,
            num_rows_raw=len(df),
            status=DatasetStatus.UPLOADED,
            preprocessing_status=PreprocessingStatus.IDLE,
            uploaded_by=user_id,
        )
        db.session.add(dataset)
        db.session.commit()

        logger.info(
            f"Dataset uploaded: {dataset.id} — {len(df)} rows, {len(columns)} cols"
        )
        return dataset

    except BadRequestError:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        logger.error(f"Upload error: {e}")
        raise BadRequestError(f"Gagal memproses file: {e}") from None


def set_columns(dataset_id: str, text_column: str, label_column: str) -> Dataset:
    """Set kolom teks & label, hitung distribusi kelas dari raw data."""
    dataset = get_by_id(dataset_id)

    if text_column not in (dataset.columns or []):
        raise BadRequestError(f"Kolom '{text_column}' tidak ada dalam dataset")
    if label_column not in (dataset.columns or []):
        raise BadRequestError(f"Kolom '{label_column}' tidak ada dalam dataset")
    if text_column == label_column:
        raise BadRequestError("Kolom teks dan label harus berbeda")

    # Hitung distribusi kelas dari raw data
    try:
        delimiter = "\t" if dataset.file_path.endswith(".tsv") else ";"
        df = pd.read_csv(
            dataset.file_path, delimiter=delimiter, encoding="utf-8", dtype=str
        )
        valid = df[[text_column, label_column]].dropna()
        valid = valid[valid[text_column].str.strip() != ""]
        valid = valid[valid[label_column].str.strip() != ""]
        dist_raw = valid[label_column].str.strip().value_counts().to_dict()
        dist_raw = {k: int(v) for k, v in dist_raw.items()}
    except Exception as e:
        logger.error(f"Failed to compute class distribution: {e}")
        dist_raw = None

    dataset.text_column = text_column
    dataset.label_column = label_column
    dataset.class_distribution_raw = dist_raw
    dataset.status = DatasetStatus.READY
    db.session.commit()

    logger.info(
        f"Columns set for {dataset_id}: text={text_column}, label={label_column}"
    )
    return dataset


# ── Raw data ───────────────────────────────────────────────────────────────────


def get_raw_data(
    dataset_id: str,
    page=1,
    per_page=50,
    search=None,
    filter_label=None,
):
    """Baca raw data dari file CSV dengan pagination & filter."""
    dataset = get_by_id(dataset_id)

    try:
        delimiter = "\t" if dataset.file_path.endswith(".tsv") else ";"
        df = pd.read_csv(
            dataset.file_path, delimiter=delimiter, encoding="utf-8", dtype=str
        )
    except Exception as e:
        raise BadRequestError(f"Gagal membaca file dataset: {e}") from None

    # Filter search (di kolom teks atau semua kolom)
    if search:
        if dataset.text_column and dataset.text_column in df.columns:
            mask = (
                df[dataset.text_column]
                .fillna("")
                .str.contains(search, case=False, na=False, regex=False)
            )
        else:
            mask = (
                df.fillna("")
                .apply(lambda col: col.str.contains(search, case=False, na=False, regex=False))
                .any(axis=1)
            )
        df = df[mask]

    # Filter label
    if filter_label and dataset.label_column and dataset.label_column in df.columns:
        df = df[df[dataset.label_column].fillna("").str.strip() == filter_label]

    total = len(df)
    df = df.iloc[::-1].reset_index(drop=True)
    start = (page - 1) * per_page
    page_df = df.iloc[start : start + per_page]

    # NaN → None untuk JSON dan descending order
    rows = page_df.where(pd.notna(page_df), None).to_dict(orient="records")

    return rows, total


# ── Preprocessing ──────────────────────────────────────────────────────────────


def start_preprocessing(dataset_id: str, app) -> Dataset:
    """Trigger preprocessing di background thread."""
    dataset = get_by_id(dataset_id)

    if not dataset.columns_configured():
        raise BadRequestError(
            "Kolom teks dan label harus diatur terlebih dahulu sebelum preprocessing"
        )

    updated = (
        db.session.query(Dataset)
        .filter(
            Dataset.id == dataset_id,
            Dataset.preprocessing_status != PreprocessingStatus.RUNNING,
        )
        .update(
            {
                Dataset.preprocessing_status: PreprocessingStatus.RUNNING,
                Dataset.preprocessing_error: None,
            },
            synchronize_session=False,
        )
    )
    if updated == 0:
        raise BadRequestError("Preprocessing sedang berjalan")
    db.session.commit()
    dataset = get_by_id(dataset_id)
    sse_manager.publish(f"dataset:{dataset_id}", dataset.to_dict(), event="update")

    def run():
        with app.app_context():
            _do_preprocess(dataset_id)

    Thread(target=run, daemon=True).start()
    logger.info(f"Preprocessing started for dataset {dataset_id}")
    return dataset


def _do_preprocess(dataset_id: str):
    try:
        dataset = db.session.get(Dataset, dataset_id)
        if not dataset:
            return

        delimiter = "\t" if dataset.file_path.endswith(".tsv") else ";"
        df = pd.read_csv(
            dataset.file_path, delimiter=delimiter, encoding="utf-8", dtype=str
        )

        text_col = dataset.text_column
        label_col = dataset.label_column

        db.session.query(PreprocessedRow).filter_by(dataset_id=dataset_id).delete()
        db.session.flush()

        rows_to_insert = []
        seen: set[tuple] = set()

        for idx, row in df.iterrows():
            raw_text = str(row.get(text_col, "")).strip()
            label = str(row.get(label_col, "")).strip()

            if not raw_text or raw_text == "nan" or not label or label == "nan":
                continue

            preprocessed = preprocess_text(raw_text)
            if not preprocessed:
                continue

            key = (preprocessed.lower(), label.lower())
            if key in seen:
                continue
            seen.add(key)

            rows_to_insert.append(
                PreprocessedRow(
                    dataset_id=dataset_id,
                    raw_text=raw_text,
                    preprocessed_text=preprocessed,
                    label=label,
                    row_index=int(idx),
                )
            )

        db.session.bulk_save_objects(rows_to_insert)

        dist_preprocessed = dict(Counter(r.label for r in rows_to_insert))
        dataset.num_rows_preprocessed = len(rows_to_insert)
        dataset.class_distribution_preprocessed = dist_preprocessed
        dataset.preprocessing_status = PreprocessingStatus.COMPLETED
        db.session.commit()

        # ── Broadcast selesai ──────────────────────────────────
        sse_manager.publish(
            f"dataset:{dataset_id}",
            dataset.to_dict(),
            event="complete",
        )

        logger.info(
            f"Preprocessing completed: {dataset_id} — {len(rows_to_insert)} rows"
        )

    except Exception as e:
        logger.error(f"Preprocessing failed for {dataset_id}: {e}")
        try:
            db.session.rollback()
            dataset = db.session.get(Dataset, dataset_id)
            if dataset:
                dataset.preprocessing_status = PreprocessingStatus.ERROR
                dataset.preprocessing_error = str(e)
                db.session.commit()
                # ── Broadcast error ────────────────────────────
                sse_manager.publish(
                    f"dataset:{dataset_id}",
                    dataset.to_dict(),
                    event="error_event",
                )
        except Exception:
            db.session.rollback()


# ── CRUD Preprocessed Rows ─────────────────────────────────────────────────────


def get_preprocessed_data(
    dataset_id: str,
    page=1,
    per_page=50,
    search=None,
    filter_label=None,
):
    get_by_id(dataset_id)  # validasi exists

    query = db.session.query(PreprocessedRow).filter_by(dataset_id=dataset_id)

    if search:
        term = f"%{search}%"
        query = query.filter(
            or_(
                PreprocessedRow.preprocessed_text.ilike(term),
                PreprocessedRow.raw_text.ilike(term),
            )
        )
    if filter_label:
        query = query.filter(PreprocessedRow.label == filter_label)

    total = query.count()
    rows = (
        query.order_by(PreprocessedRow.row_index.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )
    return rows, total


def add_preprocessed_row(
    dataset_id: str, raw_text: str, preprocessed_text: str, label: str
) -> PreprocessedRow:
    dataset = get_by_id(dataset_id)

    # Validasi label
    valid_labels = set((dataset.class_distribution_preprocessed or {}).keys())
    if valid_labels and label not in valid_labels:
        raise BadRequestError(
            f"Label '{label}' tidak valid. Label yang tersedia: {', '.join(valid_labels)}"
        )

    # Cek duplikat
    existing = (
        db.session.query(PreprocessedRow)
        .filter_by(
            dataset_id=dataset_id,
            preprocessed_text=preprocessed_text.strip(),
            label=label,
        )
        .first()
    )
    if existing:
        raise BadRequestError("Data dengan teks dan label yang sama sudah ada")

    cleaned = preprocessed_text.strip()
    if not cleaned:
        raise BadRequestError("Teks terpreproses tidak boleh kosong")

    row = PreprocessedRow(
        dataset_id=dataset_id,
        raw_text=raw_text.strip(),
        preprocessed_text=cleaned,
        label=label,
    )
    db.session.add(row)

    # Update statistik
    dataset.num_rows_preprocessed = (dataset.num_rows_preprocessed or 0) + 1
    dist = dict(dataset.class_distribution_preprocessed or {})
    dist[label] = dist.get(label, 0) + 1
    dataset.class_distribution_preprocessed = dist

    db.session.commit()
    return row


def update_preprocessed_row(
    dataset_id: str,
    row_id: int,
    preprocessed_text: str = None,
    label: str = None,
) -> PreprocessedRow:
    dataset = get_by_id(dataset_id)
    row = db.session.get(PreprocessedRow, row_id)

    if not row or row.dataset_id != dataset_id:
        raise NotFoundError("Data tidak ditemukan")

    old_label = row.label

    if preprocessed_text is not None:
        cleaned = preprocessed_text.strip()
        if not cleaned:
            raise BadRequestError("Teks terpreproses tidak boleh kosong")
        effective_label = label if (label is not None) else old_label
        dup = (
            db.session.query(PreprocessedRow)
            .filter(
                PreprocessedRow.dataset_id == dataset_id,
                PreprocessedRow.id != row_id,
                PreprocessedRow.preprocessed_text == cleaned,
                PreprocessedRow.label == effective_label,
            )
            .first()
        )
        if dup:
            raise BadRequestError("Data dengan teks dan label yang sama sudah ada")
        row.preprocessed_text = cleaned

    if label is not None and label != old_label:
        valid_labels = set((dataset.class_distribution_preprocessed or {}).keys())
        if valid_labels and label not in valid_labels:
            raise BadRequestError(f"Label '{label}' tidak valid")

        # Update distribusi
        dist = dict(dataset.class_distribution_preprocessed or {})
        dist[old_label] = max(0, dist.get(old_label, 1) - 1)
        if dist[old_label] == 0:
            del dist[old_label]
        dist[label] = dist.get(label, 0) + 1
        dataset.class_distribution_preprocessed = dist
        row.label = label

    db.session.commit()
    return row


def delete_preprocessed_row(dataset_id: str, row_id: int):
    dataset = get_by_id(dataset_id)
    row = db.session.get(PreprocessedRow, row_id)

    if not row or row.dataset_id != dataset_id:
        raise NotFoundError("Data tidak ditemukan")

    label = row.label
    db.session.delete(row)

    # Update statistik
    dataset.num_rows_preprocessed = max(0, (dataset.num_rows_preprocessed or 1) - 1)
    dist = dict(dataset.class_distribution_preprocessed or {})
    dist[label] = max(0, dist.get(label, 1) - 1)
    if dist[label] == 0:
        del dist[label]
    dataset.class_distribution_preprocessed = dist

    db.session.commit()


def delete(dataset_id: str):
    dataset = get_by_id(dataset_id)

    from app.layers.models.training_job import JobStatus, TrainingJob

    active = (
        db.session.query(TrainingJob)
        .filter(
            TrainingJob.dataset_id == dataset_id,
            TrainingJob.status.in_([JobStatus.QUEUED, JobStatus.RUNNING]),
        )
        .count()
    )
    if active > 0:
        raise BadRequestError(
            "Dataset tidak bisa dihapus karena sedang digunakan oleh training job yang aktif"
        )

    if dataset.file_path and os.path.exists(dataset.file_path):
        try:
            os.remove(dataset.file_path)
        except Exception as e:
            logger.warning(f"Failed to delete file {dataset.file_path}: {e}")

    db.session.delete(dataset)
    db.session.commit()
    logger.info(f"Dataset deleted: {dataset_id}")
