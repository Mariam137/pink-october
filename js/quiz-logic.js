/* =====================================================================
   حساب نتيجة الاختبار  ·  Quiz scoring (no DOM, so it can be tested)
   You normally don't need to edit this file — change quiz-data.js instead.
   ===================================================================== */
var QuizLogic = (function () {
  'use strict';

  function maxPoints(question) {
    return Math.max.apply(null, question.options.map(function (o) { return o.points; }));
  }

  function levelFor(percent, levels) {
    var sorted = levels.slice().sort(function (a, b) { return b.min - a.min; });
    for (var i = 0; i < sorted.length; i++) {
      if (percent >= sorted[i].min) return sorted[i];
    }
    return sorted[sorted.length - 1];
  }

  /**
   * answers: { q1: 0, q2: 2, ... }  (index of the chosen option)
   * profile: { role: 'student' | ..., age: 'under20' | ... } — optional, never affects the score
   */
  function computeResult(data, answers, profile) {
    profile = profile || {};
    var score = 0;
    var total = 0;
    var strengths = [];
    var tips = [];

    data.questions.forEach(function (q) {
      var max = maxPoints(q);
      var option = q.options[answers[q.id]];
      if (!option) throw new Error('Missing answer for ' + q.id);
      total += max;
      score += option.points;

      if (option.na) return; // «لا ينطبق»: full points, no tip, no strength
      if (option.points >= max) {
        strengths.push({ id: q.id, topic: q.topic, text: q.strength });
      } else {
        var tip = (q.tipByAge && profile.age && q.tipByAge[profile.age]) || q.tip;
        tips.push({ id: q.id, topic: q.topic, text: tip, link: q.link, points: option.points });
      }
    });

    var percent = total ? Math.round((score / total) * 100) : 0;
    // Show the biggest gaps first (0-point answers before 1-point answers).
    tips.sort(function (a, b) { return a.points - b.points; });

    return {
      score: score,
      total: total,
      percent: percent,
      level: levelFor(percent, data.levels),
      strengths: strengths,
      tips: tips,
      ageNote: data.ageNotes[profile.age] || data.ageNotes.unknown,
      roleNote: (profile.role && data.roleNotes[profile.role]) || ''
    };
  }

  return { computeResult: computeResult, levelFor: levelFor, maxPoints: maxPoints };
})();

if (typeof module !== 'undefined') module.exports = QuizLogic;
