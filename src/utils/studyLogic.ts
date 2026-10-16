/**
 * Pure business logic for New Concept English study app.
 * Fully decoupled for node:test verification.
 */

export interface TypingMetrics {
  wpm: number;
  cpm: number;
  accuracy: number;
  totalChars: number;
  correctChars: number;
  errorCount: number;
  timeSpentSeconds: number;
}

/**
 * Strips punctuation marks for typing practice so users do not need to type punctuation.
 * E.g. "Excuse me!" -> "Excuse me", "Yes, it is." -> "Yes it is", "What's" -> "Whats".
 */
export function stripPunctuationForTyping(text: string): string {
  if (!text) return '';
  return text
    .replace(/[.,?!;:—–~'"“”‘’`\/\\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isCharPunctuation(char: string): boolean {
  return /[.,?!;:—–~'"“”‘’`\/\\]/.test(char);
}

/**
 * Checks whether user has completed typing the required letters and spaces.
 */
export function isLineTypingCompleted(userInput: string, targetText: string): boolean {
  const cleanInput = stripPunctuationForTyping(userInput).toLowerCase();
  const cleanTarget = stripPunctuationForTyping(targetText).toLowerCase();
  return cleanInput.length > 0 && cleanInput === cleanTarget;
}

/**
 * Calculates typing statistics (WPM, CPM, Accuracy %, Errors) without penalizing for punctuation.
 * Standard WPM is (correct characters / 5) / (minutes elapsed).
 */
export function calculateTypingMetrics(
  targetText: string,
  typedText: string,
  elapsedSeconds: number
): TypingMetrics {
  const cleanTarget = stripPunctuationForTyping(targetText);
  const cleanTyped = stripPunctuationForTyping(typedText);

  const time = Math.max(elapsedSeconds, 1);
  const minutes = time / 60;
  
  let correctChars = 0;
  let errorCount = 0;
  
  const minLength = Math.min(cleanTarget.length, cleanTyped.length);
  for (let i = 0; i < minLength; i++) {
    // Compare character by character (case-insensitive for tolerance or matching)
    if (cleanTarget[i].toLowerCase() === cleanTyped[i].toLowerCase()) {
      correctChars++;
    } else {
      errorCount++;
    }
  }
  
  // Characters typed in excess are considered errors
  if (cleanTyped.length > cleanTarget.length) {
    errorCount += (cleanTyped.length - cleanTarget.length);
  }
  
  const totalTyped = cleanTyped.length;
  const accuracy = totalTyped === 0 
    ? 100 
    : Math.max(0, Math.min(100, Math.round((correctChars / totalTyped) * 100)));
    
  const cpm = Math.round((correctChars / minutes));
  const wpm = Math.round((correctChars / 5) / minutes);

  return {
    wpm,
    cpm,
    accuracy,
    totalChars: totalTyped,
    correctChars,
    errorCount,
    timeSpentSeconds: Math.round(time)
  };
}

/**
 * Calculates consecutive check-in streak and total check-in count.
 * checkInDates is an array of 'YYYY-MM-DD' date strings.
 * referenceDateStr is the reference 'today' (defaults to current local date).
 */
export function calculateStreak(
  checkInDates: string[],
  referenceDateStr?: string
): { currentStreak: number; totalDays: number; isCheckedInToday: boolean } {
  if (!checkInDates || checkInDates.length === 0) {
    return { currentStreak: 0, totalDays: 0, isCheckedInToday: false };
  }

  const uniqueSortedDates = Array.from(new Set(checkInDates)).sort().reverse();
  const totalDays = uniqueSortedDates.length;

  const todayStr = referenceDateStr || new Date().toISOString().split('T')[0];
  const isCheckedInToday = uniqueSortedDates.includes(todayStr);

  // Helper to parse YYYY-MM-DD to timestamp
  const parseDateToDays = (dStr: string) => {
    const [y, m, d] = dStr.split('-').map(Number);
    return Math.floor(Date.UTC(y, m - 1, d) / (1000 * 60 * 60 * 24));
  };

  const todayDays = parseDateToDays(todayStr);
  const latestDays = parseDateToDays(uniqueSortedDates[0]);

  // If latest checkin is older than yesterday, current streak is broken
  if (todayDays - latestDays > 1) {
    return { currentStreak: 0, totalDays, isCheckedInToday };
  }

  let streak = 0;
  let expectedDay = isCheckedInToday ? todayDays : todayDays - 1;

  for (const dStr of uniqueSortedDates) {
    const currentDay = parseDateToDays(dStr);
    if (currentDay === expectedDay) {
      streak++;
      expectedDay--;
    } else if (currentDay < expectedDay) {
      break;
    }
  }

  return { currentStreak: streak, totalDays, isCheckedInToday };
}

/**
 * Generates cloze / recitation masked sentences.
 * Level 'easy': hides ~30% of content words (length >= 4)
 * Level 'medium': hides ~60% of words
 * Level 'hard': hides all English words except punctuation
 */
export function maskSentenceForRecitation(
  sentence: string,
  level: 'easy' | 'medium' | 'hard'
): { maskedSentence: string; blanksCount: number } {
  if (!sentence) return { maskedSentence: '', blanksCount: 0 };
  
  const tokens = sentence.split(/(\s+|[.,!?;:'"]+)/);
  let blanksCount = 0;

  const result = tokens.map((token, index) => {
    // Only mask alphabetic words
    if (!/^[a-zA-Z]+$/.test(token)) {
      return token;
    }

    let shouldMask = false;
    if (level === 'hard') {
      shouldMask = true;
    } else if (level === 'medium') {
      shouldMask = index % 2 === 0;
    } else {
      // easy: mask longer content words (length >= 4) or every 3rd word
      shouldMask = token.length >= 4 && (index % 3 === 0);
    }

    if (shouldMask) {
      blanksCount++;
      return '_'.repeat(Math.max(token.length, 3));
    }
    return token;
  });

  return {
    maskedSentence: result.join(''),
    blanksCount
  };
}

/**
 * Normalizes text for comparing spelling answers.
 * Trims, removes special punctuation, lowercases.
 */
export function evaluateSpellingAnswer(userInput: string, targetWord: string): boolean {
  const cleanInput = userInput.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanTarget = targetWord.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleanInput === cleanTarget;
}

/**
 * Calculates user's grade level based on WPM and Accuracy
 */
export function getTypingGrade(wpm: number, accuracy: number): { grade: 'S' | 'A' | 'B' | 'C'; title: string } {
  if (accuracy >= 95 && wpm >= 45) return { grade: 'S', title: '神速流利 (Master)' };
  if (accuracy >= 90 && wpm >= 30) return { grade: 'A', title: '熟练自如 (Proficient)' };
  if (accuracy >= 80 && wpm >= 15) return { grade: 'B', title: '稳步提升 (Developing)' };
  return { grade: 'C', title: '初学入门 (Beginner)' };
}
