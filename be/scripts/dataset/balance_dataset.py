"""
balance_dataset.py
==================
Menyeimbangkan distribusi kelas pada dataset NLP menggunakan pendekatan:
  1. Text Quality Filtering  → buang data kotor (duplikat, terlalu pendek, terlalu banyak noise)
  2. TF-IDF Vectorization    → representasikan teks sebagai fitur numerik
  3. KMeans Clustering       → kelompokkan teks dalam satu kelas ke N klaster
  4. Centroid-closest Sampling → ambil 1 sampel terbaik (paling representatif) per klaster

Dengan cara ini, data yang tersisa dijamin BERAGAM dan REPRESENTATIF
(tidak bias pada satu topik/gaya penulisan tertentu dalam kelas yang sama).

Output akan disimpan ke: Datasets/Combined/Balanced/
"""

import logging
import re
import sys
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.cluster import MiniBatchKMeans
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import pairwise_distances_argmin_min
from tqdm import tqdm

# ── Konfigurasi Logging ──────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger(__name__)

# ── Konfigurasi Path ─────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent
INPUT_DIR = BASE_DIR / "Combined" / "Base"
OUTPUT_DIR = BASE_DIR / "Combined" / "Balanced"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

DATASETS = {
    "Kesehatan": INPUT_DIR / "Kesehatan.csv",
    "Pendidikan": INPUT_DIR / "Pendidikan.csv",
}

# Konfigurasi kolom CSV
TEXT_COL = "full_text"
LABEL_COL = "manual_label"
DELIMITER = ";"

# Label mapping emosi (untuk laporan yang lebih mudah dibaca)
LABEL_MAP = {
    1: "senang",
    2: "percaya",
    3: "terkejut",
    4: "netral",
    5: "takut",
    6: "sedih",
    7: "marah",
}

# ── Random Seed (agar hasil reproducible) ────────────────────────────────────
RANDOM_SEED = 42


# ════════════════════════════════════════════════════════════════════════════
# TAHAP 1: TEXT QUALITY FILTERING
# ════════════════════════════════════════════════════════════════════════════


def clean_text_for_check(text: str) -> str:
    """Bersihkan teks minimal untuk evaluasi kualitas (bukan output akhir)."""
    text = str(text)
    # Hapus URL
    text = re.sub(r"http\S+|www\.\S+", "", text)
    # Hapus mention (@user)
    text = re.sub(r"@\w+", "", text)
    # Hapus hashtag simbol tapi tetap simpan kata
    text = re.sub(r"#(\w+)", r"\1", text)
    # Hapus karakter non-alfanumerik kecuali spasi
    text = re.sub(r"[^\w\s]", "", text)
    # Normalize whitespace
    text = re.sub(r"\s+", " ", text).strip()
    return text


def filter_quality(df: pd.DataFrame, text_col: str) -> pd.DataFrame:
    """
    Filter kualitas data:
    - Hapus baris dengan nilai NaN di kolom teks
    - Hapus duplikat teks (exact match)
    - Hapus teks yang terlalu pendek (< 5 kata setelah dibersihkan dari noise)
    - Hapus teks yang 'noise ratio'-nya terlalu tinggi (mayoritas URL/mention/angka)
    """
    n_before = len(df)

    # 1. Hapus NaN
    df = df.dropna(subset=[text_col]).copy()
    log.info(
        f"  Setelah hapus NaN          : {len(df):>7,} baris (- {n_before - len(df):,})"
    )

    # 2. Hapus duplikat (case-insensitive, strip whitespace)
    df["_norm"] = df[text_col].str.strip().str.lower()
    df = df.drop_duplicates(subset=["_norm"])
    log.info(
        f"  Setelah hapus duplikat     : {len(df):>7,} baris (- {n_before - len(df):,} total)"
    )

    # 3. Evaluasi kualitas teks menggunakan versi yang sudah dibersihkan
    df["_cleaned"] = df[text_col].apply(clean_text_for_check)
    df["_word_count"] = df["_cleaned"].apply(lambda x: len(x.split()))

    # 4. Hapus teks terlalu pendek (< 5 kata bersih)
    df = df[df["_word_count"] >= 5]
    log.info(
        f"  Setelah hapus pendek (<5 kata): {len(df):>7,} baris (- {n_before - len(df):,} total)"
    )

    # 5. Hapus teks yang hampir semua noise (rasio kata bersih vs panjang asli sangat rendah)
    df["_raw_word_count"] = df[text_col].apply(lambda x: len(str(x).split()))
    df["_noise_ratio"] = 1 - (df["_word_count"] / df["_raw_word_count"].clip(lower=1))
    df = df[df["_noise_ratio"] <= 0.85]
    log.info(
        f"  Setelah hapus noise ratio tinggi: {len(df):>7,} baris (- {n_before - len(df):,} total)"
    )

    # Hapus kolom bantu
    df = df.drop(
        columns=["_norm", "_cleaned", "_word_count", "_raw_word_count", "_noise_ratio"]
    )

    return df.reset_index(drop=True)


