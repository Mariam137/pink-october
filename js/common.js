/* =====================================================================
   أدوات مشتركة لكل الصفحات  ·  Shared helpers for every page
   You normally don't need to edit this file.
   ===================================================================== */
var Site = (function () {
  'use strict';

  var C = window.SITE_CONTENT || {};
  var CONFIG = window.SITE_CONFIG || {};
  var KEYS = { result: 'liajliki.lastResult', pledge: 'liajliki.pledge' };
  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- small utils ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'text') node.textContent = attrs[k];
      else if (k === 'html') node.innerHTML = attrs[k];
      else if (k === 'class') node.className = attrs[k];
      else node.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return node;
  }

  var AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';
  function arDigits(value) {
    return String(value).replace(/\d/g, function (d) { return AR_DIGITS[d]; });
  }

  function get(path) {
    return path.split('.').reduce(function (o, k) { return o == null ? undefined : o[k]; }, C);
  }

  /* Text in [square brackets] is a placeholder waiting for real info — highlight it. */
  function setTextWithPlaceholders(node, text) {
    node.textContent = '';
    String(text).split(/(\[[^\]]+\])/).forEach(function (part) {
      if (!part) return;
      if (/^\[.*\]$/.test(part)) node.appendChild(el('span', { class: 'placeholder-text', text: part }));
      else node.appendChild(document.createTextNode(part));
    });
  }

  /* ---------- storage (always wrapped: private mode can throw) ---------- */
  function load(key) {
    try { var raw = localStorage.getItem(KEYS[key]); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
  }
  function save(key, value) {
    try { localStorage.setItem(KEYS[key], JSON.stringify(value)); return true; } catch (e) { return false; }
  }
  function clearAll() {
    try { Object.keys(KEYS).forEach(function (k) { localStorage.removeItem(KEYS[k]); }); } catch (e) { /* nothing stored */ }
  }

  /* ---------- content binding: <span data-c="initiativeName"></span> ---------- */
  function bindContent(root) {
    $$('[data-c]', root).forEach(function (node) {
      var v = get(node.getAttribute('data-c'));
      if (typeof v === 'string') setTextWithPlaceholders(node, v);
    });
  }

  /* ---------- header menu ---------- */
  function initMenu() {
    var btn = $('.menu-toggle');
    var menu = $('#site-menu');
    if (!btn || !menu) return;
    function set(open) {
      btn.setAttribute('aria-expanded', String(open));
      menu.hidden = !open;
    }
    btn.addEventListener('click', function () { set(menu.hidden); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.hidden) { set(false); btn.focus(); }
    });
    document.addEventListener('click', function (e) {
      if (!menu.hidden && !menu.contains(e.target) && !btn.contains(e.target)) set(false);
    });
  }

  /* ---------- gentle reveal on scroll ---------- */
  function initReveal() {
    var items = $$('.reveal');
    if (reducedMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (i) { i.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('is-in'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (i) { io.observe(i); });
  }

  /* ---------- toast ---------- */
  var toastTimer;
  function toast(message) {
    var t = $('#toast');
    if (!t) {
      t = el('div', { id: 'toast', class: 'toast', role: 'status', 'aria-live': 'polite' });
      document.body.appendChild(t);
    }
    t.textContent = message;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, 3200);
  }

  /* ---------- "clear my data" buttons ---------- */
  function initClearData(onCleared) {
    $$('[data-clear-data]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        clearAll();
        toast('تم مسح بياناتكِ المحفوظة على هذا الجهاز.');
        if (onCleared) onCleared();
      });
    });
  }

  /* ---------- site URL (for QR codes and share cards) ---------- */
  function siteUrl() {
    if (CONFIG.siteUrl) return CONFIG.siteUrl;
    return new URL('./', window.location.href).href;
  }

  /* ---------- QR (uses the bundled qrcode-generator, MIT) ---------- */
  function makeQr(text) {
    var qr = window.qrcode(0, 'M');
    qr.addData(text);
    qr.make();
    return qr;
  }
  function qrSvg(text, color) {
    var qr = makeQr(text);
    var n = qr.getModuleCount();
    var quiet = 2;
    var d = '';
    for (var r = 0; r < n; r++) {
      for (var c = 0; c < n; c++) {
        if (qr.isDark(r, c)) d += 'M' + (c + quiet) + ' ' + (r + quiet) + 'h1v1h-1z';
      }
    }
    var size = n + quiet * 2;
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + size + ' ' + size + '" shape-rendering="crispEdges" role="img" aria-label="رمز QR لرابط الموقع"><path fill="' + (color || '#03027A') + '" d="' + d + '"/></svg>';
  }

  /* ---------- downloads ---------- */
  function downloadBlob(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = el('a', { href: url, download: filename });
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  }

  /* ---------- monthly self-check reminder (.ics) ---------- */
  function icsEscape(s) { return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n'); }
  // iCalendar lines must be folded at 75 octets (Arabic letters are 2 bytes in UTF-8).
  function icsFold(line) {
    var out = [];
    var current = '';
    var bytes = 0;
    var enc = new TextEncoder();
    Array.from(line).forEach(function (ch) {
      var b = enc.encode(ch).length;
      if (bytes + b > (out.length ? 74 : 75)) { out.push(current); current = ''; bytes = 0; }
      current += ch;
      bytes += b;
    });
    out.push(current);
    return out.join('\r\n ');
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function ymd(d) { return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()); }

  function monthlyReminderIcs(dayOfMonth) {
    var now = new Date();
    var start = new Date(now.getFullYear(), now.getMonth(), dayOfMonth);
    if (start <= now) start = new Date(now.getFullYear(), now.getMonth() + 1, dayOfMonth);
    var end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1);
    var stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    var lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Al Estiqlal Private School 11آ//Self-check reminder//AR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:self-check-' + Date.now() + '@estiqlal-11a',
      'DTSTAMP:' + stamp,
      'DTSTART;VALUE=DATE:' + ymd(start),
      'DTEND;VALUE=DATE:' + ymd(end),
      'RRULE:FREQ=MONTHLY',
      'SUMMARY:' + icsEscape('🌸 موعدكِ الشهري: اعرفي جسمكِ'),
      'DESCRIPTION:' + icsEscape('خمس دقائق فقط: انظري في المرآة، وتحسّسي بلطف، ولاحظي أي تغيير جديد. إن لاحظتِ شيئًا، لا تقلقي ولا تؤجّلي: احجزي موعدًا مع طبيبة.\n' + (C.initiativeName || '') + ' · ' + (C.schoolName || '')),
      'TRANSP:TRANSPARENT',
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      'DESCRIPTION:' + icsEscape('موعدكِ الشهري للفحص الذاتي 🌸'),
      'TRIGGER:PT19H',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ];
    return lines.map(icsFold).join('\r\n') + '\r\n';
  }

  function initReminder() {
    var form = $('#reminder-form');
    if (!form) return;
    var select = $('#reminder-day', form);
    var today = new Date().getDate();
    for (var d = 1; d <= 28; d++) {
      select.appendChild(el('option', { value: d, text: 'يوم ' + arDigits(d) + ' من كل شهر' }));
    }
    select.value = String(Math.min(today, 28));
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ics = monthlyReminderIcs(parseInt(select.value, 10));
      downloadBlob(new Blob([ics], { type: 'text/calendar;charset=utf-8' }), 'monthly-self-check.ics');
      toast('افتحي الملف ليُضاف التذكير إلى تقويمكِ.');
    });
  }

  /* ---------- UAE resources + sources (footer) ---------- */
  function renderResources() {
    var list = $('#resources');
    if (list) {
      (C.resources || []).forEach(function (r) {
        var links = el('div', { class: 'resource__links' });
        links.appendChild(el('a', { href: r.url, rel: 'noopener', target: '_blank', text: r.urlLabel }));
        if (r.url2) links.appendChild(el('a', { href: r.url2, rel: 'noopener', target: '_blank', text: r.url2Label }));
        if (r.phone) {
          var phone = el('span');
          if (/^\[/.test(r.phone)) setTextWithPlaceholders(phone, r.phone);
          else {
            phone.appendChild(document.createTextNode('هاتف: '));
            phone.appendChild(el('a', { class: 'resource__phone', href: 'tel:' + r.phone.replace(/\s/g, ''), text: r.phone }));
          }
          links.appendChild(phone);
        }
        list.appendChild(el('li', { class: 'resource' }, [
          el('h4', { text: r.name }),
          el('p', { text: r.desc }),
          links
        ]));
      });
    }
    var sources = $('#sources');
    if (sources) {
      (C.sources || []).forEach(function (s) {
        sources.appendChild(el('li', {}, [el('a', { href: s.url, rel: 'noopener', target: '_blank', text: s.label })]));
      });
    }
  }

  function initCommon() {
    bindContent(document);
    initMenu();
    initReveal();
    renderResources();
  }

  return {
    $: $, $$: $$, el: el,
    arDigits: arDigits,
    content: C,
    config: CONFIG,
    reducedMotion: reducedMotion,
    load: load, save: save, clearAll: clearAll,
    bindContent: bindContent,
    initReveal: initReveal,
    initClearData: initClearData,
    initReminder: initReminder,
    initCommon: initCommon,
    setTextWithPlaceholders: setTextWithPlaceholders,
    toast: toast,
    siteUrl: siteUrl,
    makeQr: makeQr,
    qrSvg: qrSvg,
    downloadBlob: downloadBlob,
    monthlyReminderIcs: monthlyReminderIcs
  };
})();
