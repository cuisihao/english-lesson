import React, { useState, useEffect, useRef } from 'react';
import { Lesson } from '../data/types';
import { 
  calculateTypingMetrics, 
  getTypingGrade, 
  TypingMetrics, 
  stripPunctuationForTyping, 
  isCharPunctuation, 
  isLineTypingCompleted 
} from '../utils/studyLogic';
import { soundManager, speakEnglish } from '../utils/audio';
import { 
  Keyboard, RotateCcw, Volume2, Trophy, ArrowRight, 
  Sparkles, CheckCircle2, CornerDownLeft 
} from 'lucide-react';

import { BookId, BOOKS_METADATA } from '../data/types.ts';

interface TypingPracticeProps {
  currentLesson: Lesson;
  onSelectLesson: (lesson: Lesson) => void;
  allLessons: Lesson[];
  onFinishTyping: (record: { title: string; wpm: number; accuracy: number; timeSpent: number }) => void;
  currentBookId?: BookId;
  onChangeBook?: (bookId: BookId) => void;
}

export const TypingPractice: React.FC<TypingPracticeProps> = ({
  currentLesson,
  onSelectLesson,
  allLessons,
  onFinishTyping,
  currentBookId,
  onChangeBook
}) => {
  const [practiceMode, setPracticeMode] = useState<'sentences' | 'vocab'>('sentences');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userInput, setUserInput] = useState<string>('');
  const [isLineFinished, setIsLineFinished] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  
  // Accumulated statistics across lines
  const [historyMetrics, setHistoryMetrics] = useState<TypingMetrics[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  // Targets list based on mode
  const sentenceTargets = currentLesson.dialogue.map(d => ({
    text: d.en,
    zh: d.zh,
    speaker: d.speaker
  }));

  const vocabTargets = currentLesson.vocabulary.map(v => ({
    text: v.word,
    zh: `${v.meaning} (${v.phonetic})`,
    speaker: v.pos
  }));

  const targets = practiceMode === 'sentences' ? sentenceTargets : vocabTargets;
  const currentTarget = targets[currentIndex] || targets[0];
  const cleanTarget = stripPunctuationForTyping(currentTarget?.text || '');

  // Focus input automatically
  useEffect(() => {
    inputRef.current?.focus();
  }, [currentIndex, practiceMode, currentLesson.id]);

  // Reset practice on lesson or mode switch
  const handleReset = () => {
    setCurrentIndex(0);
    setUserInput('');
    setIsLineFinished(false);
    setIsCompleted(false);
    setStartTime(null);
    setElapsedSeconds(0);
    setHistoryMetrics([]);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  useEffect(() => {
    handleReset();
  }, [currentLesson.id, practiceMode]);

  // Timer loop
  useEffect(() => {
    if (!startTime || isCompleted) return;
    const timer = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime, isCompleted]);

  // Current line live metrics without penalizing punctuation
  const liveMetrics = calculateTypingMetrics(
    currentTarget?.text || '',
    userInput,
    Math.max(elapsedSeconds, 1)
  );

  // Advance to next line when Enter is pressed
  const handleAdvanceNext = () => {
    if (!isLineFinished) return;

    // Save line metrics
    const lineMetric = calculateTypingMetrics(currentTarget.text, userInput, Math.max(elapsedSeconds, 1));
    setHistoryMetrics(prev => [...prev, lineMetric]);

    if (currentIndex < targets.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setUserInput('');
      setIsLineFinished(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setIsCompleted(true);
    }
  };

  // Handle keystrokes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLineFinished) return;

    const val = e.target.value;
    
    // Start timer on first keystroke
    if (startTime === null) {
      setStartTime(Date.now());
    }

    const prevLength = userInput.length;
    const isBackspace = val.length < prevLength;

    if (!isBackspace && val.length > 0) {
      const charIndex = val.length - 1;
      const cleanTyped = stripPunctuationForTyping(val);
      const lastTypedChar = cleanTyped[cleanTyped.length - 1];
      const expectedChar = cleanTarget[cleanTyped.length - 1];

      if (lastTypedChar && expectedChar && lastTypedChar.toLowerCase() === expectedChar.toLowerCase()) {
        soundManager.playKeyClick();
      } else {
        soundManager.playErrorBump();
      }
    }

    setUserInput(val);

    // Check if line is finished (ignoring punctuation)
    if (isLineTypingCompleted(val, currentTarget.text)) {
      setIsLineFinished(true);
      soundManager.playSuccessChime();
      speakEnglish(currentTarget.text, { lang: 'en-GB' });
    }
  };

  // Keyboard navigation for Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (isLineFinished) {
        handleAdvanceNext();
      }
    }
  };

  // Aggregate final metrics
  const totalCorrect = historyMetrics.reduce((sum, m) => sum + m.correctChars, 0) + liveMetrics.correctChars;
  const totalTyped = historyMetrics.reduce((sum, m) => sum + m.totalChars, 0) + liveMetrics.totalChars;
  const finalAccuracy = totalTyped > 0 ? Math.round((totalCorrect / totalTyped) * 100) : 100;
  const totalSeconds = Math.max(elapsedSeconds, 1);
  const finalWpm = Math.round((totalCorrect / 5) / (totalSeconds / 60));
  const grade = getTypingGrade(finalWpm, finalAccuracy);

  const handleSaveResult = () => {
    onFinishTyping({
      title: `第${currentLesson.lessonNumber}课 · ${practiceMode === 'sentences' ? '课文句子打字' : '重点生词打字'}`,
      wpm: finalWpm,
      accuracy: finalAccuracy,
      timeSpent: totalSeconds
    });
  };

  // Render character by character: skips punctuation from user requirement
  const renderTypingText = () => {
    const originalText = currentTarget?.text || '';
    const cleanTyped = stripPunctuationForTyping(userInput);
    let typedIdx = 0;

    return (
      <div className="text-xl sm:text-2xl font-mono leading-relaxed tracking-wide select-none break-words">
        {originalText.split('').map((char, index) => {
          if (isCharPunctuation(char)) {
            // Punctuation is decorative/contextual only - user does not type it
            const isPunctuationPassed = typedIdx <= cleanTyped.length || isLineFinished;
            return (
              <span
                key={index}
                className={`font-sans transition-colors duration-75 ${
                  isPunctuationPassed ? 'text-emerald-700/80 font-bold' : 'text-slate-400'
                }`}
                title="标点无需输入"
              >
                {char}
              </span>
            );
          }

          // Non-punctuation characters (letters, digits, spaces)
          let charStyle = 'text-slate-400';
          const isCurrentChar = typedIdx === cleanTyped.length && !isLineFinished;

          if (typedIdx < cleanTyped.length) {
            const userChar = cleanTyped[typedIdx];
            if (userChar.toLowerCase() === char.toLowerCase()) {
              charStyle = 'text-emerald-700 bg-emerald-100/70 font-semibold rounded-xs';
            } else {
              charStyle = 'text-rose-700 bg-rose-200 underline font-semibold rounded-xs';
            }
          }

          const renderedNode = (
            <span
              key={index}
              className={`relative transition-colors duration-75 ${charStyle} ${
                isCurrentChar ? 'border-b-2 border-emerald-600 bg-emerald-50 text-slate-800' : ''
              }`}
            >
              {char}
            </span>
          );

          typedIdx++;
          return renderedNode;
        })}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Bar: Selector & Switcher */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          {currentBookId && onChangeBook && (
            <select
              value={currentBookId}
              onChange={(e) => onChangeBook(Number(e.target.value) as BookId)}
              aria-label="选择册次"
              className="text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-emerald-500 cursor-pointer transition-colors"
            >
              <option value={1}>📘 第一册 (144课)</option>
              <option value={2}>📗 第二册 (96课)</option>
              <option value={3}>📕 第三册 (60课)</option>
            </select>
          )}
          <span className="px-2 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-md whitespace-nowrap">
            第 {currentLesson.lessonNumber} 课
          </span>
          <select
            value={currentLesson.id}
            onChange={(e) => {
              const found = allLessons.find(l => l.id === e.target.value);
              if (found) onSelectLesson(found);
            }}
            aria-label="选择练习课文"
            className="text-xs font-medium border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 max-w-[220px] truncate"
          >
            {allLessons.map(l => (
              <option key={l.id} value={l.id}>
                第 {l.lessonNumber} 课: {l.titleEn} ({l.titleZh})
              </option>
            ))}
          </select>
        </div>

        {/* Mode selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
            <button
              onClick={() => setPracticeMode('sentences')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                practiceMode === 'sentences'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              课文句子打字
            </button>
            <button
              onClick={() => setPracticeMode('vocab')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                practiceMode === 'vocab'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              核心生词打字
            </button>
          </div>

          <button
            onClick={handleReset}
            className="p-2 border border-slate-200 text-slate-500 hover:text-slate-800 rounded-lg transition-colors"
            title="重新练习本课"
            aria-label="重新练习本课"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Practice Container */}
      {!isCompleted ? (
        <div 
          onClick={() => inputRef.current?.focus()}
          className="bg-white rounded-2xl border-2 border-slate-200 p-6 sm:p-10 shadow-xs space-y-7 cursor-text relative transition-all hover:border-emerald-300"
        >
          {/* Live HUD / Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-center">
            <div>
              <p className="text-[11px] font-medium text-slate-500">打字速度 (WPM)</p>
              <p className="text-xl sm:text-2xl font-bold font-mono text-emerald-700">
                {liveMetrics.wpm}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500">正确率</p>
              <p className="text-xl sm:text-2xl font-bold font-mono text-slate-800">
                {liveMetrics.accuracy}%
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500">用时</p>
              <p className="text-xl sm:text-2xl font-bold font-mono text-slate-800">
                {elapsedSeconds}s
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500">练习进度</p>
              <p className="text-xl sm:text-2xl font-bold font-mono text-slate-800">
                {currentIndex + 1} / {targets.length}
              </p>
            </div>
          </div>

          {/* Prompt Information */}
          <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-3 flex-wrap gap-2">
            <span className="font-semibold text-slate-700">
              {currentTarget?.speaker ? `${currentTarget.speaker}: ` : ''}{currentTarget?.zh}
            </span>
            <span className="text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded">
              标点符号免输入 · 完成后按回车进入下一题
            </span>
          </div>

          {/* Typing Display Box */}
          <div className="min-h-[100px] flex items-center justify-start p-5 bg-slate-50/60 rounded-xl border border-slate-200/70">
            {renderTypingText()}
          </div>

          {/* Hidden Keyboard Input */}
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="opacity-0 absolute inset-0 w-full h-full cursor-default"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck="false"
            aria-label="打字练习输入区"
          />

          {/* Active Status & Enter CTA */}
          <div className="min-h-[48px] flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            {isLineFinished ? (
              <div className="w-full flex items-center justify-between bg-emerald-50 border border-emerald-200 p-3 rounded-xl animate-fade-in">
                <div className="flex items-center gap-2 text-emerald-800 text-xs sm:text-sm font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>拼写完成！请按键盘回车键 (Enter) 进入下一题</span>
                </div>
                <button
                  type="button"
                  onClick={handleAdvanceNext}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors shadow-xs"
                >
                  <span>下一题</span>
                  <CornerDownLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between text-xs text-slate-400 w-full">
                <span className="flex items-center gap-1.5">
                  <Keyboard className="w-3.5 h-3.5 text-slate-500" />
                  <span>直接输入单词字母与空格，标点会自动忽略</span>
                </span>
                <span>
                  进度 {stripPunctuationForTyping(userInput).length} / {cleanTarget.length} 字母
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Completion Results Modal Card */
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-md space-y-6 animate-scale-up">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Trophy className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              恭喜！完成打字练习
            </h2>
            <p className="text-sm text-slate-500">
              {currentLesson.titleEn} · {practiceMode === 'sentences' ? '课文打字' : '词汇打字'}
            </p>
          </div>

          {/* Rank Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-sm font-semibold">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>评级: {grade.grade}级 · {grade.title}</span>
          </div>

          {/* Final Metrics Grid */}
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto py-4 border-y border-slate-100">
            <div>
              <p className="text-xs text-slate-400">平均打字速度</p>
              <p className="text-2xl sm:text-3xl font-bold font-mono text-emerald-700 mt-1">
                {finalWpm} <span className="text-xs font-normal">WPM</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">整体正确率</p>
              <p className="text-2xl sm:text-3xl font-bold font-mono text-slate-800 mt-1">
                {finalAccuracy}%
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">总练习用时</p>
              <p className="text-2xl sm:text-3xl font-bold font-mono text-slate-800 mt-1">
                {totalSeconds}s
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleSaveResult}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white font-semibold text-sm rounded-xl hover:bg-emerald-700 active:scale-95 transition-all shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>计入打卡记录并保存</span>
            </button>
            <button
              onClick={handleReset}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 border border-slate-200 text-slate-700 font-semibold text-sm rounded-xl hover:bg-slate-50 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>重新再练一次</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
