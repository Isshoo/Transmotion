import pandas as pd

df = pd.read_excel(
    "app/storage/datasets/combined/base/Pendidikan.xlsx"
)  # atau read_csv

label_map = {
    1: "senang",
    2: "percaya",
    3: "terkejut",
    4: "netral",
    5: "takut",
    6: "sedih",
    7: "marah",
}

df["text_label"] = df["manual_label"].map(label_map)

df.to_excel("file_output2.xlsx", index=False)
