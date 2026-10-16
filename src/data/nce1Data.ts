/**
 * Backward compatibility bridge for NCE data
 */
import { BOOK1_LESSONS } from './nceBook1Data.ts';
import { getAllVocabulary, getBookLessons } from './nceCatalog.ts';

export * from './types.ts';
export * from './nceCatalog.ts';

export const NCE1_LESSONS = BOOK1_LESSONS;

export const ALL_VOCABULARY = BOOK1_LESSONS.flatMap(lesson => 
  lesson.vocabulary.map(v => ({
    ...v,
    lessonNumber: lesson.lessonNumber,
    lessonTitle: lesson.titleEn
  }))
);
