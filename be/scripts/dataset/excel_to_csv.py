import pandas as pd

df = pd.read_excel("app/storage/datasets/combined/balanced/Kesehatan.xlsx")

df.to_csv("app/storage/datasets/combined/balanced/Kesehatan.csv", sep=";", index=False)
