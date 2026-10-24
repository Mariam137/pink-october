/* =====================================================================
   إعدادات الموقع  ·  Site settings
   ---------------------------------------------------------------------
   ✏️ عدّلوا هذا الملف فقط عند النشر أو عند تفعيل Google Sheets.
   ✏️ Edit this file when you deploy, or to turn on Google Sheets.
   ===================================================================== */
var SITE_CONFIG = {
  /* رابط الموقع بعد النشر (يُستخدم في رموز QR وبطاقات المشاركة).
     اتركوه فارغًا ليُستخدم رابط الصفحة الحالي تلقائيًا.
     The public URL after deploying, e.g. 'https://our-school.github.io/breast-cancer/'.
     Leave empty to use the current page address automatically. */
  siteUrl: 'https://mariam137.github.io/pink-october/',

  /* اختياري: إرسال نتيجة مجهولة (النسبة + الدور فقط، بلا أسماء) إلى Google Sheet.
     مُطفأ افتراضيًا. راجعوا README قبل التفعيل.
     Optional: send an anonymous result (percentage + role only, no names)
     to a Google Sheet. OFF by default. See README before enabling. */
  sheets: {
    enabled: false,
    url: '' // رابط Google Apps Script Web App ينتهي بـ /exec
  }
};
