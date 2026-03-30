# Transmotion - Frontend

## Prasayarat

- Node.js (v24 atau lebih baru)
- npm (v11 atau lebih baru)

## Setup

### 1. Clone Repository

```bash
git clone https://github.com/Isshoo/Transmotion.git
```

```bash
cd Transmotion/fe # pindah ke folder frontend
```

### 2. Install Dependensi

```bash
npm install
```

### 3. Konfigurasi Environment

Salin environment variables dari `.env.example` ke `.env`

```bash
cp .env.example .env
```

Edit environment variables di `.env` dengan konfigurasi yang sesuai

### 4. Jalankan Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

> **Note:** Pastikan backend API sudah berjalan di `NEXT_PUBLIC_API_URL` sebelum menggunakan fitur autentikasi.
