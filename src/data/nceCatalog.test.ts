import test from 'node:test';
import assert from 'node:assert/strict';
import { getBookLessons, getLessonById, getAllVocabularyForBook, getAllVocabulary } from './nceCatalog.ts';

test('New Concept English complete curriculum verification', (t) => {
  const b1 = getBookLessons(1);
  const b2 = getBookLessons(2);
  const b3 = getBookLessons(3);

  // 1. Verify lesson counts
  assert.equal(b1.length, 144, 'Book 1 must contain 144 lessons');
  assert.equal(b2.length, 96, 'Book 2 must contain 96 lessons');
  assert.equal(b3.length, 60, 'Book 3 must contain 60 lessons');

  // Total 300 lessons
  const total = b1.length + b2.length + b3.length;
  assert.equal(total, 300, 'Total curriculum across Books 1, 2, and 3 must be 300 lessons');

  // 2. Verify lesson bounds & integrity
  assert.equal(b1[0].lessonNumber, 1);
  assert.equal(b1[143].lessonNumber, 144);
  assert.equal(b2[0].lessonNumber, 1);
  assert.equal(b2[95].lessonNumber, 96);
  assert.equal(b3[0].lessonNumber, 1);
  assert.equal(b3[59].lessonNumber, 60);

  // 3. Verify retrieval by ID
  const l1_144 = getLessonById('1-144');
  assert.ok(l1_144, 'Lesson 1-144 must exist');
  assert.equal(l1_144.lessonNumber, 144);

  const l2_96 = getLessonById('2-96');
  assert.ok(l2_96, 'Lesson 2-96 must exist');
  assert.equal(l2_96.lessonNumber, 96);

  const l3_60 = getLessonById('3-60');
  assert.ok(l3_60, 'Lesson 3-60 must exist');
  assert.equal(l3_60.lessonNumber, 60);

  // 4. Verify all lessons have dialogues and vocabulary
  [...b1, ...b2, ...b3].forEach(lesson => {
    assert.ok(lesson.titleEn.length > 0, `Lesson ${lesson.id} must have titleEn`);
    assert.ok(lesson.titleZh.length > 0, `Lesson ${lesson.id} must have titleZh`);
    assert.ok(lesson.dialogue.length > 0, `Lesson ${lesson.id} must have dialogue`);
    assert.ok(lesson.vocabulary.length > 0, `Lesson ${lesson.id} must have vocabulary`);
  });

  // 5. Verify vocabulary aggregation
  const allVocab = getAllVocabulary();
  assert.ok(allVocab.length > 1000, 'All vocabulary should contain > 1000 items');
});
