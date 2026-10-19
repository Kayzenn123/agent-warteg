/* WARTEG — lapisan gerak A–E. Narasi: "membaca koran dari dekat, lalu zoom out ke seluruh etalase".
   A: parallax 5 layer + zoom out di akhir · B: marquee vertikal 2 arah + skew velocity
   C: sumbu wght Roboto Slab · D: tilt 3D kartu · E: draw-on garis + cap reveal kartu */
(function () {
  'use strict';

  var FAKTOR = { 1: 0.055, 2: 0.035, 3: 0.018, 4: 0.03, 5: 0.07 };

  function gerakAktif() {
    return !document.body.classList.contains('gerak-mati') &&
           !document.body.classList.contains('mode-ringan');
  }
  function gerakPenuh() { // parallax + tilt + marquee-anim (mati di mode ringan)
    return gerakAktif();
  }

  /* ---------- cache elemen + visibilitas (hemat layout per-frame) ---------- */
  var plCache = [], denyutCache = [], denyutTerlihat = [], judulEl = null, judulTerlihat = false;
  var ioDenyut = null;
  function segarCache() {
    plCache = Array.prototype.slice.call(document.querySelectorAll('[data-pl]'));
    denyutCache = Array.prototype.slice.call(document.querySelectorAll('.denyut'));
    judulEl = document.getElementById('judulUtama');
    if (ioDenyut) {
      denyutCache.forEach(function (e) { ioDenyut.observe(e); });
      if (judulEl) ioDenyut.observe(judulEl);
    } else {
      denyutTerlihat = denyutCache.slice();
      judulTerlihat = true;
    }
  }
  function pasangDenyutIO() {
    if (!('IntersectionObserver' in window)) return;
    ioDenyut = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var i = denyutTerlihat.indexOf(en.target);
        if (en.target === judulEl) { judulTerlihat = en.isIntersecting; return; }
        if (en.isIntersecting && i < 0) denyutTerlihat.push(en.target);
        if (!en.isIntersecting && i >= 0) denyutTerlihat.splice(i, 1);
      });
    });
  }

  /* ---------- B: isi band marquee ---------- */
  function isiBand() {
    var frasa = 'LAUK PANAS ♠︎\uFE0E ETALASE BUKA ♥︎\uFE0E SIAP DISENDOK ♦︎\uFE0E MAKAN ENAK ♣︎\uFE0E ';
    ['bandKiri', 'bandKanan'].forEach(function (id) {
      var track = document.getElementById(id);
      if (!track) return;
      var separuh = '';
      for (var i = 0; i < 6; i++) separuh += '<span>' + frasa + '</span>';
      track.innerHTML = separuh + separuh; // dua separuh identik = loop mulus -50%
    });
  }

  /* ---------- B: tombol jeda (WCAG 2.2.2) ---------- */
  function pasangJeda() {
    var btn = document.getElementById('bandJeda');
    if (!btn) return;
    var jeda = false;
    function ikonPause() {
      return '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><use href="icons.svg#i-' +
        (jeda ? 'play' : 'pause') + '"/></use></svg><span>' + (jeda ? 'Jalankan pita' : 'Jeda pita') + '</span>';
    }
    btn.addEventListener('click', function () {
      jeda = !jeda;
      btn.setAttribute('aria-pressed', jeda ? 'true' : 'false');
      btn.setAttribute('aria-label', jeda ? 'Jalankan pita berjalan' : 'Jeda pita berjalan');
      document.querySelectorAll('.band-track').forEach(function (t) {
        t.style.animationPlayState = jeda ? 'paused' : 'running';
      });
      btn.innerHTML = ikonPause();
    });
  }

  /* ---------- E: draw-on garis + cap kartu ---------- */
  var io = null;
  function pasangObserver() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.rule').forEach(function (r) { r.classList.add('tergambar'); });
      document.querySelectorAll('.kartu').forEach(function (c) { c.classList.add('tercap'); });
      return;
    }
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var t = en.target;
        if (t.classList.contains('rule')) t.classList.add('tergambar');
        if (t.classList.contains('kartu')) t.classList.add('tercap');
        io.unobserve(t);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  }
  function amatiBaru(root) {
    if (!io) return;
    root.querySelectorAll('.rule:not(.tergambar)').forEach(function (r) { io.observe(r); });
    root.querySelectorAll('.kartu:not(.tercap)').forEach(function (c) { io.observe(c); });
    // garis statis di luar rubrik
    document.querySelectorAll('.rule:not(.tergambar)').forEach(function (r) { io.observe(r); });
    segarCache(); // render ulang (filter/cari) → cache elemen gerak diperbarui
  }

  /* ---------- D: tilt 3D kartu ---------- */
  function pasangTilt() {
    var aktif = null;
    document.addEventListener('pointermove', function (ev) {
      if (!gerakPenuh()) return;
      var kartu = ev.target.closest ? ev.target.closest('.kartu') : null;
      if (kartu !== aktif) {
        if (aktif) aktif.style.transform = '';
        aktif = kartu;
      }
      if (!kartu || ev.pointerType === 'touch') return;
      var r = kartu.getBoundingClientRect();
      var px = (ev.clientX - r.left) / r.width - 0.5;
      var py = (ev.clientY - r.top) / r.height - 0.5;
      kartu.style.transform = 'perspective(700px) rotateX(' + (-py * 7).toFixed(2) +
        'deg) rotateY(' + (px * 9).toFixed(2) + 'deg)';
    }, { passive: true });
    document.addEventListener('pointerleave', function () {
      if (aktif) { aktif.style.transform = ''; aktif = null; }
    }, true);
    // Padanan sentuh: tap = tilt sesaat
    document.addEventListener('click', function (ev) {
      if (!gerakPenuh()) return;
      var kartu = ev.target.closest ? ev.target.closest('.kartu') : null;
      if (!kartu) return;
      kartu.style.transform = 'perspective(700px) rotateX(-4deg) rotateY(5deg) scale(0.99)';
      setTimeout(function () { kartu.style.transform = ''; }, 220);
    }, { passive: true });
  }

  /* ---------- A + B-skew + C: loop scroll ---------- */
  var lastY = -1, skewSaat = 0, bandCache = [];
  function loopScroll() {
    if (typeof tabAktif !== 'undefined' && !tabAktif) { requestAnimationFrame(loopScroll); return; }
    var y = window.scrollY || window.pageYOffset;
    var vh = window.innerHeight;
    if (y === lastY && lastY >= 0) { requestAnimationFrame(loopScroll); return; } // diam: hemat

    // B: skew mengikuti velocity scroll
    if (lastY >= 0) {
      var vel = y - lastY;
      var target = Math.max(-9, Math.min(9, vel * 0.35));
      skewSaat += (target - skewSaat) * 0.18;
      // skew dipasang di .band (induk), bukan .band-track yang dianimasikan keyframes
      if (!bandCache.length) bandCache = Array.prototype.slice.call(document.querySelectorAll('.band'));
      if (Math.abs(skewSaat) > 0.05 && gerakAktif()) {
        bandCache.forEach(function (b) {
          b.style.transform = 'skewY(' + skewSaat.toFixed(2) + 'deg)';
        });
      } else if (Math.abs(skewSaat) <= 0.05) {
        bandCache.forEach(function (b) {
          if (b.style.transform) b.style.transform = '';
        });
      }
    }
    lastY = y;

    // A: parallax 5 layer
    if (gerakPenuh()) {
      plCache.forEach(function (elm) {
        var layer = elm.getAttribute('data-pl');
        var f = FAKTOR[layer] || 0.02;
        var r = elm.getBoundingClientRect();
        var offset = (r.top + r.height / 2 - vh / 2) * f;
        elm.style.transform = 'translate3d(0,' + offset.toFixed(1) + 'px,0)';
      });
      // A: zoom out di akhir — seluruh etalase menyusut pelan
      var doc = document.documentElement;
      var maks = doc.scrollHeight - vh;
      var prog = maks > 0 ? y / maks : 0;
      var main = document.getElementById('main');
      if (main) {
        if (prog > 0.86) {
          var s = 1 - Math.min(1, (prog - 0.86) / 0.14) * 0.05;
          main.style.transform = 'scale(' + s.toFixed(4) + ')';
          main.style.transformOrigin = '50% 100%';
        } else if (main.style.transform) {
          main.style.transform = '';
        }
      }
    }
    requestAnimationFrame(loopScroll);
  }

  /* ---------- C: denyut wght Roboto Slab ---------- */
  var tabAktif = !document.hidden, frameWght = 0;
  function loopWght() {
    if (!tabAktif) { requestAnimationFrame(loopWght); return; }
    frameWght++;
    if (gerakAktif() && frameWght % 2 === 0) { // ~30fps cukup untuk denyut
      var t = performance.now() / 1000;
      if (judulEl && judulTerlihat) {
        var w = 400 + (Math.sin(t * 1.4) * 0.5 + 0.5) * 500; // 400 → 900
        judulEl.style.fontVariationSettings = "'wght' " + Math.round(w);
      }
      denyutTerlihat.forEach(function (elm) {
        var w2 = 650 + (Math.sin(t * 1.1 + 1) * 0.5 + 0.5) * 200;
        elm.style.fontVariationSettings = "'wght' " + Math.round(w2);
      });
    }
    requestAnimationFrame(loopWght);
  }

  /* ---------- MODE RINGAN ---------- */
  function cekModeRingan() {
    var ringan = false;
    try {
      if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ringan = true;
      if (navigator.connection && navigator.connection.saveData) ringan = true;
    } catch (e) { /* abaikan */ }
    if (ringan) {
      document.body.classList.add('mode-ringan');
      return;
    }
    // fps < 40 selama 2 detik → ringan; ulangi tiap 15 dtk (hanya downgrade)
    function ukurSekali(lanjut) {
      var frames = 0, mulai = performance.now();
      function hitung() {
        frames++;
        if (performance.now() - mulai >= 2000) {
          var fps = frames / ((performance.now() - mulai) / 1000);
          if (fps < 40) document.body.classList.add('mode-ringan');
          if (lanjut) setTimeout(function () { ukurSekali(true); }, 15000);
          return;
        }
        requestAnimationFrame(hitung);
      }
      requestAnimationFrame(hitung);
    }
    ukurSekali(true);
  }

  /* ---------- Boot ---------- */
  function boot() {
    isiBand();
    pasangJeda();
    pasangObserver();
    amatiBaru(document);
    pasangTilt();
    // denyut wght untuk headline seksi
    document.querySelectorAll('.seksi-judul, .hero-judul').forEach(function (e) {
      e.classList.add('denyut');
    });
    // hormati prefers-reduced-motion sejak awal (app.js juga set)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.body.classList.add('gerak-mati');
      document.documentElement.classList.add('gerak-mati');
    }
    cekModeRingan();
    pasangDenyutIO();
    segarCache();
    document.addEventListener('visibilitychange', function () {
      tabAktif = !document.hidden;
    });
    requestAnimationFrame(loopScroll);
    requestAnimationFrame(loopWght);
  }

  window.WartegMotion = { amatiBaru: amatiBaru, gerakAktif: gerakAktif, segarCache: segarCache };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
