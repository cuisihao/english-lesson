import { BookId } from '../data/types';

export interface TypingRecord {
  id: string;
  date: string;
  title: string;
  wpm: number;
  accuracy: number;
  timeSpent: number;
}

export interface UserStudyData {
  checkInDates: string[]; // 'YYYY-MM-DD'
  selectedBookId: BookId; // 1, 2, 3
  completedLessonIds: string[]; // e.g. "1-1", "2-1", "3-10"
  wordMastery: Record<string, 'mastered' | 'fuzzy' | 'forgot'>;
  notebookWordIds: string[]; // starred words for focused review
  typingRecords: TypingRecord[];
  dailyGoals: {
    targetLessons: number;
    targetWords: number;
    targetTyping: number;
  };
  totalMinutesStudied: number;
}

const STORAGE_KEY = 'nce_multibook_study_profile_v2';

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDefaultStudyData(): UserStudyData {
  const today = getTodayDateString();
  return {
    checkInDates: [today],
    selectedBookId: 1,
    completedLessonIds: ["1-1"],
    wordMastery: {
      "1-1-1": "mastered",
      "1-1-2": "mastered",
      "1-1-3": "fuzzy"
    },
    notebookWordIds: ["1-1-3"],
    typingRecords: [
      {
        id: "init-1",
        date: today,
        title: "第一册第1课 · 课文句子打字",
        wpm: 32,
        accuracy: 98,
        timeSpent: 40
      }
    ],
    dailyGoals: {
      targetLessons: 1,
      targetWords: 5,
      targetTyping: 1
    },
    totalMinutesStudied: 30
  };
}

export function loadUserStudyData(): UserStudyData {
  if (typeof window === 'undefined') return getDefaultStudyData();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const def = getDefaultStudyData();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(def));
      return def;
    }
    const parsed = JSON.parse(raw);
    return {
      ...getDefaultStudyData(),
      ...parsed
    };
  } catch (err) {
    console.error('Failed to load study data:', err);
    return getDefaultStudyData();
  }
}

export function saveUserStudyData(data: UserStudyData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event('study_data_updated'));
  } catch (err) {
    console.error('Failed to save study data:', err);
  }
}

/**
 * Checks in for today
 */
export function checkInToday(): { success: boolean; isNewCheckIn: boolean } {
  const data = loadUserStudyData();
  const today = getTodayDateString();
  if (data.checkInDates.includes(today)) {
    return { success: true, isNewCheckIn: false };
  }
  data.checkInDates.push(today);
  data.totalMinutesStudied += 15;
  saveUserStudyData(data);
  return { success: true, isNewCheckIn: true };
}

/**
 * Records a typing session
 */
export function recordTypingResult(record: Omit<TypingRecord, 'id' | 'date'>): void {
  const data = loadUserStudyData();
  const today = getTodayDateString();
  const newRecord: TypingRecord = {
    ...record,
    id: `type-${Date.now()}`,
    date: today
  };
  data.typingRecords.unshift(newRecord);
  // Auto check in if not checked in today
  if (!data.checkInDates.includes(today)) {
    data.checkInDates.push(today);
  }
  data.totalMinutesStudied += Math.ceil(record.timeSpent / 60);
  saveUserStudyData(data);
}

/**
 * Toggles a word in the notebook
 */
export function toggleNotebookWord(wordId: string): boolean {
  const data = loadUserStudyData();
  const exists = data.notebookWordIds.includes(wordId);
  if (exists) {
    data.notebookWordIds = data.notebookWordIds.filter(id => id !== wordId);
  } else {
    data.notebookWordIds.push(wordId);
  }
  saveUserStudyData(data);
  return !exists;
}

/**
 * Sets word mastery status ('mastered' | 'fuzzy' | 'forgot')
 */
export function setWordMastery(wordId: string, status: 'mastered' | 'fuzzy' | 'forgot'): void {
  const data = loadUserStudyData();
  data.wordMastery[wordId] = status;
  if (status === 'forgot' || status === 'fuzzy') {
    if (!data.notebookWordIds.includes(wordId)) {
      data.notebookWordIds.push(wordId);
    }
  }
  saveUserStudyData(data);
}

/**
 * Sets selected book (1, 2, 3)
 */
export function setSelectedBook(bookId: BookId): void {
  const data = loadUserStudyData();
  data.selectedBookId = bookId;
  saveUserStudyData(data);
}

/**
 * Marks lesson as completed / recited
 */
export function toggleLessonCompleted(lessonId: string): boolean {
  const data = loadUserStudyData();
  const index = data.completedLessonIds.indexOf(lessonId);
  let isNowCompleted = false;
  if (index >= 0) {
    data.completedLessonIds.splice(index, 1);
  } else {
    data.completedLessonIds.push(lessonId);
    isNowCompleted = true;
    const today = getTodayDateString();
    if (!data.checkInDates.includes(today)) {
      data.checkInDates.push(today);
    }
  }
  saveUserStudyData(data);
  return isNowCompleted;
}
