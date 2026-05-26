# Transmotion — AI Agent Instructions

## Project Overview
Transmotion adalah aplikasi web untuk manajemen dan deployment model klasifikasi teks
berbasis mBERT dan XLM-R. Stack: Next.js (frontend) + Flask (backend).

## CRITICAL RULES — TIDAK BOLEH DILANGGAR
1. **JANGAN ubah logika, fungsi, API call, state management, atau apapun selain JSX dan styling**
2. **JANGAN hapus atau ubah props, handler, hook, store import**
3. **JANGAN ubah struktur komponen — hanya className, elemen wrapper kosmetik, dan konten teks label**
4. Jika ragu antara logika vs visual → tanya dulu, jangan ubah

## Design System

### Filosofi
- **Dark enterprise modern with optional light mode** — seperti Linear/Vercel, bukan Tailwind default
- Hierarchy lewat contrast dan ukuran, BUKAN lewat warna berbeda-beda
- Satu accent color: `#6366f1` (indigo) — jangan tambah warna lain kecuali semantic
- Whitespace agresif — lebih baik terlalu banyak ruang daripada penuh sesak
- Micro-interaction pada hover/focus — subtle, bukan berlebihan

### CSS Variables (wajib gunakan, jangan hardcode warna)
Lihat `fe/src/app/globals.css` untuk token lengkap.

Penggunaan:
- Background: `bg-[var(--bg-base)]`, `bg-[var(--bg-surface)]`, `bg-[var(--bg-elevated)]`
- Text: `text-[var(--text-primary)]`, `text-[var(--text-secondary)]`
- Border: `border-[var(--border-default)]`
- Accent: `bg-[var(--accent)]`, `text-[var(--accent)]`

### Typography
- Heading halaman: `text-xl font-semibold tracking-tight text-[var(--text-primary)]`
- Sub-heading section: `text-xs font-semibold uppercase tracking-widest text-[var(--text-tertiary)]`
- Body: `text-sm text-[var(--text-secondary)]`
- Label kecil: `text-xs text-[var(--text-tertiary)]`
- Monospace (ID, kode): `font-mono text-xs`
- JANGAN gunakan font-bold untuk heading — gunakan font-semibold atau font-medium

### Komponen standar

**Card/Panel:**
```jsx
<div className="rounded-lg border border-(--border-default) bg-(--bg-surface) p-5">
```

**Tombol Primary:**
```jsx
<button className="inline-flex items-center gap-2 rounded-md bg-(--accent) px-4 py-2 text-sm font-medium text-white transition-all hover:bg-(--accent-hover) hover:shadow-(--shadow-accent) active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed">
```

**Tombol Secondary/Ghost:**
```jsx
<button className="inline-flex items-center gap-2 rounded-md border border-(--border-default) bg-transparent px-4 py-2 text-sm font-medium text-(--text-secondary) transition-all hover:border-(--border-strong) hover:text-(--text-primary) hover:bg-(--bg-overlay)">
```

**Input:**
```jsx
<input className="w-full rounded-md border border-(--border-default) bg-(--bg-elevated) px-3 py-2 text-sm text-(--text-primary) placeholder:text-(--text-disabled) outline-none transition-all focus:border-(--accent) focus:ring-2 focus:ring-(--accent-muted)">
```

**Badge:**
```jsx
// Success
<span className="inline-flex items-center gap-1 rounded-full bg-(--success-muted) px-2.5 py-0.5 text-xs font-medium text-(--success)">
// Error
<span className="inline-flex items-center gap-1 rounded-full bg-(--error-muted) px-2.5 py-0.5 text-xs font-medium text-(--error)">
```

**Divider section:**
```jsx
<p className="mb-3 text-xs font-semibold uppercase tracking-widest text-(--text-tertiary)">
```

**Skeleton loading:**
```jsx
<div className="animate-pulse rounded-md bg-(--bg-elevated)">
```

### Tabel
- Header: `bg-[var(--bg-elevated)] text-[var(--text-tertiary)] text-xs uppercase tracking-wider`
- Row hover: `hover:bg-[var(--bg-overlay)] transition-colors`
- Border: `divide-y divide-[var(--border-subtle)]`

### Sidebar
- Background: `bg-[var(--bg-surface)] border-r border-[var(--border-default)]`
- Nav item aktif: `bg-[var(--accent-muted)] text-[var(--accent)] border-r-2 border-[var(--accent)]`
- Nav item hover: `hover:bg-[var(--bg-overlay)] text-[var(--text-primary)]`

## Halaman yang ada (urutan pengerjaan)
1. Layout (Sidebar + Header) — kerjakan pertama, efek ke semua halaman
2. Dataset list + Dataset detail
3. Training page
4. Model list + Model detail
5. Testing page
6. Evaluation page
7. User management (admin)
8. Auth pages (login, register, dll)
9. Public pages (home, dashboard/classify, dll)

## Yang TIDAK boleh diubah
- `useSSE`, `useDatasetStore`, `useTrainingStore`, dsb
- `api.js` files
- Backend files apapun
- Route structure Next.js
- `store.js` files
- `helpers/`, `libs/`, `hooks/` (kecuali `useMediaQuery` jika perlu)