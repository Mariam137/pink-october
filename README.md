# لأجلكِ يُزهر أكتوبر 🌸

مبادرة توعوية بسرطان الثدي من **طالبات الصف 11آ** في **مدرسة الاستقلال الخاصة**.
A breast cancer awareness site by Grade 11آ students at Al Estiqlal Private School.

> [!IMPORTANT]
> **قبل الورشة:** اطلبوا من ممرضة المدرسة أو معلّمة الصحة مراجعة كل المحتوى الطبي في الموقع.
> **Before the workshop:** have the school nurse or a health teacher review all medical content.

---

## بالعربية

### ما هذا الموقع؟
موقع بسيط من ثلاث صفحات، بدون أي برامج إضافية أو خادم:

| الملف | ما هو |
|---|---|
| `index.html` | الصفحة الرئيسية: المعلومات، الخرافات، الفحص الذاتي، العادات، الورشة، التعهّد، رسالة الفريق، الأسئلة الشائعة |
| `quiz.html` | اختبار «نسبة وعيك ووقايتك» ونتيجة «مؤشر الوعي والوقاية» |
| `qr.html` | ملصق A4 فيه رمز QR للطباعة |

### كيف أعدّل النصوص؟
كل ما يتغيّر كثيرًا موجود في **ثلاثة ملفات فقط**:

| الملف | ماذا فيه |
|---|---|
| `js/content.js` | اسم المبادرة، اسم الصف، رسالة الفريق، محاور الورشة، التعهّدات، الخرافات، الأسئلة الشائعة، الجهات، المصادر |
| `js/quiz-data.js` | أسئلة الاختبار، الإجابات، النقاط، النصائح، المستويات الأربعة، الجولة الإضافية |
| `js/config.js` | رابط الموقع بعد النشر، وتفعيل Google Sheets (اختياري) |

قواعد بسيطة:
- غيّروا النص بين علامتي الاقتباس `'...'` فقط، ولا تحذفوا الفواصل `,`.
- أي نص بين **[أقواس مربعة]** يظهر في الموقع بخلفية صفراء ليذكّركم أنه ينتظر معلومة. استبدلوه أو احذفوه.
- النصوص الطويلة في `index.html` (مثل خطوات الفحص الذاتي) عليها تعليقات ✏️ توضّح مكانها.

**في الاختبار:** كل إجابة لها `points` (2 أو 1 أو 0). الإجابات التي عليها `na: true` تعني «لا ينطبق» وتأخذ 2 ولا تُنقص النتيجة. لإخفاء الجولة الإضافية اجعلوا `bonus.enabled: false`.

### كيف أجرّب الموقع على جهازي؟
افتحوا Terminal داخل المجلد واكتبوا:
```
python3 -m http.server 8000
```
ثم افتحوا `http://localhost:8000` في المتصفح. (فتح `index.html` مباشرة يعمل أيضًا، لكن رمز QR لن يكون صحيحًا.)

