/* WARTEG — Koran Lauk Harian · logika aplikasi (tanpa build, tanpa fetch eksternal) */
(function () {
  'use strict';

  var VS = '︎'; // U+FE0E variation selector — glyph teks, bukan emoji

  var KAT = {
    nasi:      { label: 'Nasi',      rank: 'N', suit: '♠', merah: false, warna: 'var(--gold)' },
    ayam:      { label: 'Ayam',      rank: 'A', suit: '♥', merah: true,  warna: 'var(--suit-merah)' },
    ikan:      { label: 'Ikan',      rank: 'I', suit: '♦', merah: true,  warna: 'var(--accent)' },
    telur:     { label: 'Telur',     rank: 'T', suit: '♣', merah: false, warna: 'var(--gold)' },
    sayur:     { label: 'Sayur',     rank: 'S', suit: '♠', merah: false, warna: 'var(--pop)' },
    gorengan:  { label: 'Gorengan',  rank: 'G', suit: '♥', merah: true,  warna: 'var(--suit-merah)' },
    pelengkap: { label: 'Pelengkap', rank: 'P', suit: '♦', merah: true,  warna: 'var(--gold)' },
    minum:     { label: 'Minum',     rank: 'M', suit: '♣', merah: false, warna: 'var(--accent2)' }
  };
  var URUT_KAT = ['nasi', 'ayam', 'ikan', 'telur', 'sayur', 'gorengan', 'pelengkap', 'minum'];
  var LS_KEY = 'warteg-v1';
  var EDISI = '2026-10-19';

  /* Microcopy Mas Warteg (copy-id.md — emoji dibersihkan) */
  var CARI_KOSONG = function (q) {
    return 'Hmm, "' + q + '" nggak ada di etalase hari ini. Coba kata lain — atau langsung tanya Mas, siapa tau besok dibikinin.';
  };
  var PIRING_KOSONG_JUDUL = 'Piringmu masih kosong, Mas.';
  var PIRING_KOSONG_ISI = 'Ayo comot lauk dari etalase — yang anget-anget nungguin tuh.';
  var QTY_INVALID = 'Jumlah porsinya masukin yang bener ya — angka bulat, minimal 1. Jangan minus, piring nggak bisa ngembaliin lauk.';
  var UNDUH_GAGAL = 'Waduh, struknya gagal keunduh. Coba lagi sekali, kalau masih bandel screenshot aja — tetep sah kok.';
  var SALIN_GAGAL = 'Salinnya gagal nih, Mas. Coba tekan lama (tahan) di teksnya terus pilih "Salin" manual ya.';
  var LS_GAGAL = 'Waduh, memori browser-nya lagi bandel — piringmu nggak kesimpen otomatis, tapi tetep bisa dipakai kok.';
  var PATUNGAN_HASIL = function (rp) {
    return 'Per orang bayar: ' + rp + ' — yang makan paling banyak, ngaku aja, biar adil.';
  };
  var KENYANG_PESAN = 'Udah kenyang? Jangan lupa bayar dulu, Bos.';
  var DISCLAIMER = 'Harga patokan menu warteg Jakarta 2025–2026 — tiap warteg bisa beda dikit, Bos.';

  var rupiah = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
  var fmtRp = function (n) { return rupiah.format(Math.round(n)); };

  /* ---------- State ---------- */
  var state = {
    piring: {},   // id -> qty
    kat: 'semua',
    q: '',
    orang: 2,
    bulat: 'pas',
    gerak: true
  };
  var lsRusak = false;

  /* ---------- Util ---------- */
  function $(id) { return document.getElementById(id); }
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function ikon(nama, cls) {
    return '<svg class="' + (cls || 'icon') + '" viewBox="0 0 24 24" aria-hidden="true"><use href="icons.svg#i-' + nama + '"></use></svg>';
  }

  var toastTimer = null;
  function toast(pesan) {
    var t = $('toast');
    t.innerHTML = '<span class="toast-siapa">Mas Warteg bilang:</span>' + esc(pesan);
    t.classList.add('tampil');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('tampil'); }, 4200);
  }

  /* ---------- Storage berversi ---------- */
  function simpan() {
    if (lsRusak) return;
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({
        v: 1, piring: state.piring, orang: state.orang, bulat: state.bulat, gerak: state.gerak
      }));
    } catch (e) { lsRusak = true; toast(LS_GAGAL); }
  }
  function muat() {
    try {
      var raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      var d = JSON.parse(raw);
      if (!d || d.v !== 1) return;
      if (d.piring && typeof d.piring === 'object') {
        Object.keys(d.piring).forEach(function (id) {
          if (MENU_BY_ID[id] && Number.isInteger(d.piring[id]) && d.piring[id] > 0) {
            state.piring[id] = Math.min(99, d.piring[id]);
          }
        });
      }
      if (Number.isInteger(d.orang) && d.orang >= 2) state.orang = Math.min(50, d.orang);
      if (d.bulat === 'pas' || d.bulat === 'naik') state.bulat = d.bulat;
      if (typeof d.gerak === 'boolean') state.gerak = d.gerak;
    } catch (e) { lsRusak = true; }
  }

  /* ---------- Deep-link ?menu=id:qty,id:qty ---------- */
  function parseDeepLink() {
    try {
      var m = new URLSearchParams(location.search).get('menu');
      if (!m) return false;
      var ok = false;
      m.split(',').forEach(function (pas) {
        var p = pas.split(':');
        var id = (p[0] || '').trim();
        var qty = parseInt(p[1], 10);
        if (MENU_BY_ID[id] && Number.isInteger(qty) && qty >= 1 && qty <= 99) {
          state.piring[id] = qty;
          ok = true;
        }
      });
      return ok;
    } catch (e) { return false; }
  }
  function deepLinkURL() {
    var parts = Object.keys(state.piring).map(function (id) { return id + ':' + state.piring[id]; });
    return location.origin + location.pathname + (parts.length ? '?menu=' + parts.join(',') : '');
  }

  /* ---------- Clipboard ---------- */
  function salinTeks(teks, okPesan) {
    function gagal() { toast(SALIN_GAGAL); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(teks).then(function () { toast(okPesan); }, gagal);
    } else {
      try {
        var ta = document.createElement('textarea');
        ta.value = teks;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        var sukses = document.execCommand('copy');
        document.body.removeChild(ta);
        if (sukses) toast(okPesan); else gagal();
      } catch (e) { gagal(); }
    }
  }

  /* ---------- Render: chips ---------- */
  function renderChips() {
    var row = $('chipsRow');
    row.innerHTML = '';
    var semua = [{ id: 'semua', label: 'Semua' }].concat(
      URUT_KAT.map(function (k) { return { id: k, label: KAT[k].label }; })
    );
    semua.forEach(function (c) {
      var b = el('button', 'chip', esc(c.label));
      b.type = 'button';
      b.setAttribute('aria-pressed', state.kat === c.id ? 'true' : 'false');
      b.addEventListener('click', function () {
        state.kat = c.id;
        renderChips();
        renderEtalase();
      });
      row.appendChild(b);
    });
  }

  /* ---------- Render: etalase ---------- */
  function laukTampil() {
    var q = state.q.trim().toLowerCase();
    return MENU.filter(function (m) {
      if (state.kat !== 'semua' && m.kategori !== state.kat) return false;
      if (!q) return true;
      return (m.nama + ' ' + m.deskripsi + ' ' + KAT[m.kategori].label).toLowerCase().indexOf(q) !== -1;
    });
  }

  function kartuEl(m) {
    var k = KAT[m.kategori];
    var suitTxt = k.suit + VS;
    var suitCls = k.merah ? 'suit-merah' : 'suit-hitam';
    var art = el('article', 'kartu');
    art.setAttribute('data-id', m.id);
    art.style.setProperty('--kat-warna', k.warna);
    var indeks = '<div class="indeks indeks-tl" aria-hidden="true"><span class="rank">' + k.rank +
      '</span><span class="suit ' + suitCls + '">' + suitTxt + '</span></div>' +
      '<div class="indeks indeks-br" aria-hidden="true"><span class="rank">' + k.rank +
      '</span><span class="suit ' + suitCls + '">' + suitTxt + '</span></div>';
    art.innerHTML = indeks +
      '<div class="kartu-isi">' +
      '<p class="kartu-kat">' + esc(k.label) + '</p>' +
      '<h4 class="kartu-nama">' + esc(m.nama) + '</h4>' +
      '<p class="kartu-harga">' + fmtRp(m.harga) + '</p>' +
      '<p class="kartu-desk">' + esc(m.deskripsi) + '</p>' +
      '<div class="stepper" role="group" aria-label="Jumlah ' + esc(m.nama) + '">' +
      '<button class="step-btn" data-aksi="kurang" aria-label="Kurangi ' + esc(m.nama) + '">' + ikon('minus') + '</button>' +
      '<output class="step-qty" aria-label="Porsi ' + esc(m.nama) + '">' + (state.piring[m.id] || 0) + '</output>' +
      '<button class="step-btn" data-aksi="tambah" aria-label="Tambah ' + esc(m.nama) + '">' + ikon('plus') + '</button>' +
      '</div></div>';

    art.addEventListener('click', function (ev) {
      var btn = ev.target.closest('.step-btn');
      if (!btn) return;
      ubahQty(m.id, btn.getAttribute('data-aksi') === 'tambah' ? 1 : -1);
    });
    return art;
  }

  function renderEtalase() {
    var list = $('rubrikList');
    list.innerHTML = '';
    var tampil = laukTampil();
    var kosong = $('cariKosong');
    if (!tampil.length) {
      kosong.hidden = false;
      $('cariKosongTeks').textContent = CARI_KOSONG(state.q.trim());
      $('hitungLauk').textContent = 'Tidak ada lauk yang cocok.';
      return;
    }
    kosong.hidden = true;
    $('hitungLauk').textContent = 'Menampilkan ' + tampil.length + ' dari ' + MENU.length + ' lauk.';

    URUT_KAT.forEach(function (katId) {
      var items = tampil.filter(function (m) { return m.kategori === katId; });
      if (!items.length) return;
      var k = KAT[katId];
      var sec = el('section', 'rubrik');
      sec.setAttribute('data-pl', '3');
      sec.setAttribute('aria-label', 'Rubrik ' + k.label);
      var suitTxt = k.suit + VS;
      var suitCls = k.merah ? 'suit-merah' : 'suit-hitam';
      var head = el('div', 'rubrik-head');
      head.innerHTML =
        '<h3 class="rubrik-judul">' + esc(k.label) + '</h3>' +
        '<span class="rubrik-count">' + items.length + ' lauk</span>' +
        '<span class="rubrik-indeks" style="color:' + k.warna + '" aria-hidden="true">' + k.rank +
        '<span class="' + suitCls + '">' + suitTxt + '</span></span>';
      var rule = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      rule.setAttribute('class', 'rule');
      rule.setAttribute('viewBox', '0 0 600 10');
      rule.setAttribute('preserveAspectRatio', 'none');
      rule.setAttribute('aria-hidden', 'true');
      rule.innerHTML = '<line x1="2" y1="5" x2="598" y2="5" class="rule-line"/>';
      var cards = el('div', 'cards');
      items.forEach(function (m) { cards.appendChild(kartuEl(m)); });
      sec.appendChild(head);
      sec.appendChild(rule);
      sec.appendChild(cards);
      list.appendChild(sec);
    });

    // Beritahu motion.js: ada kartu & garis baru untuk diobservasi.
    // Fallback: kalau motion.js gagal dimuat, kartu/garis tetap tampil.
    if (window.WartegMotion && window.WartegMotion.amatiBaru) {
      window.WartegMotion.amatiBaru(list);
    } else {
      list.querySelectorAll('.rule').forEach(function (r) { r.classList.add('tergambar'); });
      list.querySelectorAll('.kartu').forEach(function (c) { c.classList.add('tercap'); });
    }
  }

  /* ---------- Piring ---------- */
  function totalPiring() {
    return Object.keys(state.piring).reduce(function (s, id) {
      return s + MENU_BY_ID[id].harga * state.piring[id];
    }, 0);
  }
  function jumlahItem() {
    return Object.keys(state.piring).reduce(function (s, id) { return s + state.piring[id]; }, 0);
  }

  function ubahQty(id, delta) {
    var q = (state.piring[id] || 0) + delta;
    if (q <= 0) delete state.piring[id];
    else state.piring[id] = Math.min(99, q);
    sinkronPiring();
  }
  function setQty(id, qty) {
    if (!Number.isInteger(qty) || qty < 1 || qty > 99) {
      toast(QTY_INVALID);
      renderPiring(); // kembalikan tampilan
      return;
    }
    state.piring[id] = qty;
    sinkronPiring();
  }

  function sinkronPiring() {
    simpan();
    // update angka di kartu tanpa render ulang penuh
    document.querySelectorAll('.kartu').forEach(function (art) {
      var id = art.getAttribute('data-id');
      var out = art.querySelector('.step-qty');
      if (out) out.textContent = state.piring[id] || 0;
    });
    renderPiring();
    renderKalkulator();
    renderStruk();
  }

  function renderPiring() {
    var ids = Object.keys(state.piring);
    var kosong = ids.length === 0;
    $('piringKosong').hidden = !kosong;
    $('piringList').hidden = kosong;
    $('piringBar').hidden = kosong;
    $('hargaEceran').textContent = fmtRp(totalPiring()); // cermin total di masthead
    if (kosong) {
      $('piringList').innerHTML = '';
      return;
    }
    var ul = $('piringList');
    ul.innerHTML = '';
    ids.forEach(function (id) {
      var m = MENU_BY_ID[id];
      var qty = state.piring[id];
      var li = el('li', 'piring-item');
      li.innerHTML =
        '<div class="pi-info"><p class="pi-nama">' + esc(m.nama) + '</p>' +
        '<p class="pi-harga">' + fmtRp(m.harga) + ' × ' + qty + ' porsi</p></div>' +
        '<div class="stepper" role="group" aria-label="Jumlah ' + esc(m.nama) + ' di piring">' +
        '<button class="step-btn" data-aksi="kurang" aria-label="Kurangi ' + esc(m.nama) + '">' + ikon('minus') + '</button>' +
        '<input class="pi-qty-input" type="number" min="1" max="99" value="' + qty + '" inputmode="numeric" aria-label="Porsi ' + esc(m.nama) + '">' +
        '<button class="step-btn" data-aksi="tambah" aria-label="Tambah ' + esc(m.nama) + '">' + ikon('plus') + '</button>' +
        '</div>' +
        '<p class="pi-sub">' + fmtRp(m.harga * qty) + '</p>';
      li.addEventListener('click', function (ev) {
        var btn = ev.target.closest('.step-btn');
        if (btn) ubahQty(id, btn.getAttribute('data-aksi') === 'tambah' ? 1 : -1);
      });
      var inp = li.querySelector('.pi-qty-input');
      inp.addEventListener('change', function () { setQty(id, parseInt(inp.value, 10)); });
      ul.appendChild(li);
    });
    $('piringTotal').textContent = fmtRp(totalPiring());
  }

  function kosongkanPiring() {
    state.piring = {};
    sinkronPiring();
    toast('Piring dikosongkan — mulai lagi dari nol, Bos.');
  }

  /* ---------- Kalkulator patungan ---------- */
  function hitungPatungan() {
    var total = totalPiring();
    var orang = state.orang;
    if (total <= 0 || orang < 2) return null;
    var per = total / orang;
    if (state.bulat === 'naik') per = Math.ceil(per / 1000) * 1000;
    return { total: total, orang: orang, per: Math.round(per) };
  }

  function renderKalkulator() {
    $('kalkTotal').textContent = fmtRp(totalPiring());
    $('jmlOrang').value = state.orang;
    document.querySelectorAll('input[name="bulat"]').forEach(function (r) {
      r.checked = r.value === state.bulat;
    });
    var p = hitungPatungan();
    $('kalkHasil').textContent = p ? PATUNGAN_HASIL(fmtRp(p.per)) : 'Isi piring dulu biar bisa dihitung patungannya.';
  }

  function ringkasanTeks() {
    var p = hitungPatungan();
    if (!p) return 'Piring masih kosong — belum ada yang bisa dibagi.';
    var baris = Object.keys(state.piring).map(function (id) {
      var m = MENU_BY_ID[id];
      return state.piring[id] + '× ' + m.nama + ' (' + fmtRp(m.harga * state.piring[id]) + ')';
    });
    return 'WARTEG BERITA BAHAGIA — Ringkasan patungan\n' +
      baris.join('\n') + '\n' +
      'Total: ' + fmtRp(p.total) + ' | ' + p.orang + ' orang | ' +
      'Per orang: ' + fmtRp(p.per) + ' (' + (state.bulat === 'naik' ? 'dibulatkan ke atas Rp1.000' : 'pas') + ')';
  }

  /* ---------- Struk ---------- */
  function waktuStruk() {
    try {
      return new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Jakarta', dateStyle: 'medium', timeStyle: 'short'
      }).format(new Date()) + ' WIB';
    } catch (e) { return new Date().toISOString(); }
  }

  function renderStruk() {
    var ul = $('strukList');
    ul.innerHTML = '';
    var ids = Object.keys(state.piring);
    if (!ids.length) {
      var li = el('li', 'struk-kosong-note', '— struk masih kosong, isi piring dulu —');
      ul.appendChild(li);
    }
    ids.forEach(function (id) {
      var m = MENU_BY_ID[id];
      var q = state.piring[id];
      var li = el('li');
      li.innerHTML = '<span class="sl-nama">' + q + '× ' + esc(m.nama) + ' @' + fmtRp(m.harga) +
        '</span><span>' + fmtRp(m.harga * q) + '</span>';
      ul.appendChild(li);
    });
    $('strukTotal').textContent = fmtRp(totalPiring());
    var p = hitungPatungan();
    $('strukPatungan').textContent = p
      ? 'Patungan ' + p.orang + ' orang → ' + fmtRp(p.per) + '/orang'
      : '';
    $('strukWaktu').textContent = 'Edisi ' + EDISI + ' · ' + waktuStruk();
  }

  function strukTeks() {
    var garis = '------------------------------';
    var baris = ['★ WARTEG BERITA BAHAGIA ★', 'Bukti makan enak, bukan bukti utang.', garis];
    Object.keys(state.piring).forEach(function (id) {
      var m = MENU_BY_ID[id];
      var q = state.piring[id];
      baris.push(q + 'x ' + m.nama + ' @' + fmtRp(m.harga) + ' = ' + fmtRp(m.harga * q));
    });
    baris.push(garis, 'TOTAL: ' + fmtRp(totalPiring()));
    var p = hitungPatungan();
    if (p) baris.push('Patungan ' + p.orang + ' orang: ' + fmtRp(p.per) + '/orang');
    baris.push(waktuStruk(), DISCLAIMER, 'Makasih udah mampir! Perut kenyang, hati senang. — Mas Warteg');
    return baris.join('\n');
  }

  function unduhJSON() {
    try {
      var p = hitungPatungan();
      var data = {
        toko: 'WARTEG BERITA BAHAGIA',
        edisi: EDISI,
        items: Object.keys(state.piring).map(function (id) {
          var m = MENU_BY_ID[id];
          return { id: id, nama: m.nama, qty: state.piring[id], harga: m.harga, subtotal: m.harga * state.piring[id] };
        }),
        total: totalPiring(),
        patungan: p ? { orang: p.orang, perOrang: p.per, pembulatan: state.bulat } : null,
        timestamp: new Date().toISOString(),
        catatan: DISCLAIMER
      };
      var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'struk-warteg-' + EDISI + '.json';
      document.body.appendChild(a);
      a.click();
      setTimeout(function () {
        URL.revokeObjectURL(a.href);
        a.remove();
      }, 800);
      toast('Struk keunduh — simpen baik-baik, Bos.');
    } catch (e) { toast(UNDUH_GAGAL); }
  }

  /* ---------- Easter egg: ketik "kenyang" ---------- */
  function pasangEasterEgg() {
    var buf = '';
    document.addEventListener('keydown', function (ev) {
      if (ev.key && ev.key.length === 1) {
        buf = (buf + ev.key.toLowerCase()).slice(-7);
        if (buf === 'kenyang') {
          buf = '';
          var cap = $('capKenyang');
          cap.hidden = false;
          cap.classList.remove('jatuh');
          void cap.offsetWidth; // paksa reflow biar animasi bisa diulang
          cap.classList.add('jatuh');
          toast(KENYANG_PESAN);
          $('struk').scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    });
  }

  /* ---------- Toggle gerak (milik app.js; dibaca motion.js) ---------- */
  function terapkanGerak() {
    var mati = !state.gerak;
    document.body.classList.toggle('gerak-mati', mati);
    document.documentElement.classList.toggle('gerak-mati', mati);
    var t = $('gerakToggle');
    t.setAttribute('aria-pressed', state.gerak ? 'true' : 'false');
    t.textContent = state.gerak ? 'Gerak: nyala' : 'Gerak: mati';
  }

  /* ---------- Boot ---------- */
  function boot() {
    if (typeof MENU === 'undefined' || !Array.isArray(MENU) || !MENU.length) {
      $('hitungLauk').textContent = 'Waduh, daftar lauknya gagal dimuat. Coba muat ulang halamannya, Bos.';
      $('boot').classList.add('selesai');
      return;
    }
    window.MENU_BY_ID = {};
    MENU.forEach(function (m) { window.MENU_BY_ID[m.id] = m; });

    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    muat();
    if (prefersReduced) state.gerak = false;

    var dariTautan = parseDeepLink();
    terapkanGerak();

    $('jmlOrang').value = state.orang;
    document.querySelectorAll('input[name="bulat"]').forEach(function (r) {
      r.checked = r.value === state.bulat;
    });

    renderChips();
    renderEtalase();
    if (!window.WartegMotion) {
      document.querySelectorAll('.rule').forEach(function (r) { r.classList.add('tergambar'); });
    }
    renderPiring();
    renderKalkulator();
    renderStruk();
    if (dariTautan) { simpan(); toast('Piring dari tautan dimuat — selamat makan, Bos.'); }

    /* Search */
    var qInput = $('q');
    var qTimer = null;
    qInput.addEventListener('input', function () {
      clearTimeout(qTimer);
      qTimer = setTimeout(function () {
        state.q = qInput.value;
        renderEtalase();
      }, 180);
    });
    $('resetCari').addEventListener('click', function () {
      qInput.value = '';
      state.q = '';
      state.kat = 'semua';
      renderChips();
      renderEtalase();
      qInput.focus();
    });

    /* Kalkulator */
    $('jmlOrang').addEventListener('change', function (ev) {
      var v = parseInt(ev.target.value, 10);
      if (!Number.isInteger(v) || v < 2) {
        toast('Minimal 2 orang. Sendirian mah namanya traktir diri sendiri.');
        ev.target.value = state.orang;
        return;
      }
      state.orang = Math.min(50, v);
      ev.target.value = state.orang;
      simpan();
      renderKalkulator();
      renderStruk();
    });
    document.querySelectorAll('input[name="bulat"]').forEach(function (r) {
      r.addEventListener('change', function () {
        state.bulat = document.querySelector('input[name="bulat"]:checked').value;
        simpan();
        renderKalkulator();
        renderStruk();
      });
    });
    $('salinRingkasan').addEventListener('click', function () {
      salinTeks(ringkasanTeks(), 'Ringkasan patungan disalin — tinggal tempel di grup.');
    });

    /* Struk */
    $('unduhJson').addEventListener('click', unduhJSON);
    $('salinTeks').addEventListener('click', function () {
      salinTeks(strukTeks(), 'Struk disalin — tinggal tempel di mana aja.');
    });
    $('bagikan').addEventListener('click', function () {
      if (!Object.keys(state.piring).length) {
        toast('Piringnya masih kosong — isi dulu baru dibagikan, Bos.');
        return;
      }
      salinTeks(deepLinkURL(), 'Tautan piring disalin — ini racikan piringku di Warteg Berita Bahagia, coba bikin versimu!');
    });
    $('kosongkan').addEventListener('click', kosongkanPiring);
    $('kosongkanAtas').addEventListener('click', kosongkanPiring);

    /* Toggle gerak */
    $('gerakToggle').addEventListener('click', function () {
      state.gerak = !state.gerak;
      terapkanGerak();
      simpan();
      toast(state.gerak
        ? 'Gerak dinyalakan — korannya hidup lagi.'
        : 'Gerak dimatikan — korannya tetep bisa dibaca kok.');
    });

    pasangEasterEgg();

    /* Boot overlay ~600ms */
    setTimeout(function () { $('boot').classList.add('selesai'); }, 600);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
