/**
 * اختياري: استقبال نتائج مجهولة الهوية من الاختبار وحساب متوسط المدرسة.
 * Optional: receives anonymous quiz results and returns the school average.
 *
 * Stored per row: time, percent, score, level, role. No names, no answers, no IP.
 * Setup steps are in README.md → "Google Sheets (optional)".
 */
const SHEET_NAME = 'Results';
const ROLES = ['student', 'teacher', 'staff', 'other', 'unknown'];
const LEVELS = ['aware', 'on-track', 'good-start', 'learn-together'];

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['time', 'percent', 'score', 'level', 'role']);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** POST: add one anonymous result. */
function doPost(e) {
  let data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return json_({ ok: false, error: 'bad json' });
  }
  const percent = Number(data.percent);
  const score = Number(data.score);
  if (!Number.isInteger(percent) || percent < 0 || percent > 100) return json_({ ok: false, error: 'bad percent' });
  if (!Number.isInteger(score) || score < 0 || score > 20) return json_({ ok: false, error: 'bad score' });
  const role = ROLES.indexOf(data.role) >= 0 ? data.role : 'unknown';
  const level = LEVELS.indexOf(data.level) >= 0 ? data.level : '';

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    getSheet_().appendRow([new Date(), percent, score, level, role]);
  } finally {
    lock.releaseLock();
  }
  return json_({ ok: true });
}

/** GET: return { count, average } so the site (and the workshop screen) can show the school average. */
function doGet() {
  const sheet = getSheet_();
  const rows = Math.max(sheet.getLastRow() - 1, 0);
  if (!rows) return json_({ count: 0, average: null });
  const values = sheet.getRange(2, 2, rows, 1).getValues();
  let sum = 0;
  values.forEach(function (r) { sum += Number(r[0]) || 0; });
  return json_({ count: rows, average: Math.round((sum / rows) * 10) / 10 });
}
