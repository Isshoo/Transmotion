"""
preprocess_dataset.py
=====================
Preprocessing minimal untuk dataset tweet emosi (mBERT / XLM-R).

Pipeline:
  1. Fix/Hapus mojibake + decode HTML entity (&amp; dll)
  2. Hapus URL (https://t.co/...)
  3. Hapus @mention
  4. Hashtag → teks biasa (hapus '#', pertahankan kata)
  5. Hapus artefak emoji/karakter corrupt dari scraping
  6. Bersihkan tanda baca yang berdiri sendiri (sisa penghapusan token)
  7. Normalisasi whitespace

TIDAK dilakukan: lowercasing, stemming, stopword removal, hapus tanda baca.
Ini intentional — model transformer membutuhkan teks se-natural mungkin.

Input : Datasets/Combined/Balanced/
Output: Datasets/Combined/Cleaned/
"""

import html
import logging
import re
import sys
import unicodedata
from pathlib import Path

import ftfy  # Fix mojibake — install: pip install ftfy
import pandas as pd
from tqdm import tqdm

# ── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger(__name__)

# ── Path ─────────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent.parent
INPUT_DIR = BASE_DIR / "app" / "storage" / "datasets" / "Combined" / "Balanced"
OUTPUT_DIR = BASE_DIR / "app" / "storage" / "datasets" / "Combined" / "Cleaned"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

DATASETS = ["Kesehatan", "Pendidikan"]
TEXT_COL = "full_text"
LABEL_COL = "manual_label"
DELIMITER = ";"

LABEL_MAP = {
    1: "senang",
    2: "percaya",
    3: "terkejut",
    4: "netral",
    5: "takut",
    6: "sedih",
    7: "marah",
}


# ═══════════════════════════════════════════════════════════════════════════
# PREPROCESSING FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════════


def fix_encoding(text: str) -> str:
    """
    Langkah 1: Perbaiki mojibake dan decode HTML entity.
    - ftfy memperbaiki double-encoded unicode (Ã¯Â¿Â½, Ã¢ÂÂ, dll)
    - html.unescape mendecode HTML entity (&amp; → &, &lt; → <, dll)
    """
    try:
        fixed = ftfy.fix_text(text)
    except Exception:
        fixed = text
    # Decode HTML entities: &amp; → &, &lt; → <, &gt; → >, &quot; → ", &#nn; → char
    fixed = html.unescape(fixed)
    return fixed


def remove_urls(text: str) -> str:
    """Langkah 2: Hapus URL (http/https/t.co)."""
    # Match URL dengan berbagai format termasuk t.co shortlinks
    text = re.sub(r"https?://\S+", "", text)
    text = re.sub(r"www\.\S+", "", text)
    return text


def remove_mentions(text: str) -> str:
    """Langkah 3: Hapus @mention (username Twitter)."""
    text = re.sub(r"@\w+", "", text)
    return text


def convert_hashtags(text: str) -> str:
    """
    Langkah 4: Konversi hashtag → teks biasa.
    Hapus simbol '#', pertahankan kata di dalamnya karena mengandung sinyal emosi/topik.
    Contoh: '#IndonesiaMaju' → 'IndonesiaMaju'
    """
    text = re.sub(r"#(\w+)", r"\1", text)
    return text


