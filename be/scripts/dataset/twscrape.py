"""
================================================================
SCRAPER ANGGARAN PENDIDIKAN - twscrape via COOKIES (Fixed)
================================================================
LANGKAH:
1. Buka x.com di Chrome, pastikan sudah login
2. Install ekstensi "EditThisCookie" atau "Cookie-Editor"
3. Buka ekstensi → klik Export → copy semua (format JSON)
4. Paste ke file bernama  cookies.json  di folder yang sama
   dengan script ini

ATAU cara manual (tanpa ekstensi):
1. Buka x.com → F12 → Console
2. Ketik perintah ini lalu Enter:
   copy(document.cookie)
3. Paste hasilnya ke variabel RAW_COOKIE_STRING di bawah

Jalankan:
    python twscrape_cookies.py
================================================================
"""

import asyncio
import json
import os
import re
from datetime import datetime

import pandas as pd
from twscrape import API

# ══════════════════════════════════════════════════════════════
# PILIH SALAH SATU CARA INPUT COOKIES
# ══════════════════════════════════════════════════════════════

# CARA A: Paste hasil  copy(document.cookie)  dari Console browser
#         (hapus tanda # di awal dan isi string-nya)
RAW_COOKIE_STRING = """gt=2046934926621028608; __cuid=b4823b0c3a8d4e37abd2e6120976809c; lang=en; dnt=1; guest_id=v1%3A177686489956506230; guest_id_marketing=v1%3A177686489956506230; guest_id_ads=v1%3A177686489956506230; personalization_id="v1_kdAoIFXVtP4vB7tujEb5kg=="; g_state={"i_l":0,"i_ll":1776864906824,"i_e":{"enable_itp_optimization":0},"i_et":1776862294966}; ct0=8b51f22809918209ae9358a9c32460ee625f00c52a456ce18ef8dd4a589a10147e95b874912d5c739639ee2df7d468f26fa86ba30a4ecc591eeb26ea9159ef64e9a4aace880eb8f65943363c1be44a52; twid=u%3D1858809132067024897"""
# Contoh: RAW_COOKIE_STRING = "auth_token=abc123; ct0=xyz789; guest_id=..."

# CARA B: Path ke file cookies.json dari ekstensi Cookie-Editor / EditThisCookie
COOKIES_JSON_FILE = "cookies.json"  # taruh di folder yang sama dengan script

# Username akun X kamu
USERNAME = "@Isshoo25"

# ══════════════════════════════════════════════════════════════
LIMIT_PER_QUERY = 500
OUTPUT_DIR = "./hasil_scraping"

QUERIES = [
    {
        "label": "efisiensi_anggaran_pendidikan",
        "query": "efisiensi anggaran pendidikan lang:id -is:retweet",
    },
    {
        "label": "pemotongan_dana_pendidikan",
        "query": "pemotongan dana pendidikan lang:id -is:retweet",
    },
    {
        "label": "anggaran_pendidikan_exact",
        "query": '"anggaran pendidikan" efisiensi lang:id -is:retweet',
    },
    {"label": "dana_bos_efisiensi", "query": "dana BOS efisiensi lang:id -is:retweet"},
    {
        "label": "kemendikbud_anggaran",
        "query": "Kemendikbud anggaran lang:id -is:retweet",
    },
]


# ══════════════════════════════════════════════════════════════
# FUNGSI PARSE COOKIES
# ══════════════════════════════════════════════════════════════


def parse_cookie_string(raw: str) -> dict:
    """Parse string 'key=val; key2=val2' jadi dict."""
    cookies = {}
    for part in raw.split(";"):
        part = part.strip()
        if "=" in part:
            k, _, v = part.partition("=")
            cookies[k.strip()] = v.strip()
    return cookies


def load_cookies_from_json(path: str) -> dict:
    """
    Baca cookies dari file JSON (format Cookie-Editor / EditThisCookie).
    Mendukung format array [{"name":..,"value":..}] atau dict {name: value}.
    """
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    if isinstance(data, list):
        return {c["name"]: c["value"] for c in data if "name" in c and "value" in c}
    if isinstance(data, dict):
        return data
    raise ValueError("Format cookies.json tidak dikenali")


def get_cookies() -> dict:
    """Ambil cookies dari sumber yang tersedia."""
    # Prioritas 1: raw string dari console
    if RAW_COOKIE_STRING.strip():
        print("[*] Menggunakan cookies dari RAW_COOKIE_STRING")
        return parse_cookie_string(RAW_COOKIE_STRING)

    # Prioritas 2: file JSON
    if os.path.exists(COOKIES_JSON_FILE):
        print(f"[*] Menggunakan cookies dari file: {COOKIES_JSON_FILE}")
        return load_cookies_from_json(COOKIES_JSON_FILE)

    raise RuntimeError(
        "Cookies tidak ditemukan!\n"
        "Isi RAW_COOKIE_STRING  ATAU  letakkan cookies.json di folder yang sama."
    )


def dict_to_cookie_str(cookies: dict) -> str:
    return "; ".join(f"{k}={v}" for k, v in cookies.items())


