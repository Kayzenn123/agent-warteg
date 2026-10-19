# WARTEG — Koran Lauk Harian

Satu edisi koran harian warung tegal yang interaktif: masthead raksasa "WARTEG",
rubrik lauk multi-kolom, dan 18 kartu lauk bergaya kartu remi (indeks sudut
rank+suit per kategori, mis. A♥︎ untuk Ayam). Pilih lauk, isi piring, hitung
total, patungan split bill, lalu unduh atau salin struk — semua client-side,
tanpa akun, tanpa fetch eksternal.

**Live:** https://kayzenn123.github.io/agent-warteg/

## Fitur
- Koran multi-kolom: masthead + "Edisi 2026-10-19", 8 rubrik kategori, 18 kartu lauk
- Kartu remi: indeks sudut rank+suit per kategori (N♠︎ A♥︎ I♦︎ T♣︎ S♠︎ G♥︎ P♦︎ M♣︎, dengan U+FE0E agar glyph teks)
- Cari (debounce) + saring kategori (chips), status hasil kosong bersuara Mas Warteg
- Piring: tambah/kurang qty per lauk, input qty langsung (validasi), total berjalan format Rp id-ID
- Kalkulator patungan: jumlah orang + pembulatan pas / ke atas Rp1.000 + salin ringkasan
- Struk: unduh JSON (item, qty, harga, total, patungan, timestamp) + salin versi teks
- Deep-link `?menu=id:qty,id:qty` (diparse saat load) + tombol "Bagikan piring" salin URL
- localStorage berversi `warteg-v1` (piring + preferensi) + tombol "Kosongkan"
- State didesain: boot overlay "mencetak koran…", piring kosong, cari kosong, error unduh/salin/qty/storage
- Easter egg: ketik `kenyang` di mana saja → cap stempel "KENYANG MAKSIMAL" jatuh di struk
- Gerak A–E: parallax 5 layer + zoom out akhir · 2 band marquee vertikal berlawanan arah + skew velocity + tombol jeda (WCAG 2.2.2) · denyut sumbu wght Roboto Slab · tilt 3D kartu (pointer + tap) · garis rubrik draw-on + kartu muncul "dicap"
- Hormat `prefers-reduced-motion` + toggle manual "Gerak: nyala/mati" + mode ringan otomatis (CPU ≤4 / Save-Data / fps<40)

## Tech
HTML + CSS + JS polos (tanpa build, tanpa dependensi runtime). Font self-host
(Fontsource, OFL): Roboto Slab variable (display, sumbu wght 100–900), Ojuju
variable (body), Henny Penny (aksen stempel). Ikon: sprite `icons.svg` (20 simbol
gaya garis putus-putus, dipakai via `<use href="icons.svg#i-…">`). Teknik
orisinal: grain feTurbulence + halftone dot radial-gradient + ornamen garis
putus-putus; suit kartu remi sebagai tipografi, bukan gambar.

## Skor
- Lighthouse: mobile **98**/100/100/100, desktop **91**/100/100/100 (diukur 2026-10-19 via chromium remote-debugging)
- Target: ≥90 semua kategori, mobile-first 360px, tanpa horizontal scroll, tap target ≥44px

## Jalankan lokal
```sh
cd site && python3 -m http.server 8910   # buka http://localhost:8910/index.html
```

## Kredit aset
- Font: Roboto Slab, Ojuju, Henny Penny — SIL Open Font License (fontsource.org)
- Ikon: path Lucide (ISC/MIT) + 3 custom (piring, sendok-garpu silang, struk sobek) — `icons.svg`
- Data harga: riset menu warteg Jakarta 2025–2026 (`research.md`); disclaimer: harga patokan, tiap warteg bisa beda dikit
- 30 Days of Code · Hari 10/30 · 2026-10-19