def remove_emoji_artifacts(text: str) -> str:
    """
    Langkah 5: Hapus artefak emoji dan karakter noise dari scraping.

    Yang dihapus:
    - Mojibake sisa setelah ftfy (Ã, Â, ï¿½)
    - Karakter 'Ñ' / 'Ð' saat muncul terisolasi sebagai separator/bullet
      (bukan sebagai bagian kata — di data ini selalu artefak, bukan teks Spanyol)
    - Karakter unicode Arab/Indic/non-Latin yang merupakan artefak corrupt emoji
      (contoh: _Ùàµ_Ùàü — corr emoji dari scraping, bukan teks Arab asli)
    - Karakter unicode kategori So/Cs/Cf/Co (emoji, surrogate, private use)
    - __ dan ?? (placeholder emoji yang tidak terrender)
    - ðŸ / ð (artefak encoding emoji UTF-8 yang salah dibaca sebagai latin-1)
    """
    # 1. Hapus mojibake sisa setelah ftfy
    text = re.sub(r"[ÃÂ]{1,2}[\xa0-\xff]?", " ", text)
    text = re.sub(r"ï¿½", " ", text)

    # 2. Hapus karakter Ñ/Ð yang muncul TERISOLASI (dikelilingi spasi/awal/akhir)
    #    Ini adalah artefak yang paling sering muncul sebagai separator/bullet hasil scraping.
    #    Gunakan word-boundary agar tidak menghapus jika ada kata seperti "España" (jarang di data ini)
    text = re.sub(r"(?<![\w])([ÑÐ])(?![\w])", " ", text)

    # 3. Hapus blok karakter Arab/Indic/non-Latin yang merupakan artefak corrupt emoji
    #    Pattern seperti '_Ùàµ_Ùàü' — karakter Arab-range yang muncul tidak masuk akal
    #    dalam teks Indonesia. Heuristik: sequence karakter non-ASCII yang diawali/diikuti underscore
    text = re.sub(r"_[\u0080-\u07FF\u0600-\u06FF]{1,4}_?", " ", text)  # _Ùx_ pattern
    text = re.sub(r"[\u0600-\u06FF]{2,}", " ", text)  # blok Arab >= 2 karakter
    text = re.sub(r"[\u0900-\u097F]{2,}", " ", text)  # blok Devanagari >= 2 karakter
    text = re.sub(r"[\u0E00-\u0E7F]{2,}", " ", text)  # blok Thai >= 2 karakter

    # 4. Hapus karakter unicode kategori So (Symbol), Cs (Surrogate), Cf (Format), Co (Private Use)
    cleaned = []
    for char in text:
        cat = unicodedata.category(char)
        if cat in ("So", "Cs", "Cf", "Co"):
            cleaned.append(" ")
        else:
            cleaned.append(char)
    text = "".join(cleaned)

    # 5. Hapus placeholder dan artefak scraping lainnya
    text = re.sub(r"_{2,}", " ", text)  # __ atau ___
    text = re.sub(r"\?{2,}", " ", text)  # ?? atau ???
    text = re.sub(r"ðŸ\S*", " ", text)  # artefak emoji ðŸ...
    text = re.sub(r"ð\S*", " ", text)  # artefak emoji ð...

    return text


def clean_isolated_punctuation(text: str) -> str:
    """
    Langkah 6: Bersihkan tanda baca yang berdiri sendiri.

    Efek samping penghapusan mention/URL/hashtag adalah tertinggalnya
    tanda baca yang tadinya menempel: '@user.' -> '.' atau '@user!' -> '!'

    Strategi:
    - HAPUS simbol teknis/arrow (->, -->, =>, >>, <<) yang tidak bermakna
      dalam bahasa Indonesia.
    - HAPUS tanda baca NON-EMOSIONAL (. , : ; - & < > | ^ ~ \\ /) jika
      berdiri sendiri di awal, di antara spasi, atau di akhir teks.
    - PERTAHANKAN tanda baca EMOSIONAL (! ?) meski berdiri sendiri -
      model transformer tetap bisa mengambil sinyal emosi darinya.
    """
    # 1. Hapus simbol panah/teknis yang tidak bermakna dalam teks Indonesia
    #    Contoh: '-->' dari 'kucing -->' , '->' , '=>' , '>>' , '<<'
    text = re.sub(r"-{1,2}>|={1,2}>|>{2,}|<{2,}|<-{1,2}", " ", text)

    # 2. Hapus semua karakter non-kata di awal teks (sebelum kata pertama)
    text = re.sub(r"^\s*[^\w]+", "", text)

    # 3. Hapus tanda baca/simbol NON-EMOSIONAL yang berdiri sendiri
    #    di antara dua spasi ATAU di akhir string.
    #    Karakter non-emosional: . , : ; - & > < | ^ ~ \ /
    #    (TIDAK termasuk ! dan ? karena membawa sinyal emosi)
    NON_EMOTIONAL_PUNCT = r"[.,;:\-&><|^~\\/]+"
    # Di antara dua spasi (atau setelah spasi di akhir string)
    text = re.sub(r"\s+" + NON_EMOTIONAL_PUNCT + r"(?=\s|$)", " ", text)
    # Di akhir string (dengan atau tanpa spasi sebelumnya)
    text = re.sub(NON_EMOTIONAL_PUNCT + r"\s*$", "", text)

    # 4. Hapus titik-titik yang terpisah '. . .' - biarkan '...' utuh
    text = re.sub(r"(\.\s+){2,}", " ", text)

    return text


