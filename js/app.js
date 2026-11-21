(function () {
  'use strict';

  var PAGE = window.I18N.page;
  var FORM = window.I18N.form;
  var CONFIG = window.SAVE_THE_DATE_CONFIG || {};
  var LANGS = ['cs', 'en', 'pt', 'de'];
  var GROUP_LANG = { cz: 'cs', pt: 'pt', friends: 'en' };
  var root = document.documentElement;

  // =========================================================
  // The page language (four languages, switch at the top)
  // =========================================================
  var lang = 'en';

  function pickLang() {
    var fromUrl = new URLSearchParams(location.search).get('lang');
    if (LANGS.indexOf(fromUrl) >= 0) return fromUrl;
    try {
      var saved = localStorage.getItem('std-lang');
      if (LANGS.indexOf(saved) >= 0) return saved;
    } catch (e) {}
    var langs = navigator.languages || [navigator.language || 'en'];
    for (var i = 0; i < langs.length; i++) {
      var code = String(langs[i]).slice(0, 2).toLowerCase();
      if (code === 'sk') code = 'cs';
      if (LANGS.indexOf(code) >= 0) return code;
    }
    return 'en';
  }

  function applyLang(next) {
    lang = next;
    root.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = PAGE[lang][el.dataset.i18n] || PAGE.en[el.dataset.i18n];
    });
    document.querySelectorAll('.lang button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.lang === lang));
    });
  }

  document.querySelectorAll('.lang button').forEach(function (b) {
    b.addEventListener('click', function () {
      try { localStorage.setItem('std-lang', b.dataset.lang); } catch (e) {}
      applyLang(b.dataset.lang);
    });
  });

  applyLang(pickLang());

  // =========================================================
  // The intro: pick a language (EN / CZ / PT) → paint → fall → done
  // (timings match the transitions in css/style.css)
  // =========================================================
  var PAINT_MS = 3900;   // morph, sky, the dates written, a moment to look
  var FALL_MS = 10300;   // three drops with two written lines, into the village

  function setStage(name) { root.className = 'stage-' + name; }

  function imagesReady() {
    var imgs = Array.prototype.slice.call(document.querySelectorAll('.scene img, .orange img'));
    var all = Promise.all(imgs.map(function (img) {
      return img.decode ? img.decode().catch(function () {}) : Promise.resolve();
    }));
    // never wait more than 2.5 s for slow connections
    return Promise.race([all, new Promise(function (r) { setTimeout(r, 2500); })]);
  }

  var started = false;
  // ---------- music: starts with the first click, fades in ----------
  var music = document.getElementById('music');
  var soundBtn = document.getElementById('sound');
  var MUSIC_VOLUME = 0.6;

  function startMusic() {
    if (!music) return;
    music.volume = 0;
    soundBtn.setAttribute('aria-pressed', 'true');
    var p = music.play();
    if (p && p.catch) p.catch(function () { soundBtn.setAttribute('aria-pressed', 'false'); });
    var t0 = Date.now();
    var fade = setInterval(function () {
      var k = Math.max(0, Math.min(1, (Date.now() - t0) / 3000));
      music.volume = MUSIC_VOLUME * k;
      if (k >= 1) clearInterval(fade);
    }, 50);
  }

  if (soundBtn) {
    soundBtn.addEventListener('click', function () {
      var on = soundBtn.getAttribute('aria-pressed') !== 'true';
      soundBtn.setAttribute('aria-pressed', String(on));
      if (on) { music.volume = MUSIC_VOLUME; music.play().catch(function () {}); }
      else music.pause();
    });
  }

  document.querySelectorAll('[data-start]').forEach(function (b) {
    b.addEventListener('click', function () {
      if (started) return;
      started = true;
      try { localStorage.setItem('std-lang', b.dataset.start); } catch (e) {}
      applyLang(b.dataset.start);
      startMusic();
      imagesReady().then(function () {
        setStage('paint');
        setTimeout(function () {
          setStage('fall');
          setTimeout(function () {
            setStage('done');
            window.scrollTo(0, 0);
            var h1 = document.querySelector('.card h1');
            if (h1) { h1.tabIndex = -1; h1.focus({ preventScroll: true }); }
          }, FALL_MS);
        }, PAINT_MS);
      });
    });
  });

  // =========================================================
  // The form: group → name → address → thanks
  // =========================================================
  var dialog = document.getElementById('form-dialog');
  var form = document.getElementById('rsvp');
  var list = document.getElementById('guest-list');
  var filter = document.getElementById('guest-filter');
  var guestStatus = document.getElementById('guest-status');
  var guestName = document.getElementById('guest-name');
  var countryInput = document.getElementById('f-country');
  var status = document.getElementById('status');
  var submit = document.getElementById('submit');

  var state = { group: null, flang: 'en', guest: null };

  function f(key) { return FORM[state.flang][key]; }

  function applyFormLang() {
    dialog.querySelectorAll('[data-step]:not([data-step="group"])').forEach(function (step) {
      step.lang = state.flang;
    });
    dialog.querySelectorAll('[data-f]').forEach(function (el) { el.textContent = f(el.dataset.f); });
    dialog.querySelectorAll('[data-f-ph]').forEach(function (el) { el.placeholder = f(el.dataset.fPh); });
    dialog.querySelectorAll('[data-f-aria]').forEach(function (el) { el.setAttribute('aria-label', f(el.dataset.fAria)); });
  }

  function showStep(name) {
    dialog.querySelectorAll('.step').forEach(function (s) { s.hidden = s.dataset.step !== name; });
    dialog.scrollTop = 0;
    var current = dialog.querySelector('[data-step="' + name + '"]');
    var first = current.querySelector('h2, .q-main');
    if (first) { first.tabIndex = -1; first.focus({ preventScroll: true }); }
  }

  function resetForm() {
    form.reset();
    status.textContent = '';
    filter.value = '';
    state = { group: null, flang: 'en', guest: null };
    showStep('group');
  }

  document.getElementById('open-form').addEventListener('click', function () {
    resetForm();
    dialog.showModal();
  });
  document.getElementById('close-form').addEventListener('click', function () { dialog.close(); });
  document.getElementById('close-thanks').addEventListener('click', function () { dialog.close(); });
  dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });
  dialog.querySelectorAll('[data-back]').forEach(function (b) {
    b.addEventListener('click', function () { showStep(b.dataset.back); });
  });

  // ---------- step 1: group ----------
  dialog.querySelectorAll('.choice').forEach(function (b) {
    b.addEventListener('click', function () {
      state.group = b.dataset.group;
      state.flang = GROUP_LANG[state.group];
      applyFormLang();
      filter.value = '';
      showStep('name');
      renderGuests();
    });
  });

  // ---------- step 2: name ----------
  var guestsPromise = null;

  function loadGuests() {
    if (!guestsPromise) {
      guestsPromise = fetch('guests.csv', { cache: 'no-cache' })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
        .then(parseGuests)
        .catch(function (err) { guestsPromise = null; throw err; });
    }
    return guestsPromise;
  }

  // CSV with a header "name,group" (any column order works). Commas or semicolons (Czech Excel saves
  // with semicolons), quoted values, and a UTF-8 BOM are all fine.
  function parseGuests(text) {
    var lines = text.replace(/^﻿/, '').split(/\r?\n/).filter(function (l) { return l.trim(); });
    var sep = lines[0].indexOf(';') >= 0 ? ';' : ',';
    var head = splitRow(lines[0], sep).map(function (h) { return h.trim().toLowerCase(); });
    var gi = head.indexOf('group');
    var ni = head.indexOf('name');
    return lines.slice(1).map(function (l) {
      var cells = splitRow(l, sep);
      return { group: (cells[gi] || '').trim().toLowerCase(), name: (cells[ni] || '').trim() };
    }).filter(function (g) { return g.name && GROUP_LANG[g.group]; });
  }

  function splitRow(line, sep) {
    var out = [], cur = '', quoted = false;
    for (var i = 0; i < line.length; i++) {
      var c = line[i];
      if (quoted) {
        if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
        else if (c === '"') quoted = false;
        else cur += c;
      } else if (c === '"') quoted = true;
      else if (c === sep) { out.push(cur); cur = ''; }
      else cur += c;
    }
    out.push(cur);
    return out;
  }

  function plain(s) {
    return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  }

  function renderGuests() {
    list.innerHTML = '';
    guestStatus.textContent = '';
    loadGuests().then(function (all) {
      var mine = all
        .filter(function (g) { return g.group === state.group; })
        .sort(function (a, b) { return a.name.localeCompare(b.name, state.flang); });
      filter.hidden = mine.length <= 8;
      var q = plain(filter.value.trim());
      var shown = mine.filter(function (g) { return !q || plain(g.name).indexOf(q) >= 0; });
      shown.forEach(function (g) {
        var li = document.createElement('li');
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'guest';
        b.textContent = g.name;
        b.addEventListener('click', function () { chooseGuest(g.name); });
        li.appendChild(b);
        list.appendChild(li);
      });
      if (!shown.length) guestStatus.textContent = f('noMatch');
    }).catch(function () {
      filter.hidden = true;
      guestStatus.textContent = f('loadError');
    });
  }

  filter.addEventListener('input', renderGuests);

  function chooseGuest(name) {
    state.guest = name;
    guestName.innerHTML = '';
    var strong = document.createElement('strong');
    strong.textContent = name;
    var change = document.createElement('button');
    change.type = 'button';
    change.className = 'link';
    change.textContent = f('notYou');
    change.addEventListener('click', function () { showStep('name'); });
    guestName.appendChild(strong);
    guestName.appendChild(change);
    goToAddress();
  }

  // ---------- step 3: address ----------
  function goToAddress() {
    status.textContent = '';
    if (!countryInput.value || countryInput.dataset.auto === 'true') {
      countryInput.value = f('defaultCountry');
      countryInput.dataset.auto = 'true';
    }
    showStep('address');
  }
  countryInput.addEventListener('input', function () { countryInput.dataset.auto = 'false'; });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    status.textContent = '';

    if (!form.checkValidity()) {
      status.textContent = f('required');
      var firstInvalid = form.querySelector(':invalid');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    var data = new FormData(form);
    // Bots fill in the hidden field, people never do: pretend success.
    if (data.get('website')) { showThanks(false); return; }

    function val(k) { return String(data.get(k) || '').trim(); }

    var payload = new URLSearchParams({
      name: state.guest,
      group: state.group,
      street: val('street'),
      zip: val('zip'),
      city: val('city'),
      country: val('country'),
      note: val('note'),
      lang: state.flang
    });

    if (!CONFIG.scriptUrl) {
      console.info('Demo mode, would send:', Object.fromEntries(payload));
      showThanks(true);
      return;
    }

    submit.disabled = true;
    submit.textContent = f('sending');

    // Apps Script does not send CORS headers, so the answer cannot be read
    // ("no-cors"). The request still arrives; a network failure still throws.
    fetch(CONFIG.scriptUrl, { method: 'POST', mode: 'no-cors', body: payload })
      .then(function () { showThanks(false); })
      .catch(function () { status.textContent = f('error'); })
      .then(function () {
        submit.disabled = false;
        submit.textContent = f('submit');
      });
  });

  function showThanks(demo) {
    document.getElementById('thanks-text').textContent = f('thanksText') + (demo ? ' ' + f('demo') : '');
    showStep('thanks');
  }
})();
