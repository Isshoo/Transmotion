"""
analyze_data.py — Analisis menyeluruh dataset balanced untuk menentukan preprocessing yang tepat.
"""

import pandas as pd

LABEL_MAP = {
    1: "senang",
    2: "percaya",
    3: "terkejut",
    4: "netral",
    5: "takut",
    6: "sedih",
    7: "marah",
}

for name in ["Kesehatan", "Pendidikan"]:
    path = f"/Users/z./Algy/TA/App/emotion-app/mbert-xlmr/Datasets/Combined/Balanced/{name}.csv"
    df = pd.read_csv(path, sep=";", encoding="latin-1")
    texts = df["full_text"].astype(str)

    print(f"\n{'=' * 65}")
    print(f"  ANALISIS DATA: {name}")
    print(f"{'=' * 65}")
    print(f"  Total baris: {len(df):,}")
    print("\n  Distribusi label:")
    for lbl, cnt in df["manual_label"].value_counts().sort_index().items():
        print(f"    Label {lbl} ({LABEL_MAP.get(lbl, '?'):<9}): {cnt:,}")

    # Panjang teks
    word_counts = texts.apply(lambda x: len(x.split()))
    print("\n  Panjang teks (kata):")
    print(f"    Min   : {word_counts.min()}")
    print(f"    Max   : {word_counts.max()}")
    print(f"    Mean  : {word_counts.mean():.1f}")
    print(f"    Median: {word_counts.median():.1f}")

    # Deteksi pattern / noise
    checks = {
        "URL (https/http)": texts.str.contains(r"https?://\S+", regex=True).sum(),
        "@mention": texts.str.contains(r"@\w+", regex=True).sum(),
        "#hashtag": texts.str.contains(r"#\w+", regex=True).sum(),
        "RT (Retweet)": texts.str.contains(r"^RT @", regex=True).sum(),
        "Encoding rusak (mojibake)": texts.str.contains(
            r"Ã¢|ï¿½|Ã©|Â|Ã", regex=True
        ).sum(),
        "HTML entity (&amp;)": texts.str.contains(
            r"&amp;|&lt;|&gt;|&quot;", regex=True
        ).sum(),
        "Teks ALL CAPS (>20c)": texts.apply(
            lambda x: x == x.upper() and len(x) > 20
        ).sum(),
        "Emoji text (__/??)": texts.str.contains(
            r"__|\\?\?\\?\?|ð|ðŸ", regex=True
        ).sum(),
        "Angka dominan (>50%)": texts.apply(
            lambda x: sum(c.isdigit() for c in x) / max(len(x), 1) > 0.5
        ).sum(),
        "Newline literal": texts.str.contains(r"\n", regex=False).sum(),
    }
    print("\n  Pattern/Noise dalam teks:")
    for label, count in checks.items():
        pct = count / len(df) * 100
        print(f"    {label:<30}: {count:>6,}  ({pct:.1f}%)")

    # Contoh encoding rusak
    broken = texts[texts.str.contains(r"Ã¢|ï¿½|Ã©|Â|Ã", regex=True)]
    if len(broken) > 0:
        print("\n  Contoh encoding rusak (max 5):")
        for i, t in enumerate(broken.head(5)):
            preview = t[:140] + "..." if len(t) > 140 else t
            print(f"    [{i + 1}] {preview}")

    # Contoh teks per kelas
    print("\n  Sampel teks per kelas emosi:")
    for lbl in sorted(df["manual_label"].unique()):
        sample = str(df[df["manual_label"] == lbl].iloc[0]["full_text"])
        preview = sample[:140] + "..." if len(sample) > 140 else sample
        print(f"    Kelas {lbl} ({LABEL_MAP.get(lbl, '?'):<9}): {preview}")

    # Cek bahasa campuran / karakter non-latin
    has_non_latin = texts.str.contains(r"[^\x00-\x7FÀ-ÿ\s]", regex=True).sum()
    print(
        f"\n  Karakter non-ASCII/Latin: {has_non_latin:,} ({has_non_latin / len(df) * 100:.1f}%)"
    )

print(f"\n{'=' * 65}")
print("  ANALISIS SELESAI")
print(f"{'=' * 65}")
