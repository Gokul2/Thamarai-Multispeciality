// Thamarai Hospital — site interactivity
(function () {
  'use strict';

  var qs = function (s, r) { return (r || document).querySelector(s); };
  var qsa = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  function validPhone(v) { var d = (v || '').replace(/\D/g, ''); return d.length === 10 || (d.length === 12 && d.indexOf('91') === 0); }

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  // ---------------------------------------------------------------- mobile nav
  function initNav() {
    var toggle = qs('[data-nav-toggle]');
    var drawer = qs('[data-nav-drawer]');
    var backdrop = qs('[data-nav-backdrop]');
    var closeBtn = qs('[data-nav-close]');
    function open() {
      if (!drawer) return;
      drawer.classList.remove('translate-x-full');
      if (backdrop) backdrop.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      if (toggle) toggle.setAttribute('aria-expanded', 'true');
    }
    function close() {
      if (!drawer) return;
      drawer.classList.add('translate-x-full');
      if (backdrop) backdrop.classList.add('hidden');
      document.body.style.overflow = '';
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    }
    if (toggle) toggle.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (backdrop) backdrop.addEventListener('click', close);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }

  // ------------------------------------------------------------- card filters
  function expMatch(exp, label) {
    var n = parseInt(exp, 10); if (isNaN(n)) return true;
    if (/15\+/.test(label)) return n >= 15;
    var m = label.match(/(\d+)\s*-\s*(\d+)/);
    if (m) return n >= +m[1] && n <= +m[2];
    return true;
  }
  function initFilters() {
    var scopes = {};
    qsa('[data-fitem]').forEach(function (el) {
      var s = el.getAttribute('data-fitem');
      (scopes[s] = scopes[s] || { items: [] }).items.push(el);
    });
    Object.keys(scopes).forEach(function (scope) {
      var cfg = scopes[scope];
      cfg.search = qs('[data-fsearch="' + scope + '"]');
      cfg.selects = qsa('[data-fselect^="' + scope + ':"]');
      cfg.chips = qsa('[data-fchip="' + scope + '"]');
      cfg.empty = qs('[data-fempty="' + scope + '"]');

      function apply() {
        var q = (cfg.search ? cfg.search.value : '').trim().toLowerCase();
        var activeChip = cfg.chips.filter(function (c) { return c.classList.contains('is-active'); })[0];
        var chipVal = activeChip ? activeChip.getAttribute('data-fval') : 'All';
        var visible = 0;
        cfg.items.forEach(function (it) {
          var show = true;
          if (q) {
            var hay = ((it.getAttribute('data-name') || '') + ' ' + (it.getAttribute('data-search') || '')).toLowerCase();
            if (hay.indexOf(q) === -1) show = false;
          }
          if (show && chipVal && chipVal !== 'All') {
            if ((it.getAttribute('data-cat') || '') !== chipVal) show = false;
          }
          if (show) {
            cfg.selects.forEach(function (sel) {
              var field = sel.getAttribute('data-fselect').split(':')[1];
              var opt = sel.options[sel.selectedIndex];
              var val = (opt ? opt.text : sel.value).trim();
              if (!val || /^any\b/i.test(val) || /^all\b/i.test(val)) return;
              if (field === 'exp') { if (!expMatch(it.getAttribute('data-exp'), val)) show = false; }
              else if ((it.getAttribute('data-' + field) || '').toLowerCase() !== val.toLowerCase()) show = false;
            });
          }
          it.style.display = show ? '' : 'none';
          if (show) visible++;
        });
        if (cfg.empty) cfg.empty.classList.toggle('hidden', visible !== 0);
      }

      if (cfg.search) cfg.search.addEventListener('input', apply);
      cfg.selects.forEach(function (s) { s.addEventListener('change', apply); });
      cfg.chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
          cfg.chips.forEach(function (c) { c.classList.remove('is-active'); });
          chip.classList.add('is-active');
          apply();
        });
      });

      // apply ?department= / ?category= deep links
      var params = new URLSearchParams(location.search);
      var dep = params.get('department') || params.get('category');
      if (dep) {
        var depSel = cfg.selects.filter(function (s) { return /:dept$/.test(s.getAttribute('data-fselect')); })[0];
        if (depSel) {
          qsa('option', depSel).forEach(function (o, i) { if (o.text.trim().toLowerCase() === dep.toLowerCase()) depSel.selectedIndex = i; });
        }
        var chip = cfg.chips.filter(function (c) { return c.getAttribute('data-fval') === dep; })[0];
        if (chip) { cfg.chips.forEach(function (c) { c.classList.remove('is-active'); }); chip.classList.add('is-active'); }
      }
      apply();
    });
  }

  // ------------------------------------------------------------ field helpers
  function setInvalid(field, on) {
    if (!field) return;
    field.classList.toggle('border-error', on);
    field.classList.toggle('ring-1', on);
    field.classList.toggle('ring-error', on);
    var err = field.form ? qs('[data-error-for="' + field.name + '"]', field.form) : null;
    if (err) err.classList.toggle('hidden', !on);
  }

  // -------------------------------------------------------------- contact form
  function initContactForm() {
    var form = qs('[data-contact-form]');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      var name = form.elements['name'], phone = form.elements['phone'], email = form.elements['email'], msg = form.elements['message'];
      [[name, function (v) { return v.trim().length > 1; }], [phone, function (v) { return validPhone(v); }],
       [email, function (v) { return EMAIL_RE.test(v); }], [msg, function (v) { return v.trim().length > 1; }]]
      .forEach(function (pair) { var bad = !pair[1](pair[0].value); setInvalid(pair[0], bad); if (bad) ok = false; });
      if (!ok) { var first = qs('.border-error', form); if (first) first.focus(); return; }
      form.reset();
      var success = qs('[data-contact-success]', form);
      if (success) { success.classList.remove('hidden'); success.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
    });
    qsa('input, textarea', form).forEach(function (f) {
      f.addEventListener('input', function () { setInvalid(f, false); });
    });
  }

  // ------------------------------------------------------------ newsletter
  function initNewsletter() {
    var form = qs('[data-newsletter]');
    if (!form) return;
    var input = qs('input[type="email"]', form) || qs('input', form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!input || !EMAIL_RE.test(input.value)) { setInvalid(input, true); if (input) input.focus(); return; }
      setInvalid(input, false);
      var note = qs('[data-newsletter-success]', form);
      if (!note) {
        note = document.createElement('p');
        note.setAttribute('data-newsletter-success', '');
        note.className = 'text-primary font-label-md text-body-md mt-3 flex items-center gap-2';
        note.innerHTML = '<span class="material-symbols-outlined">check_circle</span> Subscribed! Thank you for joining our health community.';
        form.appendChild(note);
      }
      note.classList.remove('hidden');
      form.reset();
    });
  }

  // ------------------------------------------------------------ booking form
  function initBookingForm() {
    var form = qs('[data-booking-form]');
    if (!form) return;
    var confirm = qs('[data-booking-confirm]');
    var params = new URLSearchParams(location.search);

    // preselect department + doctor from deep link
    var depParam = params.get('department');
    var docParam = params.get('doctor');
    var depSel = qs('[data-booking-field="department"]', form);
    var docSel = qs('[data-booking-field="doctor"]', form);
    if (depParam && depSel) qsa('option', depSel).forEach(function (o, i) { if (o.text.trim().toLowerCase() === depParam.toLowerCase()) depSel.selectedIndex = i; });
    if (docParam && docSel) {
      var found = qsa('option', docSel).filter(function (o) { return o.text.trim() === docParam; })[0];
      if (found) docSel.value = found.value || found.text;
      else { docSel.insertAdjacentHTML('afterbegin', '<option selected>' + docParam.replace(/</g, '') + '</option>'); }
    }

    function requiredFields() {
      return qsa('input, select, textarea', form).filter(function (f) {
        if (f.type === 'radio' || f.type === 'checkbox' || f.type === 'hidden') return false;
        if (/placeholder/i.test(f.getAttribute('data-role') || '')) return false;
        return f.type === 'text' || f.type === 'tel' || f.type === 'email' || f.type === 'date' || f.tagName === 'SELECT';
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true, firstBad = null;
      requiredFields().forEach(function (f) {
        var v = (f.value || '').trim();
        var bad = !v;
        if (f.type === 'email' && v) bad = !EMAIL_RE.test(v);
        if (f.type === 'tel' && v) bad = !validPhone(v);
        if (f.tagName === 'SELECT' && /^(select|any|choose)\b/i.test(f.options[f.selectedIndex] ? f.options[f.selectedIndex].text : '')) bad = true;
        setInvalid(f, bad);
        if (bad && !firstBad) firstBad = f;
        if (bad) ok = false;
      });
      if (!ok) { if (firstBad) firstBad.focus(); return; }

      // build summary
      var name = (form.elements['name'] && form.elements['name'].value) || (qs('input[type="text"]', form) || {}).value || 'there';
      var dept = depSel ? depSel.value : '';
      var doc = docSel ? docSel.value : '';
      var date = (qs('input[type="date"]', form) || {}).value || '';
      var timeSel = qsa('select', form).filter(function (s) { return /Morning|Afternoon|Evening/.test(s.textContent); })[0];
      var time = timeSel ? timeSel.value : '';
      var parts = [];
      if (dept && !/^select/i.test(dept)) parts.push(dept);
      if (doc && !/^any/i.test(doc)) parts.push('with ' + doc);
      if (date) parts.push('on ' + date);
      if (time) parts.push('(' + time + ')');

      if (confirm) {
        var nm = qs('[data-confirm-name]', confirm); if (nm) nm.textContent = name.split(' ')[0] || 'there';
        var sm = qs('[data-confirm-summary]', confirm); if (sm) sm.textContent = parts.length ? parts.join(' ') : 'a consultation';
        form.classList.add('hidden');
        confirm.classList.remove('hidden');
        confirm.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    });

    qsa('input, select, textarea', form).forEach(function (f) {
      f.addEventListener('input', function () { setInvalid(f, false); });
      f.addEventListener('change', function () { setInvalid(f, false); });
    });

    var reset = qs('[data-booking-reset]');
    if (reset) reset.addEventListener('click', function () {
      form.reset();
      form.classList.remove('hidden');
      if (confirm) confirm.classList.add('hidden');
      form.scrollIntoView({ block: 'start', behavior: 'smooth' });
    });
  }

  ready(function () {
    initNav();
    initFilters();
    initContactForm();
    initNewsletter();
    initBookingForm();
    qsa('[data-current-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
  });
})();
