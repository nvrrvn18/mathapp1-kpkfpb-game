# Misi Kota Bilangan - KPK dan FPB (Game V8)

Aplikasi pembelajaran interaktif Matematika Kelas VII berbasis HTML, CSS, dan Vanilla JavaScript. Versi ini mengubah alur KPK dan FPB menjadi pengalaman mission-based tanpa menghilangkan aktivitas belajar yang sudah ada.

## Konsep game

Siswa berperan sebagai Penjelajah Bilangan dan menyelesaikan wilayah secara berurutan:

1. **Misi 1 - Bengkel Faktor**: eksplorasi pictorial faktor dan bilangan prima.
2. **Misi 2 - Kota Lampu**: menemukan KPK dari kejadian berulang.
3. **Misi 3 - Laboratorium Kelipatan**: tantangan kelipatan, pohon faktor, dan KPK.
4. **Misi 4 - Pusat Pembagian**: menemukan FPB melalui pengelompokan dan pasangan faktor.
5. **Misi 5 - Gudang Paket**: penerapan KPK dan FPB.
6. **Misi Akhir - Dewan Kota Bilangan**: evaluasi 10 soal.

Tidak ada sistem nyawa atau penalti karena salah. Kesalahan tetap menjadi bagian dari eksplorasi. Reward diberikan saat siswa menemukan konsep atau menuntaskan misi.

## Fitur game yang ditambahkan

- Peta petualangan dengan wilayah terkunci/terbuka/selesai.
- Bintang penguasaan 1-3 untuk setiap misi. Bintang tidak berdasarkan kecepatan.
- Koleksi Penemuan berisi konsep matematika yang ditemukan siswa.
- Efek **Penemuan Baru** pada milestone pembelajaran.
- Mission HUD pada setiap modul yang menampilkan tujuan, progres, dan bintang.
- Pemandu ringan bernama Nara pada halaman awal.
- Progress dan koleksi tersimpan di `localStorage`.
- Progress utama sekarang memasukkan Misi Akhir sehingga 100% diperoleh setelah evaluasi selesai.
- Tetap mobile-first dan seluruh drag penting memiliki pola tap yang nyaman di HP.

## Fitur pembelajaran yang dipertahankan

- Eksplorasi faktor pictorial 4, 6, 8, 10, 12 serta bilangan prima 3 dan 5.
- Simulasi dua lampu dan garis bilangan KPK.
- Pemilihan faktor prima berpangkat terbesar untuk KPK.
- Pohon faktor interaktif.
- Pasangan faktor dan visual pembagian benda untuk FPB.
- Pemilihan faktor prima berpangkat terkecil untuk FPB.
- Matching KPK/FPB dan soal penerapan.
- Evaluasi akhir, skor, progress, fullscreen, suara, dan reset progress.

## Struktur file

```text
index.html
css/
  style.css
  responsive.css
  animation.css
  factor-exploration.css
  game.css
js/
  app.js
  navigation.js
  progress.js
  interactions.js
  factor-tools.js
  factor-exploration.js
  kpk.js
  fpb.js
  quiz.js
  game.js
data/
  questions.json
assets/
  images/
  icons/
.nojekyll
README.md
```

## Mengubah teks

Mayoritas teks materi berada di `index.html`.

- Feedback KPK: `js/kpk.js`
- Feedback FPB: `js/fpb.js`
- Soal evaluasi: `data/questions.json`
- Nama wilayah, deskripsi misi, koleksi, dan sistem bintang: `js/game.js`
- Tampilan game: `css/game.css`

Hindari mengubah `id`, `data-value`, `data-screen`, atau nama fungsi JavaScript jika hanya ingin memperbaiki kalimat.

## Menjalankan aplikasi

Buka `index.html` melalui web server statis. Untuk pengujian lokal, salah satu cara sederhana adalah:

```bash
python -m http.server 8000
```

lalu buka `http://localhost:8000`.

## GitHub Pages

1. Unggah seluruh isi folder ini ke root repository GitHub.
2. Buka **Settings > Pages**.
3. Pilih **Deploy from a branch**.
4. Pilih branch `main` dan folder `/ (root)`.
5. Simpan dan buka alamat GitHub Pages yang diberikan.

Aplikasi tidak membutuhkan backend.