### كيف أنشر الموقع؟
**الطريقة الأسهل: Netlify**
1. ادخلوا إلى [app.netlify.com/drop](https://app.netlify.com/drop).
2. اسحبوا المجلد كله وأفلتوه في الصفحة. سيعطيكم رابطًا فورًا.

**أو: GitHub Pages**
1. أنشئوا مستودعًا جديدًا على GitHub وارفعوا كل الملفات.
2. من **Settings ← Pages**: اختاروا `Deploy from a branch`، ثم الفرع `main` والمجلد `/ (root)`.
3. بعد دقيقة سيظهر الرابط، مثل `https://اسم-الحساب.github.io/اسم-المستودع/`.

**بعد النشر (مهم):** ضعوا الرابط في `js/config.js` ← `siteUrl`، ثم افتحوا `qr.html` واطبعوا الملصق، وجرّبوا مسح الرمز بالهاتف قبل الطباعة النهائية.

### اختياري: متوسط المدرسة عبر Google Sheets
مُطفأ افتراضيًا. عند تفعيله يظهر في صفحة النتيجة زر «أضيفي نتيجتي (بلا اسم)»، ولا يُرسل شيء إلا إذا ضغطته المستخدمة. يُرسَل فقط: النسبة، النقاط، المستوى، والدور (طالبة/معلّمة/…). لا أسماء ولا إجابات.
1. أنشئوا Google Sheet جديدًا، ثم **Extensions ← Apps Script**.
2. امسحوا الكود الموجود، والصقوا محتوى `google-apps-script/Code.gs`، واحفظوا.
3. **Deploy ← New deployment ← Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone**
4. انسخوا رابط الـ Web app (ينتهي بـ `/exec`).
5. في `js/config.js`: `sheets: { enabled: true, url: 'الرابط هنا' }`.
6. عند التفعيل يتغيّر نص الخصوصية في الاختبار تلقائيًا ليقول ذلك بوضوح.
7. في الورشة: افتحوا رابط `/exec` نفسه في المتصفح لتروا `{ count, average }`، أو اصنعوا رسمًا بيانيًا من الجدول.

### اختبار حساب النتيجة
إن كان Node.js مثبّتًا:
```
node --test tests/quiz-logic.test.js
```
يتحقق من النقاط (2/1/0)، وإجابات «لا ينطبق» في السؤالين ٦ و٧، وحدود المستويات الأربعة.

### الخصوصية
لا تتبّع، لا إحصاءات، لا كوكيز، ولا خطوط من خوادم خارجية (الخطوط محفوظة داخل المجلد). آخر نتيجة وآخر تعهّد يُحفظان في `localStorage` على جهاز المستخدمة فقط، ويمكن مسحهما بزر «امسحي بياناتي».

---

## English

### What is it?
A static, dependency-free site (plain HTML/CSS/JS), RTL Arabic, mobile-first:
`index.html` (info sections), `quiz.html` (the 10-question quiz + results), `qr.html` (printable A4 QR poster).

### Editing content
- `js/content.js`: initiative name, class name, team letter (`teamLetter`), workshop topics, pledges, myths, FAQ, UAE resources, sources.
- `js/quiz-data.js`: questions, answers, `points`, tips (plus age-specific `tipByAge`), levels, age/role notes, bonus round.
- `js/config.js`: `siteUrl` (used by QR codes) and the optional Google Sheets switch.
- Any text in `[square brackets]` is a placeholder and is highlighted yellow on the page.
- Quiz scoring: each option has `points`. Options with `na: true` are "not applicable": they score 2, never lower the result, and show no tip or strength. Score = sum / 20, shown as a percentage. Levels: 85–100, 60–84, 35–59, 0–34.

### Run locally
`python3 -m http.server 8000` in this folder, then open `http://localhost:8000`.

### Deploy
- **Netlify:** drag the folder onto <https://app.netlify.com/drop>.
- **GitHub Pages:** push to a repo → Settings → Pages → Deploy from branch `main`, folder `/ (root)`.
- Then set `siteUrl` in `js/config.js`, open `qr.html`, test-scan, and print.

### Optional: anonymous results to Google Sheets
Off by default. When enabled, the results page shows an explicit "add my result anonymously" button; nothing is sent unless the user taps it. Payload: `percent`, `score`, `level`, `role`. No names, no answers.
1. New Google Sheet → Extensions → Apps Script → paste `google-apps-script/Code.gs`.
2. Deploy → New deployment → Web app → Execute as **Me**, access **Anyone**.
3. Copy the `/exec` URL into `js/config.js` → `sheets: { enabled: true, url: '…' }`.
4. A GET on the same URL returns `{ count, average }` for showing the school average at the workshop.

### Tests
`node --test tests/quiz-logic.test.js` covers the 2/1/0 scoring, the N/A answers on Q6 and Q7, and the level boundaries.

### Content & accuracy
- All medical statements are general and conservative, and each one is sourced (see the footer). Sources checked October 2026: WHO breast cancer fact sheet; MOHAP *National Guideline for Breast Cancer Screening and Diagnosis* (3rd ed., 2023: mammogram every two years for average-risk women aged 40–69); ADPHC; FOCP Pink Caravan 2025 report; NCI; ACS; NBCF.
- UAE links were opened and confirmed to be official sites. FOCP and MOHAP numbers were verified on their official sites; the DHA (800342) and ADPHC/DoH (800555) numbers were provided by the team.
- **Have the school nurse or a health teacher review the content before the workshop.**

### Credits
Fonts: Readex Pro, IBM Plex Sans Arabic, Aref Ruqaa (SIL Open Font License), self-hosted from Google Fonts.
QR codes: [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) by Kazuhiko Arase (MIT), in `js/vendor/`.
School logo © Al Estiqlal Private School. Used as-is (background made transparent only; original kept at `assets/logo-original.png`).
