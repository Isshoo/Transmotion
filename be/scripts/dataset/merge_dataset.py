import pandas as pd

sectors = ["pendidikan", "kesehatan"]

for sector in sectors:
    input_dir_1 = f"app/storage/datasets/old/{sector}/{sector}.xlsx"
    input_dir_2 = f"app/storage/datasets/scraped/{sector}/{sector}.xlsx"
    all_data = []

    # baca semua file excel
    for file in [input_dir_1, input_dir_2]:
        df = pd.read_excel(file)

        # ambil semua kolom
        all_data.append(df)

    # gabungkan semua data
    combined_df = pd.concat(all_data, ignore_index=True)

    combined_df = combined_df.dropna(subset=["full_text"])

    # hapus duplikat berdasarkan full_text
    combined_df = combined_df.drop_duplicates(subset=["full_text"])

    # reset index
    combined_df = combined_df.reset_index(drop=True)

    # simpan hasil akhir
    output_path = f"app/storage/datasets/combined/new/{sector}.xlsx"
    combined_df.to_excel(output_path, index=False)

    print(f"✅ Dataset {sector} selesai: {len(combined_df)} data")
