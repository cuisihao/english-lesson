import { BookId, Lesson, WordItem, BOOKS_METADATA } from './types.ts';
import { BOOK1_LESSONS } from './nceBook1Data.ts';
import { BOOK2_LESSONS } from './nceBook2Data.ts';
import { BOOK3_LESSONS } from './nceBook3Data.ts';

export { BOOKS_METADATA } from './types.ts';
export type { BookId, Lesson, WordItem, DialogueLine, BookInfo } from './types.ts';

// Fast lookup maps
const BOOK1_MAP = new Map<string, Lesson>();
const BOOK2_MAP = new Map<string, Lesson>();
const BOOK3_MAP = new Map<string, Lesson>();
const ALL_MAP = new Map<string, Lesson>();

BOOK1_LESSONS.forEach(l => {
  BOOK1_MAP.set(l.id, l);
  ALL_MAP.set(l.id, l);
});

BOOK2_LESSONS.forEach(l => {
  BOOK2_MAP.set(l.id, l);
  ALL_MAP.set(l.id, l);
});

BOOK3_LESSONS.forEach(l => {
  BOOK3_MAP.set(l.id, l);
  ALL_MAP.set(l.id, l);
});

/**
 * Returns all lessons for the given book (1: 144 lessons, 2: 96 lessons, 3: 60 lessons)
 */
export function getBookLessons(bookId: BookId): Lesson[] {
  if (bookId === 1) return BOOK1_LESSONS;
  if (bookId === 2) return BOOK2_LESSONS;
  return BOOK3_LESSONS;
}

/**
 * Retrieves a lesson by its id (e.g. "1-1", "1-144", "2-96", "3-60")
 */
export function getLessonById(id: string): Lesson {
  if (ALL_MAP.has(id)) {
    return ALL_MAP.get(id)!;
  }
  const [bIdStr, numStr] = id.split('-');
  const bId = (Number(bIdStr) || 1) as BookId;
  const num = Number(numStr) || 1;
  const list = getBookLessons(bId);
  return list.find(l => l.lessonNumber === num) || list[0];
}

/**
 * Returns all vocabulary items in a specific book
 */
export function getAllVocabularyForBook(bookId: BookId): WordItem[] {
  const lessons = getBookLessons(bookId);
  return lessons.flatMap(l => l.vocabulary);
}

/**
 * Returns all vocabulary across all three books
 */
export function getAllVocabulary(): WordItem[] {
  return [
    ...BOOK1_LESSONS.flatMap(l => l.vocabulary),
    ...BOOK2_LESSONS.flatMap(l => l.vocabulary),
    ...BOOK3_LESSONS.flatMap(l => l.vocabulary)
  ];
}

/**
 * Searches across lessons in a book or across all three books
 */
export function searchAllLessons(keyword: string, bookId?: BookId): Lesson[] {
  const term = keyword.trim().toLowerCase();
  if (!term) return [];

  const targets = bookId ? getBookLessons(bookId) : [...BOOK1_LESSONS, ...BOOK2_LESSONS, ...BOOK3_LESSONS];

  return targets.filter(l => {
    return (
      String(l.lessonNumber) === term ||
      l.titleEn.toLowerCase().includes(term) ||
      l.titleZh.includes(term) ||
      l.grammarFocus.toLowerCase().includes(term) ||
      l.vocabulary.some(v => v.word.toLowerCase().includes(term) || v.meaning.includes(term))
    );
  });
}
