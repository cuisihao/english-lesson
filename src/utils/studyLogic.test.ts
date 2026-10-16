import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateTypingMetrics,
  calculateStreak,
  maskSentenceForRecitation,
  evaluateSpellingAnswer,
  getTypingGrade,
  stripPunctuationForTyping,
  isLineTypingCompleted
} from './studyLogic.ts';

test('stripPunctuationForTyping cleans all punctuation for typing practice', () => {
  assert.equal(stripPunctuationForTyping("Excuse me!"), "Excuse me");
  assert.equal(stripPunctuationForTyping("Is this your handbag?"), "Is this your handbag");
  assert.equal(stripPunctuationForTyping("Yes, it is."), "Yes it is");
  assert.equal(stripPunctuationForTyping("No, it isn't."), "No it isnt");
  assert.equal(stripPunctuationForTyping("What's your job?"), "Whats your job");
});

test('isLineTypingCompleted validates line without requiring punctuation', () => {
  assert.equal(isLineTypingCompleted("Excuse me", "Excuse me!"), true);
  assert.equal(isLineTypingCompleted("excuse me", "Excuse me!"), true);
  assert.equal(isLineTypingCompleted("Yes it is", "Yes, it is."), true);
  assert.equal(isLineTypingCompleted("Yes it", "Yes, it is."), false);
});

test('calculateTypingMetrics calculates accurate WPM and ignores punctuation', () => {
  // Target has "Excuse me!", user types "Excuse me" (no exclamation) -> 100% accuracy, 9 characters
  const target = "Excuse me!";
  const typed = "Excuse me";
  const metrics = calculateTypingMetrics(target, typed, 30);
  assert.equal(metrics.accuracy, 100);
  assert.equal(metrics.errorCount, 0);
  assert.equal(metrics.correctChars, 9);
});

test('calculateTypingMetrics handles errors and partial text correctly', () => {
  const target = "Excuse me!";
  const typed = "Excuze me!";
  // 'z' is wrong, 8 correct out of 9 typed chars (exclamation mark stripped) -> 89%
  const metrics = calculateTypingMetrics(target, typed, 10);
  assert.equal(metrics.accuracy, 89);
  assert.equal(metrics.errorCount, 1);
  assert.equal(metrics.correctChars, 8);
});

test('calculateStreak calculates continuous streak and broken streak properly', () => {
  // Test 1: Checked in today and yesterday and day before
  const today = '2026-10-15';
  const dates = ['2026-10-15', '2026-10-14', '2026-10-13'];
  const res1 = calculateStreak(dates, today);
  assert.equal(res1.currentStreak, 3);
  assert.equal(res1.totalDays, 3);
  assert.equal(res1.isCheckedInToday, true);

  // Test 2: Checked in yesterday, but not yet today (streak is still intact at 2)
  const dates2 = ['2026-10-14', '2026-10-13'];
  const res2 = calculateStreak(dates2, today);
  assert.equal(res2.currentStreak, 2);
  assert.equal(res2.isCheckedInToday, false);

  // Test 3: Missed yesterday (last checkin was 2026-10-12)
  const dates3 = ['2026-10-12', '2026-10-11'];
  const res3 = calculateStreak(dates3, today);
  assert.equal(res3.currentStreak, 0); // Broken streak
  assert.equal(res3.totalDays, 2);
});

test('maskSentenceForRecitation hides words based on level', () => {
  const sentence = "Excuse me! Is this your handbag?";
  const hardResult = maskSentenceForRecitation(sentence, 'hard');
  // All words masked
  assert.match(hardResult.maskedSentence, /^_+ _+! _+ _+ _+ _+\?$/);
  assert.equal(hardResult.blanksCount, 6);

  const easyResult = maskSentenceForRecitation(sentence, 'easy');
  assert.ok(easyResult.blanksCount > 0);
  assert.ok(easyResult.maskedSentence.includes('_'));
  assert.ok(easyResult.maskedSentence.includes('!'));
});

test('evaluateSpellingAnswer correctly ignores punctuation and case', () => {
  assert.equal(evaluateSpellingAnswer("Handbag", "handbag"), true);
  assert.equal(evaluateSpellingAnswer(" umbrella! ", "umbrella"), true);
  assert.equal(evaluateSpellingAnswer("excused", "excuse"), false);
});

test('getTypingGrade assigns expected ranks', () => {
  assert.equal(getTypingGrade(50, 98).grade, 'S');
  assert.equal(getTypingGrade(35, 92).grade, 'A');
  assert.equal(getTypingGrade(20, 85).grade, 'B');
  assert.equal(getTypingGrade(10, 70).grade, 'C');
});
