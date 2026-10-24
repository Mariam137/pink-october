/* =====================================================================
   صفحة الاختبار  ·  Quiz page behaviour
   Questions, points and tips live in quiz-data.js — edit them there.
   ===================================================================== */
(function () {
  'use strict';
  var $ = Site.$, $$ = Site.$$, el = Site.el, ar = Site.arDigits;
  var D = QUIZ_DATA;
  var sheets = Site.config.sheets || {};
  var sheetsOn = !!(sheets.enabled && sheets.url);

  var state = { step: 0, answers: {}, profile: {}, bonusStep: 0, bonusRight: 0 };
  var lastPointer = 0; // to auto-advance only after a tap/click, never after arrow keys
  var advanceTimer;

  var CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.2 4.3L19 7.5"/></svg>';

  /* ---------- screens ---------- */
  function show(id, opts) {
    opts = opts || {};
    $$('.screen').forEach(function (s) { s.hidden = s.id !== id; });
    var screen = document.getElementById(id);
    screen.classList.remove('screen-enter', 'screen-enter--back');
    if (!Site.reducedMotion) {
      void screen.offsetWidth; // restart the animation
      screen.classList.add('screen-enter');
      if (opts.back) screen.classList.add('screen-enter--back');
    }
    window.scrollTo({ top: 0, behavior: Site.reducedMotion ? 'auto' : 'smooth' });
    var focusTarget = $('[data-focus]', screen) || screen;
    focusTarget.focus({ preventScroll: true });
  }

  /* ---------- intro ---------- */
  function initIntro() {
    $('#quiz-title').textContent = D.title;
    $('#q-count').textContent = ar(D.questions.length) + ' أسئلة';
    if (sheetsOn) {
      $('#privacy-text').textContent = 'إجاباتكِ تبقى على جهازكِ. في النهاية يمكنكِ، إن أردتِ، أن ترسلي نسبتكِ ودوركِ فقط (بلا اسم ولا إجابات) لنحسب متوسط المدرسة في الورشة.';
    }
    $('#start-btn').addEventListener('click', function () { show('screen-profile'); });
    showReturning();
  }

  function showReturning() {
    var box = $('#returning');
    var last = Site.load('result');
    if (!last || !last.answers) { box.hidden = true; return; }
    $('#returning-pct').textContent = ar(last.percent) + '٪';
    box.hidden = false;
  }

  /* ---------- profile (optional) ---------- */
  function initProfile() {
    var form = $('#profile-form');
    ['role', 'age'].forEach(function (key) {
      var wrap = $('#profile-' + key);
      D.profile[key].options.forEach(function (o) {
        var input = el('input', { type: 'radio', name: key, value: o.id });
        wrap.appendChild(el('label', { class: 'pill' }, [input, el('span', { text: o.label })]));
      });
      $('#profile-' + key + '-label').textContent = D.profile[key].label;
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var role = form.querySelector('input[name="role"]:checked');
      var age = form.querySelector('input[name="age"]:checked');
      state.profile = { role: role ? role.value : undefined, age: age ? age.value : undefined };
      startQuestions();
    });
    $('#skip-profile').addEventListener('click', function () {
      state.profile = {};
      startQuestions();
    });
    $('#profile-back').addEventListener('click', function () { show('screen-intro', { back: true }); });
  }

  function startQuestions() {
    state.step = 0;
    renderQuestion();
    show('screen-question');
  }

  /* ---------- questions ---------- */
  function renderQuestion(back) {
    var q = D.questions[state.step];
    var total = D.questions.length;
    $('#progress-text').innerHTML = 'سؤال <strong>' + ar(state.step + 1) + '</strong> من ' + ar(total);
    var bar = $('#progress-bar');
    bar.setAttribute('aria-valuenow', String(state.step + 1));
    bar.setAttribute('aria-valuemax', String(total));
    bar.setAttribute('aria-valuetext', 'سؤال ' + (state.step + 1) + ' من ' + total);
    $('#progress-fill').style.width = ((state.step + 1) / total) * 100 + '%';

    var fs = $('#question');
    fs.innerHTML = '';
    var legend = el('legend');
    legend.appendChild(el('span', { class: 'question__topic', text: q.topic }));
    legend.appendChild(document.createTextNode(q.text));
    fs.appendChild(legend);
    var answers = el('div', { class: 'answers' });
    q.options.forEach(function (o, i) {
      var id = q.id + '-o' + i;
      var input = el('input', { type: 'radio', name: q.id, id: id, value: String(i) });
      if (state.answers[q.id] === i) input.checked = true;
      var card = el('span', { class: 'answer__card' });
      card.innerHTML = '<span class="answer__mark">' + CHECK + '</span>';
      card.appendChild(el('span', { text: o.text }));
      var label = el('label', { class: 'answer', for: id }, [input, card]);
      label.addEventListener('pointerdown', function () { lastPointer = Date.now(); });
      answers.appendChild(label);
    });
    fs.appendChild(answers);

    var next = $('#next-btn');
    next.textContent = state.step === total - 1 ? 'اعرضي نتيجتي' : 'التالي';
    next.disabled = state.answers[q.id] === undefined;
    $('#prev-btn').textContent = state.step === 0 ? 'رجوع' : 'السابق';

    if (back !== undefined) show('screen-question', { back: back });
  }

  function onAnswer(e) {
    if (!e.target.matches('input[type="radio"]')) return;
    var q = D.questions[state.step];
    state.answers[q.id] = parseInt(e.target.value, 10);
    $('#next-btn').disabled = false;

    var label = e.target.closest('.answer');
    label.classList.remove('is-popping');
    void label.offsetWidth;
    label.classList.add('is-popping');

    clearTimeout(advanceTimer);
    if (Date.now() - lastPointer < 1200) {
      advanceTimer = setTimeout(goNext, Site.reducedMotion ? 250 : 650);
    }
  }

  function goNext() {
    clearTimeout(advanceTimer);
    var q = D.questions[state.step];
    if (state.answers[q.id] === undefined) return;
    if (state.step < D.questions.length - 1) {
      state.step++;
      renderQuestion(false);
    } else {
      finish();
    }
  }

  function goPrev() {
    clearTimeout(advanceTimer);
    if (state.step === 0) { show('screen-profile', { back: true }); return; }
    state.step--;
    renderQuestion(true);
  }

  function finish() {
    var result = QuizLogic.computeResult(D, state.answers, state.profile);
    Site.save('result', {
      answers: state.answers,
      profile: state.profile,
      percent: result.percent,
      levelTitle: result.level.title,
      date: new Date().toISOString()
    });
    renderResults(result);
  }

  /* ---------- results ---------- */
  function renderResults(result) {
    state.result = result;
    $('#result-kicker').textContent = D.resultTitle;
    $('#level-title').textContent = result.level.title;
    $('#level-msg').textContent = result.level.message;

    var notes = $('#result-notes');
    notes.innerHTML = '';
    notes.appendChild(el('p', { text: result.ageNote }));
    if (result.roleNote) notes.appendChild(el('p', { text: result.roleNote }));

    var strengths = $('#strengths');
    strengths.innerHTML = '';
    $('#strengths-empty').hidden = result.strengths.length > 0;
    result.strengths.forEach(function (s) { strengths.appendChild(el('li', { text: s.text })); });

    var tips = $('#tips');
    tips.innerHTML = '';
    $('#tips-block').hidden = result.tips.length === 0;
    result.tips.forEach(function (t) {
      var li = el('li', { class: 'tip' });
      li.appendChild(el('span', { class: 'tip__topic', text: t.topic }));
      li.appendChild(el('p', { text: t.text }));
      if (t.link) li.appendChild(el('a', { href: t.link.href, text: 'اقرئي أكثر: ' + t.link.label + ' ←' }));
      tips.appendChild(li);
    });

    $('#result-disclaimer').textContent = D.disclaimer;
    $('#bonus-invite').hidden = !(D.bonus && D.bonus.enabled);
    $('#sheets-box').hidden = !sheetsOn;
    $('#sheets-status').textContent = '';
    $('#sheets-send').disabled = false;

    show('screen-results');
    animateGauge(result.percent);
  }

  function animateGauge(percent) {
    var arc = $('#gauge-value');
    var num = $('#gauge-num');
    var label = $('#gauge');
    label.setAttribute('aria-label', 'نسبتكِ ' + percent + ' بالمئة');
    if (Site.reducedMotion) {
      arc.style.strokeDashoffset = String(100 - percent);
      num.textContent = ar(percent) + '٪';
      return;
    }
    var start = null;
    var dur = 1400;
    arc.style.strokeDashoffset = '100';
    function frame(t) {
      if (!start) start = t;
      var p = Math.min(1, (t - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      var v = Math.round(percent * eased);
      arc.style.strokeDashoffset = String(100 - percent * eased);
      num.textContent = ar(v) + '٪';
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function restart() {
    state = { step: 0, answers: {}, profile: {}, bonusStep: 0, bonusRight: 0 };
    $('#profile-form').reset();
    showReturning();
    show('screen-intro', { back: true });
  }

  /* ---------- share result card ---------- */
  function shareResult() {
    if (!state.result) return;
    Cards.drawResult(state.result).then(function (canvas) {
      Cards.showCard(canvas, {
        title: 'بطاقة نتيجتكِ جاهزة',
        alt: D.resultTitle + ': ' + state.result.percent + '٪ — ' + state.result.level.title,
        filename: 'awareness-score.png',
        text: 'مؤشر وعيي ووقايتي: ' + state.result.percent + '٪. جرّبي الاختبار: ' + Site.siteUrl()
      });
    });
  }

  /* ---------- bonus round (does not affect the score) ---------- */
  function startBonus() {
    state.bonusStep = 0;
    state.bonusRight = 0;
    $('#bonus-title').textContent = D.bonus.title;
    $('#bonus-intro').textContent = D.bonus.intro;
    renderBonus();
    show('screen-bonus');
  }

  function renderBonus() {
    var b = D.bonus.questions[state.bonusStep];
    var total = D.bonus.questions.length;
    $('#bonus-progress').textContent = 'سؤال ' + ar(state.bonusStep + 1) + ' من ' + ar(total);
    var fs = $('#bonus-question');
    fs.innerHTML = '';
    fs.appendChild(el('legend', { text: b.text }));
    var answers = el('div', { class: 'answers' });
    b.options.forEach(function (o, i) {
      var id = 'b' + state.bonusStep + '-o' + i;
      var input = el('input', { type: 'radio', name: 'bonus', id: id, value: String(i) });
      var card = el('span', { class: 'answer__card' });
      card.innerHTML = '<span class="answer__mark">' + CHECK + '</span>';
      card.appendChild(el('span', { text: o.text }));
      answers.appendChild(el('label', { class: 'answer', for: id }, [input, card]));
    });
    fs.appendChild(answers);
    var fb = $('#bonus-feedback');
    fb.hidden = true;
    fb.className = 'bonus-feedback';
    var next = $('#bonus-next');
    next.hidden = true;
    next.textContent = state.bonusStep === total - 1 ? 'النتيجة' : 'السؤال التالي';
    $('#bonus-summary').hidden = true;
    fs.hidden = false;
  }

  function onBonusAnswer(e) {
    if (!e.target.matches('input[type="radio"]')) return;
    var b = D.bonus.questions[state.bonusStep];
    var chosen = parseInt(e.target.value, 10);
    var right = !!b.options[chosen].correct;
    if (right) state.bonusRight++;
    $$('#bonus-question .answer').forEach(function (label, i) {
      var input = $('input', label);
      input.disabled = true;
      if (b.options[i].correct) label.classList.add('is-correct');
      else if (i === chosen) label.classList.add('is-wrong');
    });
    var fb = $('#bonus-feedback');
    fb.innerHTML = '';
    fb.appendChild(el('strong', { text: right ? 'أحسنتِ! ' : 'قريبة! ' }));
    fb.appendChild(document.createTextNode(b.explanation));
    fb.classList.toggle('is-right', right);
    fb.hidden = false;
    var next = $('#bonus-next');
    next.hidden = false;
    next.focus();
  }

  function bonusNext() {
    if (state.bonusStep < D.bonus.questions.length - 1) {
      state.bonusStep++;
      renderBonus();
      $('#bonus-question').focus();
      return;
    }
    $('#bonus-question').hidden = true;
    $('#bonus-feedback').hidden = true;
    $('#bonus-next').hidden = true;
    var sum = $('#bonus-summary');
    $('#bonus-score').textContent = 'أجبتِ إجابة صحيحة عن ' + ar(state.bonusRight) + ' من ' + ar(D.bonus.questions.length) + '.';
    sum.hidden = false;
    $('#bonus-summary-title').focus();
  }

  /* ---------- optional: anonymous school average (Google Sheets) ---------- */
  function sendToSheet() {
    if (!sheetsOn || !state.result) return;
    var btn = $('#sheets-send');
    var status = $('#sheets-status');
    btn.disabled = true;
    status.textContent = 'جارٍ الإرسال…';
    var payload = {
      percent: state.result.percent,
      score: state.result.score,
      level: state.result.level.id,
      role: state.profile.role || 'unknown'
    };
    fetch(sheets.url, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    }).then(function () {
      status.textContent = 'شكرًا! أُضيفت نتيجتكِ بلا اسم.';
      return fetch(sheets.url).then(function (r) { return r.json(); });
    }).then(function (avg) {
      if (avg && typeof avg.average === 'number' && avg.count) {
        status.textContent += ' متوسط المدرسة حتى الآن: ' + ar(Math.round(avg.average)) + '٪ (' + ar(avg.count) + ' مشاركة).';
      }
    }).catch(function () {
      status.textContent = 'تعذّر الإرسال الآن. لا بأس، نتيجتكِ محفوظة على جهازكِ.';
      btn.disabled = false;
    });
  }

  /* ---------- wire up ---------- */
  function init() {
    Site.initCommon();
    document.title = D.title + ' · ' + Site.content.initiativeName;
    initIntro();
    initProfile();

    $('#question').addEventListener('change', onAnswer);
    $('#question-form').addEventListener('submit', function (e) { e.preventDefault(); goNext(); });
    $('#prev-btn').addEventListener('click', goPrev);

    $('#restart-btn').addEventListener('click', restart);
    $('#share-btn').addEventListener('click', shareResult);
    $('#bonus-start').addEventListener('click', startBonus);
    $('#bonus-question').addEventListener('change', onBonusAnswer);
    $('#bonus-next').addEventListener('click', bonusNext);
    $('#bonus-back').addEventListener('click', function () { show('screen-results', { back: true }); });
    $('#sheets-send').addEventListener('click', sendToSheet);

    $('#returning-view').addEventListener('click', function () {
      var last = Site.load('result');
      if (!last || !last.answers) return;
      try {
        state.answers = last.answers;
        state.profile = last.profile || {};
        renderResults(QuizLogic.computeResult(D, state.answers, state.profile));
      } catch (err) {
        // Saved answers no longer match the questions (content was edited) — start fresh.
        Site.clearAll();
        showReturning();
      }
    });

    Site.initClearData(function () {
      showReturning();
      if (!$('#screen-results').hidden) restart();
    });
  }

  init();
})();
