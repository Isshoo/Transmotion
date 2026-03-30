# Transmotion - Backend

## Prasayarat

- Python (v3.13 atau lebih baru)
- PostgreSQL (v17 atau lebih baru)

## Setup

### 1. Clone Repository

```bash
git clone https://github.com/Isshoo/Transmotion.git
```

```bash
cd Transmotion/be # pindah ke folder backend
```

### 2. Setup Database (PostgreSQL)

Masuk to PostgreSQL

```bash
psql -U postgres # jika password diperlukan, masukkan password
```

Jika berhasil akan masuk ke terminal PostgreSQL ditandai dengan `postgres=#`

Selanjutnya buat database dengan perintah berikut:

```sql
CREATE DATABASE transmotion;
```

Jika sudah selesai, keluar dari PostgreSQL dengan perintah berikut:

```sql
\q
```

### 3. Buat Virtual Environment

```bash
python3 -m venv .venv
```

Jika virtual environment sudah dibuat, aktifkan dengan perintah berikut:

```bash
source .venv/bin/activate  # macOS/Linux
# atau
.venv\Scripts\activate     # Windows
```

### 4. Install Dependensi

```bash
pip install -r requirements.txt
```

### 5. Konfigurasi Environment

Salin environment variables dari `.env.example` ke `.env`

```bash
cp .env.example .env
```

Edit environment variables di `.env` dengan konfigurasi yang sesuai

### 6. Setup Migrasi Database

Pastikan DATABASE_URL di `.env` sudah benar

```bash
# Inisialisasi migrasi (Hanya sekali di awal)
flask db init

# Membuat migrasi (Hanya pertama kali atau jika ada perubahan pada model)
flask db migrate -m "Initial migration"

# Upgrade database setelah migrasi
flask db upgrade
```

### 7. Jalankan Server

```bash
python server.py # Development

gunicorn server:app --bind 0.0.0.0:5000 # Production (gunicorn)
# or
waitress-serve --host=0.0.0.0 --port=5000 server:app # Production (waitress)
```

Server akan berjalan sesuai dengan host dan port yang ditentukan di `.env`

## Scripts

### Create Admin

```bash
python -m scripts.db.create_admin
```

Interactive script untuk membuat admin user baru.

### Seed Database

```bash
python -m scripts.db.seed
```

Membuat sample users:

- <admin@example.com> | Admin123!
- <user1@example.com> | User123!
- <user2@example.com> | User123!

### Reset Database

```bash
python -m scripts.db.reset_db
```

Mereset seluruh data dan tabel dalam database.

**Penting:**
Setelah reset, database dalam keadaan kosong, jangan lupa upgrade database untuk membuat tabel kembali.

```bash
# Upgrade database
flask db upgrade
```

Atau untuk lebih aman hapus isi folder migrations/versions dan jalankan migrasi dari awal.

```bash
# Hapus isi folder migrations/versions
rm -rf migrations/versions/*

# Migrate dan upgrade
flask db migrate -m "Initial migration"
flask db upgrade
```
