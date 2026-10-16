import React, { useState } from 'react';
import { WordItem, Lesson } from '../data/types';
import { speakEnglish } from '../utils/audio';
import { evaluateSpellingAnswer } from '../utils/studyLogic';
import { 
  Volume2, RotateCw, Check, HelpCircle, X, Star, 
  ChevronLeft, ChevronRight, Layers, List, Edit3, Sparkles 
} from 'lucide-react';

import { BookId, BOOKS_METADATA } from '../data/types.ts';

interface VocabPracticeProps {
  currentLesson: Lesson;
  wordMastery: Record<string, 'mastered' | 'fuzzy' | 'forgot'>;
  notebookWordIds: string[];
  onSetMastery: (wordId: string, status: 'mastered' | 'fuzzy' | 'forgot') => void;
  onToggleNotebook: (wordId: string) => void;
  onSelectLesson: (lesson: Lesson) => void;
  allLessons: Lesson[];
  currentBookId?: BookId;
  onChangeBook?: (bookId: BookId) => void;
}

export const VocabPractice: React.FC<VocabPracticeProps> = ({
  currentLesson,
  wordMastery,
  notebookWordIds,
  onSetMastery,
  onToggleNotebook,
  onSelectLesson,
  allLessons,
  currentBookId,
  onChangeBook
}) => {
  const [viewMode, setViewMode] = useState<'flashcard' | 'list' | 'spelling'>('flashcard');
  const [cardIndex, setCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  // Spelling mode states
  const [spellingInput, setSpellingInput] = useState<string>('');
  const [spellingChecked, setSpellingChecked] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);

  const words = currentLesson.vocabulary;
  const currentWord: WordItem | undefined = words[cardIndex] || words[0];

  const handleNextCard = () => {
    setIsFlipped(false);
    setSpellingInput('');
    setSpellingChecked(false);
    if (cardIndex < words.length - 1) {
      setCardIndex(cardIndex + 1);
    } else {
      setCardIndex(0); // loop
    }
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setSpellingInput('');
    setSpellingChecked(false);
    if (cardIndex > 0) {
      setCardIndex(cardIndex - 1);
    } else {
      setCardIndex(words.length - 1);
    }
  };

  const playWordAudio = (word: string) => {
    speakEnglish(word, { lang: 'en-GB' });
  };

  const handleMasteryClick = (status: 'mastered' | 'fuzzy' | 'forgot') => {
    if (!currentWord) return;
    onSetMastery(currentWord.id, status);
    handleNextCard();
  };

  const checkSpelling = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWord) return;
    const correct = evaluateSpellingAnswer(spellingInput, currentWord.word);
    setIsCorrect(correct);
    setSpellingChecked(true);
    if (correct) {
      playWordAudio(currentWord.word);
      onSetMastery(currentWord.id, 'mastered');
    } else {
      onSetMastery(currentWord.id, 'forgot');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Bar: Lesson switcher & Mode Selector */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          {currentBookId && onChangeBook && (
            <select
              value={currentBookId}
              onChange={(e) => onChangeBook(Number(e.target.value) as BookId)}
              aria-label="切换册次"
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
              if (found) {
                onSelectLesson(found);
                setCardIndex(0);
                setIsFlipped(false);
              }
            }}
            aria-label="切换单词课文"
            className="text-xs font-medium border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 max-w-[220px] truncate"
          >
            {allLessons.map(l => (
              <option key={l.id} value={l.id}>
                第 {l.lessonNumber} 课: {l.titleEn} ({l.vocabulary.length}词)
              </option>
            ))}
          </select>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
          <button
            onClick={() => setViewMode('flashcard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
              viewMode === 'flashcard'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            <span>卡片记忆</span>
          </button>
          <button
            onClick={() => setViewMode('spelling')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
              viewMode === 'spelling'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
            <span>拼写测验</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
              viewMode === 'list'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <List className="w-3.5 h-3.5 text-emerald-600" />
            <span>词汇列表</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Flashcard Deck */}
      {viewMode === 'flashcard' && currentWord && (
        <div className="space-y-4">
          {/* Card Indicator */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              卡片进度: <strong className="text-slate-800">{cardIndex + 1}</strong> / {words.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleNotebook(currentWord.id)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs transition-colors ${
                  notebookWordIds.includes(currentWord.id)
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${notebookWordIds.includes(currentWord.id) ? 'fill-amber-400 text-amber-500' : ''}`} />
                <span>{notebookWordIds.includes(currentWord.id) ? '已入生词本' : '加生词本'}</span>
              </button>
              <span className="text-slate-300">|</span>
              <span className="capitalize">
                状态: {
                  wordMastery[currentWord.id] === 'mastered' ? '🟢 已掌握' :
                  wordMastery[currentWord.id] === 'fuzzy' ? '🟡 模糊' :
                  wordMastery[currentWord.id] === 'forgot' ? '🔴 需复习' : '⚪ 新学'
                }
              </span>
            </div>
          </div>

          {/* Flashcard Box */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full min-h-[300px] sm:min-h-[340px] bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 shadow-sm flex flex-col justify-between items-center text-center cursor-pointer transition-all hover:border-emerald-300 select-none relative group"
          >
            <div className="w-full flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-slate-500">NCE 1 · Lesson {currentLesson.lessonNumber}</span>
              <span className="group-hover:text-emerald-600 transition-colors">
                {isFlipped ? "点击收起释义" : "点击翻转看释义"}
              </span>
            </div>

            {/* Word Center Display */}
            <div className="my-auto space-y-4">
              <div className="flex items-center justify-center gap-3">
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
                  {currentWord.word}
                </h2>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    playWordAudio(currentWord.word);
                  }}
                  className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors"
                  title="朗读单词发音"
                  aria-label="朗读单词发音"
                >
                  <Volume2 className="w-6 h-6" />
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                <span className="font-phonetic text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {currentWord.phonetic}
                </span>
                <span className="font-medium italic text-slate-600">{currentWord.pos}</span>
              </div>

              {/* Flipped Content */}
              {isFlipped ? (
                <div className="mt-6 pt-6 border-t border-slate-100 max-w-md mx-auto space-y-3 animate-fade-in">
                  <p className="text-xl font-bold text-slate-800">
                    {currentWord.meaning}
                  </p>
                  <div className="text-xs sm:text-sm text-slate-600 bg-slate-50 p-3 rounded-lg text-left">
                    <p className="font-medium text-slate-800">{currentWord.example}</p>
                    <p className="text-slate-500 mt-1">{currentWord.exampleZh}</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 mt-4">
                  (想一想发音与中文意思，点击卡片验证)
                </p>
              )}
            </div>

            {/* Bottom prompt */}
            <div className="text-xs text-slate-400 flex items-center gap-1">
              <RotateCw className="w-3.5 h-3.5" />
              <span>翻转卡片</span>
            </div>
          </div>

          {/* Flashcard Response Buttons */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              onClick={handlePrevCard}
              className="p-3 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors"
              title="上一词"
              aria-label="上一词"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex-1 grid grid-cols-3 gap-2 sm:gap-3">
              <button
                onClick={() => handleMasteryClick('forgot')}
                className="inline-flex items-center justify-center gap-1.5 py-3 px-2 sm:px-4 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs sm:text-sm font-semibold hover:bg-rose-100 active:scale-95 transition-all"
              >
                <X className="w-4 h-4" />
                <span>没记住</span>
              </button>
              <button
                onClick={() => handleMasteryClick('fuzzy')}
                className="inline-flex items-center justify-center gap-1.5 py-3 px-2 sm:px-4 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs sm:text-sm font-semibold hover:bg-amber-100 active:scale-95 transition-all"
              >
                <HelpCircle className="w-4 h-4" />
                <span>模糊</span>
              </button>
              <button
                onClick={() => handleMasteryClick('mastered')}
                className="inline-flex items-center justify-center gap-1.5 py-3 px-2 sm:px-4 bg-emerald-600 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-emerald-700 active:scale-95 transition-all shadow-xs"
              >
                <Check className="w-4 h-4" />
                <span>已熟记</span>
              </button>
            </div>

            <button
              onClick={handleNextCard}
              className="p-3 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors"
              title="下一词"
              aria-label="下一词"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Mode 2: Spelling Quiz */}
      {viewMode === 'spelling' && currentWord && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>拼写测验: {cardIndex + 1} / {words.length}</span>
            <span className="font-mono">{currentWord.pos}</span>
          </div>

          <div className="text-center space-y-2 py-4">
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {currentWord.meaning}
            </h3>
            <p className="text-xs font-phonetic text-emerald-700">
              音标提示: {currentWord.phonetic}
            </p>
          </div>

          <form onSubmit={checkSpelling} className="max-w-md mx-auto space-y-4">
            <div>
              <input
                type="text"
                value={spellingInput}
                onChange={(e) => setSpellingInput(e.target.value)}
                placeholder="请输入英文拼写..."
                autoFocus
                className="w-full text-center text-xl font-medium px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-hidden transition-colors"
              />
            </div>

            {spellingChecked && (
              <div className={`p-4 rounded-xl text-center text-sm font-medium ${
                isCorrect ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {isCorrect ? (
                  <p>🎉 回答正确！就是 <strong>{currentWord.word}</strong></p>
                ) : (
                  <div>
                    <p>答错啦。正确拼写是: <strong className="underline">{currentWord.word}</strong></p>
                    <p className="text-xs mt-1 text-rose-600">已自动加入复习生词本</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-3">
              {!spellingChecked ? (
                <button
                  type="submit"
                  disabled={!spellingInput.trim()}
                  className="w-full py-3 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-xs"
                >
                  确认提交拼写
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNextCard}
                  className="w-full py-3 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors"
                >
                  下一词测验
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Mode 3: Word List Table */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>单词与音标</span>
            <span>词性与中文释义</span>
            <span>操作</span>
          </div>

          <div className="divide-y divide-slate-100">
            {words.map((w) => {
              const isStarred = notebookWordIds.includes(w.id);
              const mastery = wordMastery[w.id];

              return (
                <div key={w.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => playWordAudio(w.word)}
                      className="p-2 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="发音"
                      aria-label="发音"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-slate-900">{w.word}</span>
                        <span className="text-xs font-phonetic text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                          {w.phonetic}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{w.example}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-medium text-slate-800">
                      <span className="italic text-slate-500 text-xs mr-1">{w.pos}</span>
                      {w.meaning}
                    </div>
                    <span className="text-xs text-slate-400 mt-0.5 block">
                      {w.exampleZh}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onToggleNotebook(w.id)}
                      className={`p-1.5 rounded transition-colors ${
                        isStarred ? 'text-amber-500 bg-amber-50' : 'text-slate-300 hover:text-slate-600'
                      }`}
                      title={isStarred ? "从生词本移除" : "加入生词本"}
                      aria-label={isStarred ? "从生词本移除" : "加入生词本"}
                    >
                      <Star className={`w-4 h-4 ${isStarred ? 'fill-current' : ''}`} />
                    </button>

                    <button
                      onClick={() => onSetMastery(w.id, mastery === 'mastered' ? 'fuzzy' : 'mastered')}
                      className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                        mastery === 'mastered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {mastery === 'mastered' ? '已掌握' : '未掌握'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
