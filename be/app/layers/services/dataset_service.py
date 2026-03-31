"""Dataset service — business logic untuk manajemen dataset"""

import csv
import os

from sqlalchemy import asc, desc, or_

from app.config.extensions import db
from app.layers.models.dataset import Dataset, DatasetStatus
from app.utils.exceptions import BadRequestError, NotFoundError
from app.utils.logger import logger

# Folder penyimpanan dataset — sesuaikan dengan konfigurasi storage kamu
DATASET_UPLOAD_DIR = os.path.join(
    os.path.dirname(__file__), "..", "..", "..", "storage", "datasets"
)


def _ensure_dir(path: str):
    os.makedirs(path, exist_ok=True)


def get_by_id(dataset_id: str) -> Dataset:
    dataset = db.session.get(Dataset, dataset_id)
    if not dataset:
        raise NotFoundError("Dataset tidak ditemukan")
    return dataset


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

    sort_col = getattr(Dataset, sort_by, Dataset.created_at)
    sort_fn = desc if sort_order == "desc" else asc
    query = query.order_by(sort_fn(sort_col))

    offset = (page - 1) * per_page
    datasets = query.offset(offset).limit(per_page).all()

    return datasets, total


def upload(file, name: str, description: str | None, user_id: str | None) -> Dataset:
    """Simpan file CSV/TSV yang diupload dan buat record Dataset."""
    _ensure_dir(DATASET_UPLOAD_DIR)

    filename = file.filename
    if not filename:
        raise BadRequestError("Nama file tidak valid")

    ext = os.path.splitext(filename)[1].lower()
    if ext not in (".csv", ".tsv", ".txt"):
        raise BadRequestError("Format file harus CSV, TSV, atau TXT")

    # Buat nama file unik
    import uuid as _uuid

    unique_name = f"{_uuid.uuid4().hex}{ext}"
    file_path = os.path.join(DATASET_UPLOAD_DIR, unique_name)

    file.save(file_path)
    file_size = os.path.getsize(file_path)

    # Baca header untuk tahu kolom yang tersedia
    try:
        delimiter = "\t" if ext == ".tsv" else ","
        with open(file_path, "r", encoding="utf-8", errors="replace") as f:
            reader = csv.reader(f, delimiter=delimiter)
            columns = next(reader, [])
    except Exception:
        columns = []

    dataset = Dataset(
        name=name,
        description=description,
        file_path=file_path,
        file_name=filename,
        file_size=file_size,
        columns=columns,
        status=DatasetStatus.UPLOADED,
        uploaded_by=user_id,
    )
    db.session.add(dataset)
    db.session.commit()

    logger.info(f"Dataset uploaded: {dataset.id} ({filename})")
    return dataset


def preprocess(
    dataset_id: str,
    text_column: str,
    label_column: str,
    test_size: float = 0.1,
    val_size: float = 0.1,
) -> Dataset:
    """
    Baca file, validasi kolom, hitung statistik, dan simpan metadata.
    Tidak benar-benar split file — hanya simpan info untuk dipakai Colab nanti.
    """
    dataset = get_by_id(dataset_id)

    if dataset.status == DatasetStatus.PREPROCESSING:
        raise BadRequestError("Dataset sedang dalam proses preprocessing")

    # Validasi kolom
    if dataset.columns and text_column not in dataset.columns:
        raise BadRequestError(f"Kolom '{text_column}' tidak ditemukan di dataset")
    if dataset.columns and label_column not in dataset.columns:
        raise BadRequestError(f"Kolom '{label_column}' tidak ditemukan di dataset")

    dataset.status = DatasetStatus.PREPROCESSING
    db.session.commit()

    try:
        ext = os.path.splitext(dataset.file_path)[1].lower()
        delimiter = "\t" if ext == ".tsv" else ","

        rows = []
        labels_seen = set()

        with open(dataset.file_path, "r", encoding="utf-8", errors="replace") as f:
            reader = csv.DictReader(f, delimiter=delimiter)
            for row in reader:
                text_val = row.get(text_column, "").strip()
                label_val = row.get(label_column, "").strip()
                if text_val and label_val:
                    rows.append(row)
                    labels_seen.add(label_val)

        if len(rows) < 10:
            raise BadRequestError("Dataset terlalu kecil, minimal 10 baris valid")

        num_samples = len(rows)
        labels_list = sorted(labels_seen)

        # Hitung ukuran split (simpan sebagai info saja)
        test_n = max(1, int(num_samples * test_size))
        val_n = max(1, int(num_samples * val_size))
        train_n = num_samples - test_n - val_n

        dataset.text_column = text_column
        dataset.label_column = label_column
        dataset.num_samples = num_samples
        dataset.num_labels = len(labels_list)
        dataset.labels = labels_list
        dataset.train_size = train_n
        dataset.val_size = val_n
        dataset.test_size = test_n
        dataset.status = DatasetStatus.READY
        dataset.error_message = None
        db.session.commit()

        logger.info(
            f"Dataset preprocessed: {dataset_id} — {num_samples} samples, {len(labels_list)} labels"
        )
        return dataset

    except BadRequestError:
        dataset.status = DatasetStatus.ERROR
        dataset.error_message = "Kolom tidak valid atau data tidak cukup"
        db.session.commit()
        raise
    except Exception as e:
        dataset.status = DatasetStatus.ERROR
        dataset.error_message = str(e)
        db.session.commit()
        logger.error(f"Preprocessing error for dataset {dataset_id}: {e}")
        raise BadRequestError(f"Gagal memproses dataset: {e}") from None


def delete(dataset_id: str):
    dataset = get_by_id(dataset_id)

    # Cek apakah ada training job yang aktif
    from app.layers.models.training_job import JobStatus, TrainingJob

    active_jobs = (
        db.session.query(TrainingJob)
        .filter(
            TrainingJob.dataset_id == dataset_id,
            TrainingJob.status.in_([JobStatus.QUEUED, JobStatus.RUNNING]),
        )
        .count()
    )
    if active_jobs > 0:
        raise BadRequestError(
            "Dataset tidak bisa dihapus karena sedang digunakan oleh training job yang aktif"
        )

    # Hapus file
    if dataset.file_path and os.path.exists(dataset.file_path):
        try:
            os.remove(dataset.file_path)
        except Exception as e:
            logger.warning(f"Failed to delete file {dataset.file_path}: {e}")

    db.session.delete(dataset)
    db.session.commit()
    logger.info(f"Dataset deleted: {dataset_id}")