# ════════════════════════════════════════════════════════════════════════════
# TAHAP 2-4: TFIDF + KMEANS CLUSTERING UNDERSAMPLING
# ════════════════════════════════════════════════════════════════════════════


def cluster_undersample(
    df: pd.DataFrame, text_col: str, label_col: str, n_samples: int
) -> pd.DataFrame:
    """
    Untuk satu kelas, lakukan:
    1. Representasikan teks sebagai TF-IDF vector
    2. Cluster teks ke dalam 'n_samples' klaster menggunakan MiniBatchKMeans
    3. Dari tiap klaster, ambil teks yang posisinya paling dekat ke centroid
       (= teks yang paling "representatif" dari sub-topik tersebut)
    """
    texts = df[text_col].astype(str).tolist()

    # Jika jumlah data di kelas ini sudah <= n_samples, kembalikan semua
    if len(texts) <= n_samples:
        return df

    # TF-IDF Vectorization
    vectorizer = TfidfVectorizer(
        max_features=10_000,
        ngram_range=(1, 2),  # unigram + bigram
        sublinear_tf=True,  # scalling TF dengan log, lebih stabil
        min_df=2,  # abaikan kata yang muncul < 2x
        strip_accents="unicode",
    )
    X = vectorizer.fit_transform(texts)

    # KMeans Clustering
    # MiniBatchKMeans lebih cepat untuk dataset besar
    kmeans = MiniBatchKMeans(
        n_clusters=n_samples,
        random_state=RANDOM_SEED,
        n_init=5,
        max_iter=300,
        batch_size=min(1024, len(texts)),
    )
    kmeans.fit(X)

    # Temukan sampel yang paling dekat ke setiap centroid
    # pairwise_distances_argmin_min mengembalikan index dan distance ke centroid
    closest_indices, _ = pairwise_distances_argmin_min(
        kmeans.cluster_centers_,  # posisi centroid
        X,  # seluruh titik data
        metric="cosine",
    )

    # Ambil index unik (ada kemungkinan dua centroid menunjuk ke titik yang sama)
    unique_indices = list(dict.fromkeys(closest_indices.tolist()))

    # Jika karena kebetulan ada duplikat yang mengurangi jumlah, tambal dengan sampel random
    if len(unique_indices) < n_samples:
        all_indices = set(range(len(texts)))
        selected = set(unique_indices)
        remaining = list(all_indices - selected)
        rng = np.random.default_rng(RANDOM_SEED)
        extra = rng.choice(
            remaining, size=n_samples - len(unique_indices), replace=False
        )
        unique_indices = unique_indices + extra.tolist()

    return df.iloc[unique_indices[:n_samples]].reset_index(drop=True)


def balance_dataset(df: pd.DataFrame, text_col: str, label_col: str) -> pd.DataFrame:
    """Pipeline utama penyeimbangan kelas."""

    # Hitung distribusi kelas SETELAH filtering
    counts = df[label_col].value_counts().sort_index()
    min_count = int(counts.min())

    log.info("\n  Distribusi kelas (setelah filtering):")
    for lbl, cnt in counts.items():
        emosi = LABEL_MAP.get(lbl, str(lbl))
        log.info(f"    Kelas {lbl} ({emosi:<9}): {cnt:>7,} data")
    log.info(f"\n  → Target per kelas (kelas terkecil): {min_count:,}\n")

    balanced_parts = []

    for label in tqdm(
        sorted(df[label_col].unique()), desc="  Balancing kelas", unit="kelas"
    ):
        emosi = LABEL_MAP.get(label, str(label))
        class_df = df[df[label_col] == label].copy()
        n_before = len(class_df)

        if n_before <= min_count:
            # Kelas ini sudah di bawah / sama dengan target, ambil semua
            sampled = class_df
            log.info(
                f"    Kelas {label} ({emosi:<9}): {n_before:,} → {len(sampled):,} (dipertahankan semua)"
            )
        else:
            # Lakukan clustering undersampling
            sampled = cluster_undersample(class_df, text_col, label_col, min_count)
            log.info(
                f"    Kelas {label} ({emosi:<9}): {n_before:,} → {len(sampled):,} (clustering undersampling)"
            )

        balanced_parts.append(sampled)

    result = pd.concat(balanced_parts, ignore_index=True)

    # Acak urutan baris akhir
    result = result.sample(frac=1, random_state=RANDOM_SEED).reset_index(drop=True)

    return result