def normalize_whitespace(text: str) -> str:
    """Langkah 6: Normalisasi whitespace — hapus spasi berlebih, strip."""
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def preprocess(text: str) -> str:
    """
    Pipeline preprocessing lengkap.
    Urutan penting: fix encoding dulu sebelum regex lainnya.
    """
    text = str(text)
    text = fix_encoding(text)  # 1. Fix mojibake + HTML entity
    text = remove_urls(text)  # 2. Hapus URL
    text = remove_mentions(text)  # 3. Hapus @mention
    text = convert_hashtags(text)  # 4. Hashtag → teks biasa
    text = remove_emoji_artifacts(text)  # 5. Hapus artefak emoji
    text = clean_isolated_punctuation(text)  # 6. Tanda baca terisolasi
    text = normalize_whitespace(text)  # 7. Normalisasi whitespace
    return text


# ═══════════════════════════════════════════════════════════════════════════
# REPORTING
# ═══════════════════════════════════════════════════════════════════════════


def show_diff_samples(df_before: pd.DataFrame, df_after: pd.DataFrame, n: int = 10):
    """Tampilkan sampel perbandingan sebelum dan sesudah preprocessing."""
    print(f"\n{'─' * 70}")
    print(f"  CONTOH PERUBAHAN TEKS (sampel {n} baris pertama yang berubah)")
    print(f"{'─' * 70}")

    before_texts = df_before[TEXT_COL].astype(str)
    after_texts = df_after[TEXT_COL].astype(str)

    changed = before_texts[before_texts != after_texts]
    shown = 0

    for idx in changed.index:
        if shown >= n:
            break
        b = before_texts[idx]
        a = after_texts[idx]
        print(f"  [{shown + 1}] SEBELUM: {b[:120]}{'...' if len(b) > 120 else ''}")
        print(f"      SESUDAH: {a[:120]}{'...' if len(a) > 120 else ''}")
        print()
        shown += 1

    print(f"  Total baris yang berubah: {len(changed):,} dari {len(df_before):,} baris")


def print_stats(df_before: pd.DataFrame, df_after: pd.DataFrame, name: str):
    """Statistik sebelum vs sesudah preprocessing."""
    b_words = df_before[TEXT_COL].astype(str).apply(lambda x: len(x.split())).mean()
    a_words = df_after[TEXT_COL].astype(str).apply(lambda x: len(x.split())).mean()
    b_chars = df_before[TEXT_COL].astype(str).apply(len).mean()
    a_chars = df_after[TEXT_COL].astype(str).apply(len).mean()

    print(f"\n{'═' * 55}")
    print(f"  STATISTIK — {name}")
    print(f"{'─' * 55}")
    print(f"  {'Metrik':<30} {'Sebelum':>10} {'Sesudah':>10}")
    print(f"{'─' * 55}")
    print(f"  {'Rata-rata panjang (kata)':<30} {b_words:>10.1f} {a_words:>10.1f}")
    print(f"  {'Rata-rata panjang (karakter)':<30} {b_chars:>10.1f} {a_chars:>10.1f}")
    print(f"  {'Total baris':<30} {len(df_before):>10,} {len(df_after):>10,}")

    # Cek sisa noise setelah preprocessing
    after_texts = df_after[TEXT_COL].astype(str)
    print(f"{'─' * 55}")
    print("  Cek sisa noise setelah preprocessing:")
    checks = {
        "URL tersisa": after_texts.str.contains(r"https?://\S+", regex=True).sum(),
        "@mention tersisa": after_texts.str.contains(r"@\w+", regex=True).sum(),
        "Simbol # tersisa": after_texts.str.contains(r"#\w+", regex=True).sum(),
        "Mojibake tersisa (Ã/Â)": after_texts.str.contains(
            r"Ã|Â¿|ï¿", regex=True
        ).sum(),
        "HTML entity (&amp;)": after_texts.str.contains(
            r"&amp;|&lt;|&gt;", regex=True
        ).sum(),
        "Karakter Ñ terisolasi": after_texts.str.contains(
            r"(?<![\w])Ñ(?![\w])", regex=True
        ).sum(),
        "Placeholder __ tersisa": after_texts.str.contains(r"_{2,}", regex=True).sum(),
        "Artefak Arab corrupt": after_texts.str.contains(
            r"[\u0600-\u06FF]{2,}", regex=True
        ).sum(),
        "Punct. terisolasi di awal": after_texts.str.contains(
            r"^[^\w]", regex=True
        ).sum(),
    }
    for label, count in checks.items():
        status = "✓" if count == 0 else "⚠"
        print(f"    {status} {label:<30}: {count:,}")
    print(f"{'═' * 55}")


