# Variabel
PYTHON = .venv/bin/python
PIP = .venv/bin/pip
FLASK = .venv/bin/flask
RUFF = .venv/bin/ruff
GUNICORN = .venv/bin/gunicorn
WAITRESS = .venv/bin/waitress-serve

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
	$(PIP) install --upgrade pip

install:
	$(PIP) install -r requirements.txt

# Menjalankan Aplikasi
dev:
	$(PYTHON) server.py

gunicorn:
	$(GUNICORN) server:app --bind 0.0.0.0:5000

waitress:
	$(WAITRESS) --host=0.0.0.0 --port=5000 server:app

# Database (Flask-Migrate)
db-init:
	$(FLASK) db init

# make db-migrate msg="Auto migration"
db-migrate:
	$(FLASK) db migrate -m "$(msg)"

db-upgrade:
	$(FLASK) db upgrade

# Scripts (Menjalankan file di folder scripts/)
seed:
	$(PYTHON) scripts/db/seed.py

db-reset:
	$(PYTHON) scripts/db/reset_db.py

create-admin:
	$(PYTHON) scripts/db/create_admin.py

data-prep:
	$(PYTHON) scripts/dataset/preprocess_dataset.py

# Kualitas Kode
lint:
	$(RUFF) check .

format:
	$(RUFF) format .

# Pembersihan
clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
