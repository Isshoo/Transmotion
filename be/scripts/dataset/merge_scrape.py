import os

import pandas as pd

sectors = ["pendidikan", "kesehatan"]

for sector in sectors:
    input_dir = f"app/storage/scraped_data/{sector}"
    all_data = []

    # baca semua file excel
    for file in os.listdir(input_dir):
        if file.endswith(".xlsx"):
            file_path = os.path.join(input_dir, file)
            df = pd.read_excel(file_path)

            # ambil kolom full_text saja
            if "full_text" in df.columns:
                all_data.append(df[["full_text"]])

    # gabungkan semua data
    combined_df = pd.concat(all_data, ignore_index=True)

    combined_df["full_text"] = combined_df["full_text"].str.replace(
        "\n", " ", regex=True
    )
    combined_df["full_text"] = combined_df["full_text"].str.strip()

    combined_df = combined_df.dropna(subset=["full_text"])

    # hapus duplikat berdasarkan full_text
    combined_df = combined_df.drop_duplicates(subset=["full_text"])

    # reset index
    combined_df = combined_df.reset_index(drop=True)

    # tambah kolom label kosong
    combined_df["manual_label"] = ""
    combined_df["text_label"] = ""

    # simpan hasil akhir
    output_path = f"app/storage/scraped_data/combined/{sector}.xlsx"
    combined_df.to_excel(output_path, index=False)

    print(f"✅ Dataset {sector} selesai: {len(combined_df)} data")