# ═══════════════════════════════════════════════════════════════════════════
# MAIN PIPELINE
# ═══════════════════════════════════════════════════════════════════════════


def process_dataset(name: str):
    input_path = INPUT_DIR / f"{name}.csv"
    output_path = OUTPUT_DIR / f"{name}.csv"

    if not input_path.exists():
        log.warning(f"  ⚠ File tidak ditemukan: {input_path}")
        return

    log.info(f"\n{'━' * 60}")
    log.info(f"  MEMPROSES: {name}")
    log.info(f"{'━' * 60}")

    # Load
    for enc in ("utf-8", "utf-8-sig", "latin-1"):
        try:
            df = pd.read_csv(
                input_path, sep=DELIMITER, encoding=enc, on_bad_lines="skip"
            )
            log.info(f"  Encoding: {enc} | Baris: {len(df):,}")
            break
        except UnicodeDecodeError:
            continue
    else:
        log.error(f"  ✗ Gagal membaca file {input_path}")
        return

    # Simpan dataframe asli untuk perbandingan
    df_before = df.copy()

    # Terapkan preprocessing dengan progress bar
    log.info("  Menerapkan preprocessing...")
    tqdm.pandas(desc=f"  [{name}]")
    df[TEXT_COL] = df[TEXT_COL].astype(str).progress_apply(preprocess)

    # Tampilkan sampel perubahan
    show_diff_samples(df_before, df)

    # Tampilkan statistik perbandingan
    print_stats(df_before, df, name)

    # Simpan output (hanya 2 kolom asli)
    output_df = df[[TEXT_COL, LABEL_COL]]
    output_df.to_csv(output_path, sep=DELIMITER, index=False, encoding="utf-8")
    log.info(f"\n  ✓ Tersimpan ke: {output_path}")
    log.info(f"  ✓ Total: {len(output_df):,} baris\n")


def main():
    # Cek apakah ftfy terinstall
    try:
        import ftfy  # noqa: F401
    except ImportError:
        log.error("Package 'ftfy' belum terinstall. Jalankan: pip install ftfy")
        sys.exit(1)

    log.info("╔══════════════════════════════════════════════════════════╗")
    log.info("║   Text Preprocessing Pipeline untuk mBERT / XLM-R       ║")
    log.info("║   Minimal Preprocessing — Menjaga Naturalitas Teks      ║")
    log.info("╚══════════════════════════════════════════════════════════╝")
    log.info(f"  Input : {INPUT_DIR}")
    log.info(f"  Output: {OUTPUT_DIR}")

    for name in DATASETS:
        process_dataset(name)

    log.info("╔══════════════════════════════════════════════════════════╗")
    log.info("║   SELESAI! Dataset tersimpan di: Combined/Balanced/Cleaned/       ║")
    log.info("╚══════════════════════════════════════════════════════════╝")


if __name__ == "__main__":
    main()
