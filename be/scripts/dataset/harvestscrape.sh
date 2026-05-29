#!/bin/bash
# --- KONFIGURASI ---
TOKEN="00a2ff616e57694c88b3f78963e9b6d3d35212fd"
KEYWORD="efisiensi anggaran kesehatan gaji"
LIMIT=500
OUTPUT_DIR="kesehatan"
TANGGAL=$(date +%Y%m%d)
EXT="xlsx"
# --- EKSEKUSI ---
npx tweet-harvest@latest \
  -s "$KEYWORD lang:id -is:retweet" \
  -l $LIMIT \
  -t "$TOKEN" \
  -o "${OUTPUT_DIR}/${KEYWORD// /_}_${TANGGAL}.csv"
