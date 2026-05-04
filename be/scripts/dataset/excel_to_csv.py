import pandas as pd

df = pd.read_excel(
    "app/storage/datasets/combined/base/Pendidikan.xlsx"
)  # atau read_csv

df.to_csv("app/storage/datasets/combined/base/Pendidikan.csv", sep=";", index=False)
