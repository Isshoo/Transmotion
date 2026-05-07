import pandas as pd

df = pd.read_csv("app/storage/datasets/combined/balanced/Kesehatan.csv", sep=";")

df.to_excel(
    "app/storage/datasets/combined/balanced/Kesehatan.xlsx",
    index=False,
)