def cek_cookies_penting(cookies: dict):
    penting = ["auth_token", "ct0"]
    for k in penting:
        if k not in cookies:
            print(
                f"  [!] PERINGATAN: Cookie '{k}' tidak ditemukan — scraping mungkin gagal"
            )
        else:
            val_preview = cookies[k][:8] + "..." if len(cookies[k]) > 8 else cookies[k]
            print(f"  [✓] {k}: {val_preview}")


# ══════════════════════════════════════════════════════════════
# UTILITAS TWEET
# ══════════════════════════════════════════════════════════════


def bersihkan_teks(teks):
    if not teks:
        return ""
    teks = teks.replace("\n", " ").replace("\r", " ")
    return re.sub(r"\s+", " ", teks).strip()


def tweet_ke_dict(tweet, label):
    return {
        "tweet_id": str(tweet.id),
        "tanggal": tweet.date.strftime("%Y-%m-%d %H:%M:%S") if tweet.date else "",
        "username": tweet.user.username if tweet.user else "",
        "display_name": tweet.user.displayname if tweet.user else "",
        "teks": bersihkan_teks(tweet.rawContent),
        "likes": tweet.likeCount or 0,
        "retweet": tweet.retweetCount or 0,
        "reply": tweet.replyCount or 0,
        "views": tweet.viewCount or 0,
        "bahasa": tweet.lang or "",
        "url_tweet": f"https://x.com/{tweet.user.username}/status/{tweet.id}"
        if tweet.user
        else "",
        "sumber_query": label,
    }


# ══════════════════════════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════════════════════════


async def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    tanggal_str = datetime.now().strftime("%Y%m%d_%H%M")

    print("=" * 60)
    print("  SCRAPER ANGGARAN PENDIDIKAN (via Cookies)")
    print(f"  Mulai: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    # Load & validasi cookies
    cookies = get_cookies()
    print("\n[*] Cookie yang ditemukan:")
    cek_cookies_penting(cookies)
    print(f"    Total {len(cookies)} cookies\n")

    cookie_str = dict_to_cookie_str(cookies)

    # Hapus akun lama di DB twscrape agar tidak konflik
    db_path = "accounts.db"
    if os.path.exists(db_path):
        os.remove(db_path)
        print(f"[*] Database lama dihapus: {db_path}")

    api = API()
    await api.pool.add_account(
        username=USERNAME,
        password="dummy_not_used",
        email="dummy@dummy.com",
        email_password="dummy_not_used",
        cookies=cookie_str,
    )
    print(f"[✓] Akun @{USERNAME} siap\n")

    semua_data = []

    for i, q in enumerate(QUERIES, 1):
        print(f"[{i}/{len(QUERIES)}] {q['label']}")
        print(f"         → {q['query']}")

        try:
            hasil = []
            async for tweet in api.search(q["query"], limit=LIMIT_PER_QUERY):
                hasil.append(tweet_ke_dict(tweet, q["label"]))

            print(f"         → Berhasil: {len(hasil)} tweet")

            if hasil:
                df_q = pd.DataFrame(hasil)
                path = os.path.join(OUTPUT_DIR, f"q{i}_{q['label']}_{tanggal_str}.csv")
                df_q.to_csv(path, index=False, encoding="utf-8-sig", sep=";")
                print(f"         → Disimpan : {path}")

            semua_data.extend(hasil)

        except Exception as e:
            print(f"         ✗ Error: {e}")

        if i < len(QUERIES):
            print("         → Jeda 10 detik...\n")
            await asyncio.sleep(10)

    # Gabungkan
    print("\n" + "=" * 60)

    if not semua_data:
        print("[!] Tidak ada data yang berhasil diambil.")
        print("\n  Kemungkinan penyebab:")
        print("  1. Cookies expired → ambil ulang dari browser")
        print("  2. Cookie 'auth_token' atau 'ct0' tidak ada/salah")
        print("  3. Rate limit X → tunggu 15 menit lalu coba lagi")
        return

    df = pd.DataFrame(semua_data)
    sebelum = len(df)
    df.drop_duplicates(subset=["tweet_id"], inplace=True)
    df.sort_values("tanggal", ascending=False, inplace=True)
    df.reset_index(drop=True, inplace=True)

    path_csv = os.path.join(
        OUTPUT_DIR, f"GABUNGAN_anggaran_pendidikan_{tanggal_str}.csv"
    )
    df.to_csv(path_csv, index=False, encoding="utf-8-sig", sep=";")

    path_xlsx = os.path.join(
        OUTPUT_DIR, f"GABUNGAN_anggaran_pendidikan_{tanggal_str}.xlsx"
    )
    with pd.ExcelWriter(path_xlsx, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name="Tweets")
        ws = writer.sheets["Tweets"]
        for col in ws.columns:
            max_len = max(len(str(cell.value or "")) for cell in col)
            ws.column_dimensions[col[0].column_letter].width = min(max_len + 4, 60)

    print(f"[✓] Tweet terkumpul  : {sebelum}  →  unik: {len(df)}")
    print(f"[✓] CSV  → {path_csv}")
    print(f"[✓] XLSX → {path_xlsx}")
    print("\n  Per query:")
    for label, count in df["sumber_query"].value_counts().items():
        print(f"    {label:<42}: {count}")
    print("=" * 60)
    print(f"\n  Selesai: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")


if __name__ == "__main__":
    asyncio.run(main())