# ════════════════════════════════════════════════════════════════════════════
# MAIN PIPELINE
# ════════════════════════════════════════════════════════════════════════════


def print_distribution_report(df: pd.DataFrame, label_col: str, title: str):
    counts = df[label_col].value_counts().sort_index()
    total = len(df)
    print(f"\n{'═' * 55}")
    print(f"  {title}")
    print(f"{'─' * 55}")
    print(f"  {'Label':<5} {'Emosi':<12} {'Jumlah':>8}  {'%':>6}")
    print(f"{'─' * 55}")
    for lbl, cnt in counts.items():
        emosi = LABEL_MAP.get(lbl, str(lbl))
        print(f"  {lbl:<5} {emosi:<12} {cnt:>8,}  {cnt / total * 100:>5.1f}%")
    print(f"{'─' * 55}")
    print(f"  {'TOTAL':<17} {total:>8,}  100.0%")
    print(f"{'═' * 55}\n")


def process_dataset(name: str, filepath: Path):
    log.info(f"\n{'━' * 60}")
    log.info(f"  MEMPROSES DATASET: {name}")
    log.info(f"{'━' * 60}")
    log.info(f"  File: {filepath}")

    # ── Load ─────────────────────────────────────────────────────────────────
    # Auto-detect encoding: coba utf-8 dulu, fallback ke latin-1 (cp1252)
    for enc in ("utf-8", "utf-8-sig", "latin-1"):
        try:
            df = pd.read_csv(filepath, sep=DELIMITER, encoding=enc, on_bad_lines="skip")
            log.info(f"  Encoding terdeteksi: {enc}")
            break
        except UnicodeDecodeError:
            log.warning(f"  Encoding {enc} gagal, mencoba berikutnya...")
    else:
        log.error("  ✗ Tidak dapat membaca file dengan encoding manapun!")
        sys.exit(1)
    log.info(f"  Data awal: {len(df):,} baris")

    # Pastikan kolom ada
    if TEXT_COL not in df.columns or LABEL_COL not in df.columns:
        log.error(f"  ✗ Kolom '{TEXT_COL}' atau '{LABEL_COL}' tidak ditemukan!")
        log.error(f"    Kolom tersedia: {list(df.columns)}")
        sys.exit(1)

    # Ubah label ke int
    df[LABEL_COL] = pd.to_numeric(df[LABEL_COL], errors="coerce")
    df = df.dropna(subset=[LABEL_COL])
    df[LABEL_COL] = df[LABEL_COL].astype(int)

    # ── Laporan distribusi SEBELUM ────────────────────────────────────────────
    print_distribution_report(df, LABEL_COL, f"Distribusi SEBELUM Balancing — {name}")

    # ── Tahap 1: Quality Filtering ────────────────────────────────────────────
    log.info("  [TAHAP 1] Text Quality Filtering...")
    df_filtered = filter_quality(df, TEXT_COL)

    # ── Tahap 2-4: Clustering Undersampling ───────────────────────────────────
    log.info("\n  [TAHAP 2-4] TF-IDF + KMeans Clustering Undersampling...")
    df_balanced = balance_dataset(df_filtered, TEXT_COL, LABEL_COL)

    # ── Laporan distribusi SESUDAH ────────────────────────────────────────────
    print_distribution_report(
        df_balanced, LABEL_COL, f"Distribusi SESUDAH Balancing — {name}"
    )

    # ── Simpan output ─────────────────────────────────────────────────────────
    # Hanya simpan 2 kolom asli
    output_df = df_balanced[[TEXT_COL, LABEL_COL]]
    output_path = OUTPUT_DIR / f"{name}.csv"
    output_df.to_csv(output_path, sep=DELIMITER, index=False, encoding="utf-8")
    log.info(f"  ✓ Disimpan ke: {output_path}")
    log.info(f"  ✓ Total data tersimpan: {len(output_df):,} baris\n")


def main():
    log.info("╔══════════════════════════════════════════════════════════╗")
    log.info("║   Dataset Balancing: TF-IDF + KMeans Clustering         ║")
    log.info("║   Metode: Semantic Diversity Undersampling               ║")
    log.info("╚══════════════════════════════════════════════════════════╝")

    for name, filepath in DATASETS.items():
        if not filepath.exists():
            log.warning(f"  ⚠ File tidak ditemukan, dilewati: {filepath}")
            continue
        process_dataset(name, filepath)

    log.info("╔══════════════════════════════════════════════════════════╗")
    log.info("║   SELESAI! Semua dataset telah diseimbangkan.            ║")
    log.info("║   Output tersimpan di: Combined/Balanced/               ║")
    log.info("╚══════════════════════════════════════════════════════════╝")


if __name__ == "__main__":
    main()
