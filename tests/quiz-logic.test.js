// Run with:  node --test tests/
const test = require('node:test');
const assert = require('node:assert/strict');
const data = require('../js/quiz-data.js');
const { computeResult, levelFor } = require('../js/quiz-logic.js');

const ids = data.questions.map((q) => q.id);
const all = (index) => Object.fromEntries(ids.map((id) => [id, index]));

test('there are exactly 10 questions with 3 options each, out of 20 points', () => {
  assert.equal(data.questions.length, 10);
  data.questions.forEach((q) => assert.equal(q.options.length, 3, q.id));
  assert.equal(computeResult(data, all(0)).total, 20);
});

test('standard questions score 2 / 1 / 0 in order', () => {
  data.questions
    .filter((q) => !['q6', 'q7'].includes(q.id))
    .forEach((q) => assert.deepEqual(q.options.map((o) => o.points), [2, 1, 0], q.id));
});

test('Q6 and Q7 middle answers are "not applicable" worth 2 points', () => {
  ['q6', 'q7'].forEach((id) => {
    const q = data.questions.find((x) => x.id === id);
    assert.deepEqual(q.options.map((o) => o.points), [2, 2, 0], id);
    assert.equal(q.options[1].na, true, id);
  });
});

test('all first answers → 100% and top level, no tips', () => {
  const r = computeResult(data, all(0));
  assert.equal(r.score, 20);
  assert.equal(r.percent, 100);
  assert.equal(r.level.id, 'aware');
  assert.equal(r.tips.length, 0);
  assert.equal(r.strengths.length, 10);
});

test('all last answers → 0%', () => {
  const r = computeResult(data, all(2));
  assert.equal(r.score, 0);
  assert.equal(r.percent, 0);
  assert.equal(r.level.id, 'learn-together');
  assert.equal(r.tips.length, 10);
});

test('N/A answers never lower the score and give neither a tip nor a strength', () => {
  const answers = { ...all(0), q6: 1, q7: 1 };
  const r = computeResult(data, answers);
  assert.equal(r.score, 20);
  assert.equal(r.percent, 100);
  assert.equal(r.tips.length, 0);
  assert.equal(r.strengths.length, 8);
  assert.ok(!r.strengths.some((s) => s.id === 'q6' || s.id === 'q7'));
});

test('N/A answers count as 2 even when everything else is 0', () => {
  const r = computeResult(data, { ...all(2), q6: 1, q7: 1 });
  assert.equal(r.score, 4);
  assert.equal(r.percent, 20);
  assert.equal(r.tips.length, 8);
});

test('all middle answers → 8×1 + 2×2(N/A) = 12/20 = 60%', () => {
  const r = computeResult(data, all(1));
  assert.equal(r.score, 12);
  assert.equal(r.percent, 60);
  assert.equal(r.level.id, 'on-track');
});

test('level boundaries: 85 / 84 / 60 / 59 / 35 / 34 / 0', () => {
  const L = (p) => levelFor(p, data.levels).id;
  assert.equal(L(100), 'aware');
  assert.equal(L(85), 'aware');
  assert.equal(L(84), 'on-track');
  assert.equal(L(60), 'on-track');
  assert.equal(L(59), 'good-start');
  assert.equal(L(35), 'good-start');
  assert.equal(L(34), 'learn-together');
  assert.equal(L(0), 'learn-together');
});

test('real score steps land on the right level (17/20 = 85%, 7/20 = 35%)', () => {
  // 17 points: three 1-point answers
  let r = computeResult(data, { ...all(0), q1: 1, q2: 1, q3: 1 });
  assert.equal(r.percent, 85);
  assert.equal(r.level.id, 'aware');
  // 16 points → 80%
  r = computeResult(data, { ...all(0), q1: 1, q2: 1, q3: 1, q4: 1 });
  assert.equal(r.percent, 80);
  assert.equal(r.level.id, 'on-track');
  // 7 points → 35%: N/A on q6,q7 (4) + three 1-point answers
  r = computeResult(data, { ...all(2), q6: 1, q7: 1, q1: 1, q2: 1, q3: 1 });
  assert.equal(r.percent, 35);
  assert.equal(r.level.id, 'good-start');
  // 6 points → 30%
  r = computeResult(data, { ...all(2), q6: 1, q7: 1, q1: 1, q2: 1 });
  assert.equal(r.percent, 30);
  assert.equal(r.level.id, 'learn-together');
});

test('tips put 0-point answers before 1-point answers', () => {
  const r = computeResult(data, { ...all(0), q1: 1, q4: 2 });
  assert.deepEqual(r.tips.map((t) => t.id), ['q4', 'q1']);
});

test('age-aware tip for Q3 and age/role notes; profile never changes the score', () => {
  const answers = { ...all(0), q3: 2 };
  const plain = computeResult(data, answers);
  const teen = computeResult(data, answers, { age: 'under20', role: 'student' });
  assert.equal(plain.score, teen.score);
  assert.equal(teen.tips[0].text, data.questions[2].tipByAge.under20);
  assert.equal(teen.ageNote, data.ageNotes.under20);
  assert.equal(teen.roleNote, data.roleNotes.student);
  assert.equal(plain.ageNote, data.ageNotes.unknown);
  assert.equal(plain.roleNote, '');
});

test('the Q3 tip mentions the Pink Caravan for every age group', () => {
  const q3 = data.questions.find((q) => q.id === 'q3');
  [q3.tip, ...Object.values(q3.tipByAge)].forEach((t) => assert.match(t, /قافلة الوردية/));
});

test('missing answers throw instead of silently scoring', () => {
  assert.throws(() => computeResult(data, { q1: 0 }));
});

test('bonus round has one correct answer per question', () => {
  assert.equal(data.bonus.questions.length, 3);
  data.bonus.questions.forEach((q) => assert.equal(q.options.filter((o) => o.correct).length, 1));
});
