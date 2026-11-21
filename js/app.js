(function () {
  'use strict';

  var I18N = window.I18N;
  var CONFIG = window.SAVE_THE_DATE_CONFIG || {};
  var LANGS = ['cs', 'en', 'pt', 'de'];
  var root = document.documentElement;
  var lang = 'en';

  function t(key) { return (I18N[lang] && I18N[lang][key]) || I18N.en[key] || ''; }

  // ---------- language ----------
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
      el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      el.setAttribute('aria-label', t(el.dataset.i18nAria));
    });
    document.querySelectorAll('#companions input').forEach(function (el) {
      el.placeholder = t('companionPlaceholder');
    });
    document.querySelectorAll('#companions .remove').forEach(function (el) {
      el.setAttribute('aria-label', t('remove'));
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

  // ---------- dialog ----------
  var dialog = document.getElementById('form-dialog');
  var form = document.getElementById('rsvp');
  var thanks = document.getElementById('thanks');
  var status = document.getElementById('status');
  var submit = document.getElementById('submit');

  document.getElementById('open-form').addEventListener('click', function () {
    form.hidden = false;
    thanks.hidden = true;
    status.textContent = '';
    dialog.showModal();
  });
  document.getElementById('close-form').addEventListener('click', function () { dialog.close(); });
  document.getElementById('close-thanks').addEventListener('click', function () { dialog.close(); });
  // Click on the dark backdrop closes the dialog
  dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });

  // ---------- companions ----------
  var list = document.getElementById('companions');
  var rowTemplate = document.getElementById('companion-row');

  document.getElementById('add-companion').addEventListener('click', function () {
    var li = rowTemplate.content.firstElementChild.cloneNode(true);
    var input = li.querySelector('input');
    var remove = li.querySelector('.remove');
    input.placeholder = t('companionPlaceholder');
    input.setAttribute('aria-label', t('companionPlaceholder'));
    remove.setAttribute('aria-label', t('remove'));
    remove.addEventListener('click', function () { li.remove(); });
    list.appendChild(li);
    input.focus();
  });

  // ---------- submit ----------
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    status.textContent = '';

    if (!form.checkValidity()) {
      status.textContent = t('required');
      var firstInvalid = form.querySelector(':invalid');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    var data = new FormData(form);
    // Bots fill in the hidden field, people never do: pretend success.
    if (data.get('website')) { showThanks(); return; }

    var companions = data.getAll('companion')
      .map(function (s) { return String(s).trim(); })
      .filter(Boolean);

    var payload = new URLSearchParams({
      name: String(data.get('name')).trim(),
      email: String(data.get('email')).trim(),
      street: String(data.get('street')).trim(),
      zip: String(data.get('zip')).trim(),
      city: String(data.get('city')).trim(),
      country: String(data.get('country')).trim(),
      companions: companions.join('; '),
      companionCount: String(companions.length),
      lang: lang
    });

    if (!CONFIG.scriptUrl) {
      console.info('Demo mode, would send:', Object.fromEntries(payload));
      showThanks(true);
      return;
    }

    submit.disabled = true;
    submit.textContent = t('sending');

    // Apps Script does not send CORS headers, so the answer cannot be read
    // ("no-cors"). The request still arrives; a network failure still throws.
    fetch(CONFIG.scriptUrl, { method: 'POST', mode: 'no-cors', body: payload })
      .then(function () { showThanks(false); })
      .catch(function () { status.textContent = t('error'); })
      .then(function () {
        submit.disabled = false;
        submit.textContent = t('submit');
      });
  });

  function showThanks(demo) {
    form.reset();
    list.innerHTML = '';
    form.hidden = true;
    thanks.hidden = false;
    var p = thanks.querySelector('p');
    p.textContent = t('thanksText') + (demo ? ' ' + t('demo') : '');
    document.getElementById('close-thanks').focus();
  }
})();
