import os

import pandas as pd

sectors = ["pendidikan", "kesehatan"]

for sector in sectors:
    input_dir = f"tweets-data/{sector}"
    output_dir = f"app/storage/scraped_data/{sector}"

    os.makedirs(output_dir, exist_ok=True)

    for file in os.listdir(input_dir):
        if file.endswith(".csv"):
            input_path = os.path.join(input_dir, file)
            output_path = os.path.join(output_dir, file.replace(".csv", ".xlsx"))

            df = pd.read_csv(input_path, on_bad_lines="skip")
            df.to_excel(output_path, index=False)

            print(f"{sector}: {file} selesai")
