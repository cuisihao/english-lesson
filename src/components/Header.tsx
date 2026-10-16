import React from 'react';
import { BookOpen, Sparkles, CheckCircle2, Flame, Volume2, VolumeX, ChevronDown } from 'lucide-react';
import { BookId, BOOKS_METADATA } from '../data/types';
import { calculateStreak } from '../utils/studyLogic';
import { soundManager } from '../utils/audio';

export type ActiveTab = 'lessons' | 'vocab' | 'typing' | 'checkin' | 'notebook';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  checkInDates: string[];
  onCheckInClick: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  currentBookId: BookId;
  onChangeBook: (bookId: BookId) => void;
  currentLessonNum: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  checkInDates,
  onCheckInClick,
  soundEnabled,
  setSoundEnabled,
  currentBookId,
  onChangeBook,
  currentLessonNum
}) => {
  const { currentStreak, isCheckedInToday } = calculateStreak(checkInDates);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundManager.setSoundEnabled(next);
  };

  const currentBook = BOOKS_METADATA.find(b => b.id === currentBookId) || BOOKS_METADATA[0];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Brand Wordmark + Book Selector */}
        <div className="flex items-center gap-3 shrink-0">
          <div 
            onClick={() => setActiveTab('lessons')}
            className="flex items-center gap-2 cursor-pointer select-none"
            role="button"
            tabIndex={0}
            aria-label="返回课文主页"
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white shadow-xs ${
              currentBookId === 1 ? 'bg-emerald-600' : currentBookId === 2 ? 'bg-blue-600' : 'bg-indigo-600'
            }`}>
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap">
                新概念英语随身学
              </span>
              <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap">
                第 {currentBookId} 册 · 第 {currentLessonNum} 课
              </span>
            </div>
          </div>

          {/* Book Switcher Dropdown */}
          <div className="relative">
            <select
              value={currentBookId}
              onChange={(e) => onChangeBook(Number(e.target.value) as BookId)}
              className="text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-emerald-500 cursor-pointer transition-colors"
              aria-label="切换册次"
            >
              <option value={1}>📘 第一册 (144课)</option>
              <option value={2}>📗 第二册 (96课)</option>
              <option value={3}>📕 第三册 (60课)</option>
            </select>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Single Line, Clean Typography) */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2 lg:gap-3 text-sm font-medium text-slate-600">
          <button
            onClick={() => setActiveTab('lessons')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'lessons'
                ? 'bg-emerald-50 text-emerald-800 font-semibold'
                : 'hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            课文背诵
          </button>
          <button
            onClick={() => setActiveTab('vocab')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'vocab'
                ? 'bg-emerald-50 text-emerald-800 font-semibold'
                : 'hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            单词记忆
          </button>
          <button
            onClick={() => setActiveTab('typing')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'typing'
                ? 'bg-emerald-50 text-emerald-800 font-semibold'
                : 'hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            打字练习
          </button>
          <button
            onClick={() => setActiveTab('checkin')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'checkin'
                ? 'bg-emerald-50 text-emerald-800 font-semibold'
                : 'hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            学习打卡
          </button>
          <button
            onClick={() => setActiveTab('notebook')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'notebook'
                ? 'bg-emerald-50 text-emerald-800 font-semibold'
                : 'hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            生词本
          </button>
        </nav>

        {/* Zone 3: Primary Action & Audio Control */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={toggleSound}
            aria-label={soundEnabled ? "关闭按键音效" : "开启按键音效"}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            title={soundEnabled ? "音效已开启" : "音效已关闭"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={onCheckInClick}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 shadow-xs ${
              isCheckedInToday
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95'
            }`}
          >
            {isCheckedInToday ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>已打卡 · 连续 {currentStreak} 天</span>
              </>
            ) : (
              <>
                <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300 animate-pulse" />
                <span>立即打卡</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mobile secondary tab bar */}
      <div className="md:hidden flex items-center justify-around px-2 py-1.5 border-t border-slate-100 bg-slate-50 text-xs font-medium text-slate-600 overflow-x-auto">
        <button
          onClick={() => setActiveTab('lessons')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'lessons' ? 'bg-white text-emerald-700 font-bold shadow-xs' : ''}`}
        >
          课文
        </button>
        <button
          onClick={() => setActiveTab('vocab')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'vocab' ? 'bg-white text-emerald-700 font-bold shadow-xs' : ''}`}
        >
          单词
        </button>
        <button
          onClick={() => setActiveTab('typing')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'typing' ? 'bg-white text-emerald-700 font-bold shadow-xs' : ''}`}
        >
          打字
        </button>
        <button
          onClick={() => setActiveTab('checkin')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'checkin' ? 'bg-white text-emerald-700 font-bold shadow-xs' : ''}`}
        >
          打卡
        </button>
        <button
          onClick={() => setActiveTab('notebook')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'notebook' ? 'bg-white text-emerald-700 font-bold shadow-xs' : ''}`}
        >
          生词本
        </button>
      </div>
    </header>
  );
};
