.PHONY: help venv install dev db-init db-migrate db-upgrade lint format clean seed db-reset create-admin data-prep

help:
	@echo "Perintah yang tersedia:"
	@echo "  make venv          : Membuat virtual environment"
	@echo "  make install       : Instalasi library dari requirements.txt"
	@echo "  make dev           : Jalankan server development"
	@echo "  make db-init       : Inisialisasi Flask-Migrate"
	@echo "  make db-migrate    : Buat file migrasi baru"
	@echo "  make db-upgrade    : Terapkan migrasi ke database"
	@echo "  make seed          : Isi database dengan data awal (seed.py)"
	@echo "  make db-reset      : Reset database ke kondisi awal (reset_db.py)"
	@echo "  make create-admin  : Buat akun admin baru (create_admin.py)"
	@echo "  make data-prep     : Jalankan pembersihan dataset (preprocess_dataset.py)"
	@echo "  make lint          : Cek kualitas kode"
	@echo "  make format        : Rapikan kode"
	@echo "  make clean         : Hapus file sampah (__pycache__)"

# Lingkungan
venv:
	python3 -m venv .venv
	pip install --upgrade pip

install:
	pip install -r requirements.txt

# Menjalankan Aplikasi
dev:
	python server.py

gunicorn:
	gunicorn server:app --bind 0.0.0.0:5000

waitress:
	waitress-serve --host=0.0.0.0 --port=5000 server:app

# Database (Flask-Migrate)
db-init:
	flask db init

# make db-migrate msg="Auto migration"
db-migrate:
	flask db migrate -m "$(or $(msg),Auto migration)"

db-upgrade:
	flask db upgrade

# Scripts (Menjalankan file di folder scripts/)
seed:
	python scripts/db/seed.py

db-reset:
	python scripts/db/reset_db.py

create-admin:
	python scripts/db/create_admin.py

data-prep:
	python scripts/dataset/preprocess_dataset.py

scrape:
	bash scripts/dataset/harvestscrape.sh

excel2csv:
	python scripts/dataset/excel_to_csv.py

csv2excel:
	python scripts/dataset/csv_to_excel.py

# Kualitas Kode
lint:
	ruff check .

format:
	ruff format .

# Pembersihan
clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
