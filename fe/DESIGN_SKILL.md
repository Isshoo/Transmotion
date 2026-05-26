# Design Implementation Skill

## Sebelum mulai redesign satu komponen:

1. Baca CLAUDE.md untuk design system
2. Identifikasi semua elemen visual yang ada (card, table, button, badge, form)
3. JANGAN ubah state, props, handler apapun
4. Gunakan hanya CSS variables dari globals.css
5. Test mental: "apakah logika masih sama setelah perubahan ini?" → jika tidak yakin, jangan ubah

## Checklist per halaman:

- [ ] Background menggunakan CSS variable (bukan hardcode warna)
- [ ] Semua teks menggunakan text-(--text-\*)
- [ ] Semua border menggunakan border-(--border-\*)
- [ ] Button primary menggunakan var(--accent)
- [ ] Hover state ada di semua elemen interaktif
- [ ] Loading state terlihat natural (skeleton atau spinner)
- [ ] Empty state punya visual yang menarik
- [ ] Error state punya styling yang jelas
- [ ] Responsive untuk lebar minimal 1280px (desktop admin tool)

## Anti-pattern yang harus dihindari:

- ❌ `bg-white`, `bg-gray-*`, `text-gray-*` (gunakan CSS variable)
- ❌ `border-gray-200` (gunakan border-(--border-default))
- ❌ `shadow-sm` default tailwind (gunakan shadow-(--shadow-\*))
- ❌ Warna biru `blue-*` untuk tombol (gunakan accent indigo)
- ❌ Semua card radius sama rata-rata `rounded-lg`
- ❌ Teks bold untuk semua heading
- ❌ Icon terlalu besar (gunakan size={14} atau size={16} untuk inline)
- ❌ Gap dan padding tidak konsisten per halaman
