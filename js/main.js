/* =====================================================================
   الصفحة الرئيسية  ·  Home page behaviour
   Content comes from content.js — edit text there, not here.
   ===================================================================== */
(function () {
  'use strict';
  var $ = Site.$, $$ = Site.$$, el = Site.el, C = Site.content;

  var TAP_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12.5c1.8-4.6 6.9-7 11.4-5.2 2.2.9 3.7 2.6 4.4 4.6"/><path d="M20.3 7.4l-.4 4.6-4.4-1.2"/></svg>';

  /* ---------- myths: flip cards ---------- */
  function renderMyths() {
    var list = $('#myth-list');
    if (!list) return;
    (C.myths || []).forEach(function (m, i) {
      var isFact = m.verdict === 'fact';
      var btn = el('button', { type: 'button', class: 'flip', 'aria-pressed': 'false' });
      btn.innerHTML =
        '<span class="flip__inner">' +
        '  <span class="flip__face flip__front">' +
        (i % 3 === 0 ? '<span class="tape' + (i % 2 ? ' tape--mustard' : '') + '" aria-hidden="true"></span>' : '') +
        '    <span class="flip__claim"></span>' +
        '    <span class="flip__hint">' + TAP_ICON + 'خرافة أم حقيقة؟ اضغطي لتعرفي</span>' +
        '  </span>' +
        '  <span class="flip__face flip__back" data-verdict="' + (isFact ? 'fact' : 'myth') + '" aria-hidden="true">' +
        '    <span class="stamp">' + (isFact ? 'حقيقة' : 'خرافة') + '</span>' +
        '    <span class="flip__answer"></span>' +
        '  </span>' +
        '</span>';
      $('.flip__claim', btn).textContent = '«' + m.claim + '»';
      $('.flip__answer', btn).textContent = m.answer;
      var front = $('.flip__front', btn);
      var back = $('.flip__back', btn);
      btn.addEventListener('click', function () {
        var on = btn.getAttribute('aria-pressed') !== 'true';
        btn.setAttribute('aria-pressed', String(on));
        front.setAttribute('aria-hidden', String(on));
        back.setAttribute('aria-hidden', String(!on));
      });
      list.appendChild(el('li', {}, [btn]));
    });
  }

  /* ---------- workshop topics ---------- */
  function renderWorkshop() {
    var list = $('#agenda');
    if (!list || !C.workshop) return;
    C.workshop.topics.forEach(function (t) {
      var text = el('span');
      Site.setTextWithPlaceholders(text, t);
      list.appendChild(el('li', {}, [text]));
    });
  }

  /* ---------- team letter ---------- */
  function renderLetter() {
    var body = $('#letter-body');
    if (!body || !C.teamLetter) return;
    C.teamLetter.paragraphs.forEach(function (p) { body.appendChild(el('p', { text: p })); });
  }

  /* ---------- FAQ ---------- */
  function renderFaq() {
    var wrap = $('#faq-list');
    if (!wrap) return;
    (C.faq || []).forEach(function (f) {
      var d = el('details');
      d.appendChild(el('summary', { text: f.q }));
      var body = el('div');
      body.appendChild(el('p', { text: f.a }));
      d.appendChild(body);
      wrap.appendChild(d);
    });
  }

  /* ---------- pledge ---------- */
  function initPledge() {
    var form = $('#pledge-form');
    if (!form) return;
    var group = $('#pledge-options', form);
    var saved = Site.load('pledge');
    (C.pledges || []).forEach(function (p, i) {
      var input = el('input', { type: 'radio', name: 'pledge', value: p, id: 'pledge-' + i });
      if ((saved && saved.text === p) || (!saved && i === 0)) input.checked = true;
      var label = el('label', { class: 'chip-radio', for: 'pledge-' + i }, [input, el('span', { text: p })]);
      group.appendChild(label);
    });
    var preview = $('#pledge-preview');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var choice = form.querySelector('input[name="pledge"]:checked');
      if (!choice) return;
      var name = $('#pledge-name', form).value.trim().slice(0, 30);
      Site.save('pledge', { text: choice.value, date: new Date().toISOString() });
      Cards.drawPledge(choice.value, name).then(function (canvas) {
        var img = el('img', { alt: 'بطاقة تعهّد: ' + choice.value });
        img.src = canvas.toDataURL('image/png');
        preview.innerHTML = '';
        preview.appendChild(img);
        Cards.showCard(canvas, {
          title: 'بطاقة تعهّدكِ جاهزة 🌸',
          alt: 'بطاقة تعهّد: ' + choice.value,
          filename: 'pink-pledge.png',
          text: 'تعهّدي الوردي: ' + choice.value
        });
      });
    });
  }

  /* ---------- last saved quiz result ---------- */
  function showLastResult() {
    var box = $('#last-result');
    if (!box) return;
    var last = Site.load('result');
    if (!last || typeof last.percent !== 'number') { box.hidden = true; return; }
    $('#last-result-pct', box).textContent = Site.arDigits(last.percent) + '٪';
    $('#last-result-level', box).textContent = last.levelTitle || '';
    box.hidden = false;
  }

  /* ---------- floating "start quiz" button on mobile ---------- */
  function initFloatingCta() {
    var cta = $('#float-cta');
    var hero = $('#top');
    if (!cta || !hero || !('IntersectionObserver' in window)) return;
    var pastHero = false;
    var hideZone = false;
    function update() { cta.classList.toggle('is-visible', pastHero && !hideZone); }
    new IntersectionObserver(function (entries) {
      pastHero = !entries[0].isIntersecting;
      update();
    }).observe(hero);
    // hide it where it would be redundant (quiz teaser) or cover buttons/forms
    var zones = $$('#quiz, #pledge-form, #reminder-form, .site-footer');
    var visible = new Set();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) visible.add(en.target); else visible.delete(en.target); });
      hideZone = visible.size > 0;
      update();
    });
    zones.forEach(function (z) { io.observe(z); });
  }

  renderMyths();
  renderWorkshop();
  renderLetter();
  renderFaq();
  Site.initCommon();
  Site.initReminder();
  initPledge();
  showLastResult();
  initFloatingCta();
  Site.initClearData(showLastResult);
})();
