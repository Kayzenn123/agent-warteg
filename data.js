// DATA LAUK — WARKOP "WARTEG BERITA BAHAGIA", edisi Hari 10
// Persona: Mas Warteg (hangat, ceplas-ceplos, sopan)
// harga: null = diisi tahap build dari research.md
// id: slug unik; kategori: 'nasi' | 'ayam' | 'ikan' | 'telur' | 'sayur' | 'gorengan' | 'pelengkap' | 'minum'

const MENU = [
  {
    id: "nasi-putih",
    nama: "Nasi Putih",
    harga: 6000, // Warteg Barokah/Putra Jaya/Timbul Jaya/Mekar Bahari 5-8rb
    kategori: "nasi",
    deskripsi: "Pulen anget, ngebul pas disendok — pondasi segala lauk, jangan diremehkan.",
  },
  {
    id: "ayam-goreng",
    nama: "Ayam Goreng",
    harga: 12000, // Tanjung Sari/Tiole/Jayabahari/Timbul Jaya/Barokah 10-14rb
    kategori: "ayam",
    deskripsi: "Kulitnya krispi dalemnya juicy — ayamnya mandi bumbu semaleman.",
  },
  {
    id: "ayam-bakar",
    nama: "Ayam Bakar",
    harga: 13000, // Warteg 21/Jayabahari/Timbul Jaya/Ayu Pasar Baru 11-15rb
    kategori: "ayam",
    deskripsi: "Dibakar pelan sampai bumbu meresap — asapnya aja udah bikin nengok.",
  },
  {
    id: "lele-goreng",
    nama: "Lele Goreng",
    harga: 10000, // Khani/Bahari Cibubur/Putra Jaya/Barokah 7-11rb
    kategori: "ikan",
    deskripsi: "Garing di luar, empuk di dalam — temen paling setia sambal terasi.",
  },
  {
    id: "bandeng-presto",
    nama: "Bandeng Presto",
    harga: 10000, // Bandeng goreng Jayabahari/Bahari Cibubur/Putra Jaya/Mekar Bahari 8.9-11rb
    kategori: "ikan",
    deskripsi: "Durinya lumer tinggal kunyah — bandeng tanpa drama tulang nyangkut.",
  },
  {
    id: "telur-dadar",
    nama: "Telur Dadar",
    harga: 6000, // Khani/Putra Jaya/Barokah/Putra Bahari/Pak Jo 4-8rb
    kategori: "telur",
    deskripsi: "Tebal, ngembang, pinggirnya garing — penyelamat dompet paling elegan.",
  },
  {
    id: "telur-balado",
    nama: "Telur Balado",
    harga: 6000, // Putra Jaya/Barokah/Mekar Bahari 5-7.5rb
    kategori: "telur",
    deskripsi: "Rebus, goreng, balur cabai merah — tiga babak satu kenikmatan pedas.",
  },
  {
    id: "tempe-orek",
    nama: "Tempe Orek",
    harga: 5000, // Putra Jaya/Barokah/Timbul Jaya 3-7rb
    kategori: "pelengkap",
    deskripsi: "Irisan tipis karamel kecap — sekali nyendok, susah berhenti.",
  },
  {
    id: "tempe-mendoan",
    nama: "Tempe Mendoan",
    harga: 5000, // single-source // SINGLE-SOURCE: Warteg Sop Iga Cakra Kembang Raya
    kategori: "gorengan",
    deskripsi: "Setengah mateng itu sengaja — lembut di dalam, kriuk tipis di luar.",
  },
  {
    id: "sayur-asem",
    nama: "Sayur Asem",
    harga: 5000, // Kharisma/Niki 1/Pak Jo/Curug 4-7rb
    kategori: "sayur",
    deskripsi: "Seger asemnya pas, isi jagung sama labu — penyeimbang segala gorengan.",
  },
  {
    id: "sayur-lodeh",
    nama: "Sayur Lodeh",
    harga: 5000, // Kharisma/Niki 1/Timbul Jaya 4-7rb
    kategori: "sayur",
    deskripsi: "Kuah santan gurih hangat — labu, kacang panjang, terong, satu panggung.",
  },
  {
    id: "usus-ayam-tumis",
    nama: "Usus Ayam Tumis",
    harga: 6000, // Warteg 54/Jayabahari/Barokah/Timbul Jaya 5-8rb
    kategori: "ayam",
    deskripsi: "Kenyal-kenyal pedas manis — jeroan naik kelas, jangan takut nyoba.",
  },
  {
    id: "ati-ampela",
    nama: "Ati Ampela",
    harga: 8000, // Warteg 54/Berhias/Jayabahari 6.5-11rb
    kategori: "ayam",
    deskripsi: "Gurih berbumbu meresap — buat yang paham, ini harta karun beneran.",
  },
  {
    id: "kikil-cabe-ijo",
    nama: "Kikil Cabe Ijo",
    harga: 6000, // Warteg 54/Barokah/Jayabahari/Timbul Jaya 5-8rb
    kategori: "pelengkap",
    deskripsi: "Kenyalnya nagih, pedas ijonya nendang — gigitan pertama langsung sadar.",
  },
  {
    id: "semur-jengkol",
    nama: "Semur Jengkol",
    harga: 6000, // Warteg 54/Putra Jaya/Barokah/Timbul Jaya 5-8rb
    kategori: "pelengkap",
    deskripsi: "Legit empuk bumbu semur — yang nyinyir belum pernah nyicip serius.",
  },
  {
    id: "teri-kacang",
    nama: "Teri Kacang",
    harga: 6000, // Putra Jaya/Jayabahari/Yati/Timbul Jaya 5-8rb
    kategori: "pelengkap",
    deskripsi: "Garing-garing gurih asin manis — taburan yang bikin nasi nambah sendiri.",
  },
  {
    id: "bakwan-jagung",
    nama: "Bakwan Jagung",
    harga: 2680, // single-source // SINGLE-SOURCE: Warteg Warmo Tebet
    kategori: "gorengan",
    deskripsi: "Jagung manis adonan kriuk — temen ngopi, temen nasi, temen segalanya.",
  },
  {
    id: "es-teh-manis",
    nama: "Es Teh Manis",
    harga: 5000, // Khani/Selera/Mubarokah/Adik Bima 5-6rb
    kategori: "minum",
    deskripsi: "Tehnya pekat, esnya nguwel — pemadam kebakaran mulut paling ampuh.",
  },
];
