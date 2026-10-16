export type BookId = 1 | 2 | 3;

export interface BookInfo {
  id: BookId;
  title: string;
  englishTitle: string;
  subtitle: string;
  totalLessons: number;
  levelBadge: string;
  themeColor: 'emerald' | 'blue' | 'indigo';
}

export interface WordItem {
  id: string;
  word: string;
  phonetic: string;
  pos: string; // n., v., adj., adv., pron., prep., conj.
  meaning: string;
  example: string;
  exampleZh: string;
}

export interface DialogueLine {
  speaker: string;
  en: string;
  zh: string;
}

export interface Lesson {
  id: string; // e.g. "1-1", "2-1", "3-1"
  bookId: BookId;
  lessonNumber: number;
  titleEn: string;
  titleZh: string;
  unitGroup: string;
  category: string;
  grammarFocus: string;
  grammarNotes: string[];
  dialogue: DialogueLine[];
  vocabulary: WordItem[];
}

export const BOOKS_METADATA: BookInfo[] = [
  {
    id: 1,
    title: "第一册 · 英语初阶",
    englishTitle: "First Things First",
    subtitle: "共144课 · 零起点攻克日常口语、句型操练与基础语法",
    totalLessons: 144,
    levelBadge: "初阶入门 · 奠定基础",
    themeColor: "emerald"
  },
  {
    id: 2,
    title: "第二册 · 初级实践与进步",
    englishTitle: "Practice and Progress",
    subtitle: "共96课 · 96篇经典叙事短文，全面突破中考与高考核心句法",
    totalLessons: 96,
    levelBadge: "进阶提升 · 句型突破",
    themeColor: "blue"
  },
  {
    id: 3,
    title: "第三册 · 培养技能与精读",
    englishTitle: "Developing Skills",
    subtitle: "共60课 · 60篇思想深刻优美论述文，高级词汇与地道写作精髓",
    totalLessons: 60,
    levelBadge: "高阶精读 · 写作表达",
    themeColor: "indigo"
  }
];
