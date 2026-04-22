#!/bin/bash
# --- KONFIGURASI ---
TOKEN="d7989655c0d6f9efd956437ca6fc2cf630216b9d"
KEYWORD="pemotongan dana kesehatan"
LIMIT=500
OUTPUT_DIR="app/storage/scrape_data"
TANGGAL=$(date +%Y%m%d)
EXT="xlsx"
# --- EKSEKUSI ---
npx tweet-harvest@latest \
  -s "$KEYWORD lang:id -is:retweet" \
  -l $LIMIT \
  -t "$TOKEN" \
  -o "${OUTPUT_DIR}/${KEYWORD// /_}_${TANGGAL}.$EXT"
