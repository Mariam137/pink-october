/* =====================================================================
   بطاقات قابلة للمشاركة (Canvas)  ·  Shareable image cards
   - result card (quiz)   - pledge card (index)
   Colors and fonts match the site. You normally don't need to edit this file.
   ===================================================================== */
var Cards = (function () {
  'use strict';

  var W = 1080;
  var H = 1350;
  var COLORS = {
    paper: '#FCE9EE', paperDeep: '#F4D6DF', surface: '#FFF8FA',
    ink: '#2E2A2B', inkSoft: '#5B5254',
    navy: '#03027A', berry: '#9E3B5C', berryDeep: '#7E2C48',
    rose: '#D89AA6', blush: '#F6D3DD', mustard: '#C99A2E'
  };
  var F = {
    display: '"Readex Pro", "IBM Plex Sans Arabic", sans-serif',
    body: '"IBM Plex Sans Arabic", sans-serif',
    hand: '"Aref Ruqaa", "IBM Plex Sans Arabic", serif'
  };

  /* ---------- helpers ---------- */
  function fontsReady() {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    var sample = 'أبجد ١٢٣';
    return Promise.all([
      document.fonts.load('700 60px "Readex Pro"', sample),
      document.fonts.load('400 30px "IBM Plex Sans Arabic"', sample),
      document.fonts.load('700 30px "IBM Plex Sans Arabic"', sample),
      document.fonts.load('700 60px "Aref Ruqaa"', sample)
    ]).catch(function () { /* fall back to system fonts */ });
  }

  var logoPromise;
  function loadLogo() {
    if (!logoPromise) {
      logoPromise = new Promise(function (resolve) {
        var img = new Image();
        img.onload = function () { resolve(img); };
        img.onerror = function () { resolve(null); };
        img.src = 'assets/logo.png';
      });
    }
    return logoPromise;
  }

  function newCanvas() {
    var canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    canvas.setAttribute('dir', 'rtl');
    var ctx = canvas.getContext('2d');
    ctx.direction = 'rtl';
    return { canvas: canvas, ctx: ctx };
  }

  // Deterministic pseudo-random so cards look the same each time.
  function rng(seed) {
    return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  }

  function paper(ctx, color, seed) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, W, H);
    var r = rng(seed || 7);
    for (var i = 0; i < 5200; i++) {
      ctx.fillStyle = r() > 0.5 ? 'rgba(46,42,43,0.045)' : 'rgba(255,255,255,0.18)';
      ctx.fillRect(r() * W, r() * H, 1.6, 1.6);
    }
  }

  function setFont(ctx, weight, size, family) { ctx.font = weight + ' ' + size + 'px ' + family; }

  function wrap(ctx, text, maxWidth) {
    var words = String(text).split(/\s+/);
    var lines = [];
    var line = '';
    words.forEach(function (w) {
      var test = line ? line + ' ' + w : w;
      if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = w; }
      else line = test;
    });
    if (line) lines.push(line);
    return lines;
  }

  function textCenter(ctx, text, y, maxWidth, lineHeight) {
    ctx.textAlign = 'center';
    var lines = wrap(ctx, text, maxWidth);
    lines.forEach(function (l, i) { ctx.fillText(l, W / 2, y + i * lineHeight); });
    return y + lines.length * lineHeight;
  }

  function wobblyLine(ctx, x1, x2, y, color, width) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y);
    var seg = (x2 - x1) / 4;
    ctx.bezierCurveTo(x1 + seg, y - 9, x1 + seg * 1.6, y + 8, x1 + seg * 2, y + 1);
    ctx.bezierCurveTo(x1 + seg * 2.6, y - 7, x1 + seg * 3.3, y + 7, x2, y - 3);
    ctx.stroke();
    ctx.restore();
  }

  function star(ctx, cx, cy, r, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    for (var i = 0; i <= 10; i++) {
      var a = -Math.PI / 2 + i * Math.PI / 5;
      var rr = (i % 2 ? r * 0.45 : r) * (1 + (i % 3) * 0.04);
      var x = cx + Math.cos(a) * rr;
      var y = cy + Math.sin(a) * rr;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();
  }

  function flower(ctx, cx, cy, r, petal, center) {
    ctx.save();
    ctx.translate(cx, cy);
    for (var i = 0; i < 5; i++) {
      ctx.rotate((Math.PI * 2) / 5);
      ctx.beginPath();
      ctx.ellipse(0, -r * 0.62, r * 0.36, r * 0.55, 0.08 * i, 0, Math.PI * 2);
      ctx.fillStyle = petal;
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.26, 0, Math.PI * 2);
    ctx.fillStyle = center;
    ctx.fill();
    ctx.restore();
  }

  function tape(ctx, cx, cy, w, h, angle, color) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.fillStyle = color;
    ctx.beginPath();
    var steps = 9;
    ctx.moveTo(-w / 2, -h / 2);
    for (var i = 1; i <= steps; i++) ctx.lineTo(-w / 2 + (w * i) / steps, -h / 2 + (i % 2 ? 4 : 0));
    for (var j = steps; j >= 0; j--) ctx.lineTo(-w / 2 + (w * j) / steps, h / 2 - (j % 2 ? 4 : 0));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function qrTile(ctx, x, y, size, url) {
    ctx.save();
    ctx.fillStyle = COLORS.rose;
    roundRect(ctx, x + 10, y + 12, size, size, 22);
    ctx.fill();
    ctx.fillStyle = '#fff';
    roundRect(ctx, x, y, size, size, 22);
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = COLORS.navy;
    ctx.stroke();
    try {
      var qr = Site.makeQr(url || Site.siteUrl());
      var n = qr.getModuleCount();
      var pad = size * 0.09;
      var cell = (size - pad * 2) / n;
      ctx.fillStyle = COLORS.navy;
      for (var r = 0; r < n; r++) {
        for (var c = 0; c < n; c++) {
          if (qr.isDark(r, c)) ctx.fillRect(Math.floor(x + pad + c * cell), Math.floor(y + pad + r * cell), Math.ceil(cell), Math.ceil(cell));
        }
      }
    } catch (e) { /* QR library missing — keep the empty tile */ }
    ctx.restore();
  }

  function drawLogo(ctx, logo, x, y, width) {
    if (!logo) return;
    var h = width * (logo.naturalHeight / logo.naturalWidth);
    ctx.drawImage(logo, x, y, width, h);
  }

  /* ---------- result card ---------- */
  function drawResult(result) {
    return Promise.all([fontsReady(), loadLogo()]).then(function (res) {
      var logo = res[1];
      var C = Site.content;
      var o = newCanvas();
      var ctx = o.ctx;
      paper(ctx, COLORS.paper, 11);

      // header: logo (top-left corner) + initiative name (right, RTL start)
      drawLogo(ctx, logo, 64, 56, 104);
      ctx.fillStyle = COLORS.navy;
      ctx.textAlign = 'right';
      setFont(ctx, 700, 46, F.display);
      ctx.fillText(C.initiativeName, W - 70, 112);
      ctx.fillStyle = COLORS.inkSoft;
      setFont(ctx, 400, 28, F.body);
      ctx.fillText(C.schoolName, W - 70, 162);
      wobblyLine(ctx, 70, W - 70, 222, COLORS.rose, 4);

      // title
      ctx.fillStyle = COLORS.berryDeep;
      setFont(ctx, 600, 40, F.display);
      textCenter(ctx, QUIZ_DATA.resultTitle, 316, W - 160, 50);

      // gauge
      var cx = W / 2;
      var cy = 560;
      var r = 190;
      ctx.lineCap = 'round';
      ctx.lineWidth = 34;
      ctx.strokeStyle = COLORS.paperDeep;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.save();
      ctx.setLineDash([6, 14]);
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = COLORS.rose;
      ctx.beginPath();
      ctx.ellipse(cx + 3, cy - 2, r + 34, r + 30, 0.1, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      if (result.percent > 0) {
        ctx.lineWidth = 34;
        ctx.strokeStyle = COLORS.berry;
        ctx.beginPath();
        ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * result.percent) / 100);
        ctx.stroke();
      }
      ctx.fillStyle = COLORS.navy;
      ctx.textAlign = 'center';
      setFont(ctx, 700, 136, F.display);
      ctx.fillText(Site.arDigits(result.percent) + '٪', cx, cy + 48);

      star(ctx, cx + r + 70, cy - r + 10, 30, COLORS.mustard);
      flower(ctx, cx - r - 60, cy + r - 20, 46, 'rgba(216,154,166,0.85)', COLORS.mustard);

      // level
      ctx.fillStyle = COLORS.navy;
      setFont(ctx, 700, 66, F.display);
      var y = textCenter(ctx, result.level.title, 880, W - 160, 84);
      ctx.fillStyle = COLORS.berry;
      setFont(ctx, 700, 44, F.hand);
      textCenter(ctx, 'اختبرتُ وعيي… وجاء دوركِ!', y + 20, W - 160, 60);

      // footer: QR on the left, text on the right
      qrTile(ctx, 70, 1056, 210, new URL('quiz.html', Site.siteUrl()).href);
      ctx.textAlign = 'right';
      ctx.fillStyle = COLORS.navy;
      setFont(ctx, 700, 40, F.display);
      ctx.fillText('اختبري نفسكِ: «' + QUIZ_DATA.title + '»', W - 70, 1110);
      ctx.fillStyle = COLORS.ink;
      setFont(ctx, 400, 30, F.body);
      ctx.fillText(C.credit + ' · ' + C.schoolName, W - 70, 1166);
      ctx.fillStyle = COLORS.inkSoft;
      setFont(ctx, 400, 25, F.body);
      ctx.fillText('مؤشر للعادات والوعي فقط، وليس تشخيصًا طبيًا.', W - 70, 1222);
      return o.canvas;
    });
  }

  /* ---------- pledge card ---------- */
  function drawPledge(pledgeText, name) {
    return Promise.all([fontsReady(), loadLogo()]).then(function (res) {
      var logo = res[1];
      var C = Site.content;
      var o = newCanvas();
      var ctx = o.ctx;
      paper(ctx, COLORS.blush, 23);

      // paper sheet, slightly rotated
      ctx.save();
      ctx.translate(W / 2, H / 2);
      ctx.rotate(-0.022);
      ctx.shadowColor = 'rgba(46,42,43,0.28)';
      ctx.shadowBlur = 40;
      ctx.shadowOffsetY = 18;
      ctx.fillStyle = COLORS.surface;
      ctx.fillRect(-440, -560, 880, 1110);
      ctx.restore();
      tape(ctx, W / 2, 112, 230, 58, 0.05, 'rgba(201,154,46,0.42)');

      drawLogo(ctx, logo, 130, 168, 92);
      flower(ctx, W - 175, 225, 44, 'rgba(216,154,166,0.9)', COLORS.mustard);

      ctx.fillStyle = COLORS.berry;
      setFont(ctx, 700, 92, F.hand);
      ctx.textAlign = 'center';
      ctx.fillText('تعهّد وردي', W / 2, 390);

      ctx.fillStyle = COLORS.inkSoft;
      setFont(ctx, 400, 34, F.body);
      ctx.fillText('في أكتوبر هذا، أعدُ نفسي بخطوة صغيرة:', W / 2, 480);

      ctx.fillStyle = COLORS.navy;
      setFont(ctx, 700, 66, F.display);
      var lines = wrap(ctx, '«' + pledgeText + '»', 720);
      var startY = 620 - (lines.length - 1) * 30;
      lines.forEach(function (l, i) { ctx.fillText(l, W / 2, startY + i * 92); });
      var endY = startY + (lines.length - 1) * 92;
      wobblyLine(ctx, W / 2 - 230, W / 2 + 230, endY + 46, COLORS.rose, 7);

      // signature
      ctx.fillStyle = COLORS.berryDeep;
      setFont(ctx, 700, 56, F.hand);
      if (name) {
        ctx.fillText('— ' + name, W / 2, endY + 190);
      } else {
        ctx.strokeStyle = COLORS.inkSoft;
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 9]);
        ctx.beginPath();
        ctx.moveTo(W / 2 - 200, endY + 190);
        ctx.lineTo(W / 2 + 200, endY + 190);
        ctx.stroke();
        ctx.setLineDash([]);
        setFont(ctx, 400, 26, F.body);
        ctx.fillStyle = COLORS.inkSoft;
        ctx.fillText('التوقيع', W / 2, endY + 232);
      }

      // bottom
      star(ctx, 190, 1010, 26, COLORS.mustard);
      qrTile(ctx, 130, 1052, 150);
      ctx.textAlign = 'right';
      ctx.fillStyle = COLORS.navy;
      setFont(ctx, 700, 40, F.display);
      ctx.fillText(C.initiativeName, W - 130, 1110);
      ctx.fillStyle = COLORS.inkSoft;
      setFont(ctx, 400, 27, F.body);
      ctx.fillText(C.credit + ' · ' + C.schoolName, W - 130, 1160);
      return o.canvas;
    });
  }

  /* ---------- dialog: preview + save + share ---------- */
  var dialog;
  function getDialog() {
    if (dialog) return dialog;
    dialog = Site.el('dialog', { class: 'card-dialog', 'aria-labelledby': 'card-dialog-title' });
    dialog.innerHTML =
      '<div class="card-dialog__inner">' +
      '  <div class="card-dialog__head"><h2 id="card-dialog-title"></h2>' +
      '  <button type="button" class="card-dialog__close" aria-label="إغلاق">×</button></div>' +
      '  <img alt="">' +
      '  <div class="btn-row">' +
      '    <button type="button" class="btn" data-act="save">حفظ الصورة</button>' +
      '    <button type="button" class="btn btn--ghost" data-act="share" hidden>مشاركة</button>' +
      '  </div>' +
      '</div>';
    document.body.appendChild(dialog);
    dialog.querySelector('.card-dialog__close').addEventListener('click', function () { dialog.close(); });
    dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });
    return dialog;
  }

  function showCard(canvas, opts) {
    var d = getDialog();
    var img = d.querySelector('img');
    var save = d.querySelector('[data-act="save"]');
    var share = d.querySelector('[data-act="share"]');
    d.querySelector('h2').textContent = opts.title;
    img.alt = opts.alt;

    canvas.toBlob(function (blob) {
      if (!blob) return;
      var url = URL.createObjectURL(blob);
      img.src = url;
      var file = null;
      try { file = new File([blob], opts.filename, { type: 'image/png' }); } catch (e) { file = null; }
      var canShare = !!(file && navigator.canShare && navigator.canShare({ files: [file] }));
      share.hidden = !canShare;
      save.onclick = function () { Site.downloadBlob(blob, opts.filename); };
      share.onclick = function () {
        navigator.share({ files: [file], title: opts.title, text: opts.text }).catch(function () { /* user cancelled */ });
      };
      if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open', '');
      d.addEventListener('close', function onClose() {
        URL.revokeObjectURL(url);
        d.removeEventListener('close', onClose);
      });
    }, 'image/png');
  }

  return { drawResult: drawResult, drawPledge: drawPledge, showCard: showCard };
})();
