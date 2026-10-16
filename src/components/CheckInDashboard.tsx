import React, { useState } from 'react';
import { UserStudyData, getTodayDateString } from '../utils/storage';
import { calculateStreak } from '../utils/studyLogic';
import { soundManager } from '../utils/audio';
import { 
  Flame, CheckCircle2, Calendar, Trophy, BookOpen, 
  Keyboard, Award, Sparkles, TrendingUp, Clock, Target 
} from 'lucide-react';

interface CheckInDashboardProps {
  studyData: UserStudyData;
  onCheckIn: () => void;
  onGoToTab: (tab: 'lessons' | 'vocab' | 'typing') => void;
}

export const CheckInDashboard: React.FC<CheckInDashboardProps> = ({
  studyData,
  onCheckIn,
  onGoToTab
}) => {
  const todayStr = getTodayDateString();
  const { currentStreak, totalDays, isCheckedInToday } = calculateStreak(studyData.checkInDates, todayStr);

  const masteredWordsCount = Object.values(studyData.wordMastery).filter(s => s === 'mastered').length;
  const bestWpm = studyData.typingRecords.length > 0
    ? Math.max(...studyData.typingRecords.map(r => r.wpm))
    : 0;

  // Generate last 28 days for calendar heatmap
  const calendarDays = Array.from({ length: 28 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (27 - i));
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const isChecked = studyData.checkInDates.includes(dateStr);
    const isToday = dateStr === todayStr;
    return {
      dateStr,
      dayNum: d.getDate(),
      isChecked,
      isToday
    };
  });

  const todayTypingDone = studyData.typingRecords.some(r => r.date === todayStr);
  const todayLessonDone = studyData.completedLessonIds.length > 0;
  const todayVocabDone = masteredWordsCount >= 3;

  const b1Done = studyData.completedLessonIds.filter(id => id.startsWith('1-')).length;
  const b2Done = studyData.completedLessonIds.filter(id => id.startsWith('2-')).length;
  const b3Done = studyData.completedLessonIds.filter(id => id.startsWith('3-')).length;
  const totalCompleted = studyData.completedLessonIds.length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Hero Check-in Banner */}
      <div className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 rounded-2xl text-white p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-xs rounded-full text-xs font-medium text-emerald-100">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>新概念英语第一至三册 (共300课) · 每天打卡进步一点点</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {isCheckedInToday ? "太棒了，今日已成功打卡！" : "今日学习打卡提醒"}
            </h1>
            <p className="text-sm text-emerald-100/90 max-w-xl">
              {isCheckedInToday
                ? `您已连续打卡 ${currentStreak} 天！已背诵 ${totalCompleted} 课，保持良好节奏，继续打字与朗读。`
                : "每天精读一课、记几个单词、打字练习巩固记忆，英语语感自然而成。"}
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-4">
            <button
              onClick={onCheckIn}
              disabled={isCheckedInToday}
              className={`inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-bold shadow-md transition-all ${
                isCheckedInToday
                  ? 'bg-emerald-600/80 text-white cursor-default border border-emerald-400/30'
                  : 'bg-white text-emerald-900 hover:bg-emerald-50 active:scale-95'
              }`}
            >
              {isCheckedInToday ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                  <span>今日已打卡 ✓</span>
                </>
              ) : (
                <>
                  <Flame className="w-5 h-5 text-amber-500 fill-amber-500 animate-bounce" />
                  <span>立即打卡签到</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Multi-Book Curriculum Progress Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Book 1 */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-800 mb-1.5">
            <span>📘 第一册 · 基础初阶</span>
            <span><span className="font-mono">{b1Done}</span> / 144 课</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, Math.round((b1Done / 144) * 100))}%` }} 
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
            <span>日常口语与语法夯实</span>
            <span className="font-medium text-emerald-700">{Math.round((b1Done / 144) * 100)}%</span>
          </p>
        </div>

        {/* Book 2 */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-blue-800 mb-1.5">
            <span>📗 第二册 · 初级实践</span>
            <span><span className="font-mono">{b2Done}</span> / 96 课</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-blue-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, Math.round((b2Done / 96) * 100))}%` }} 
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
            <span>96篇经典故事与句型突破</span>
            <span className="font-medium text-blue-700">{Math.round((b2Done / 96) * 100)}%</span>
          </p>
        </div>

        {/* Book 3 */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-indigo-800 mb-1.5">
            <span>📕 第三册 · 进阶技能</span>
            <span><span className="font-mono">{b3Done}</span> / 60 课</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, Math.round((b3Done / 60) * 100))}%` }} 
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
            <span>60篇深度思辨与议论篇章</span>
            <span className="font-medium text-indigo-700">{Math.round((b3Done / 60) * 100)}%</span>
          </p>
        </div>
      </div>

      {/* KPI 4-Card Strip (Clean unboxed tabular figures) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>连续打卡</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900">
              {currentStreak}
            </span>
            <span className="text-xs text-slate-500">天</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">累计签到 {totalDays} 天</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>已背熟课文</span>
            <BookOpen className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900">
              {totalCompleted}
            </span>
            <span className="text-xs text-slate-500">/ 300 篇</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">三册全套通关进度</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>已熟记生词</span>
            <Award className="w-4 h-4 text-teal-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900">
              {masteredWordsCount}
            </span>
            <span className="text-xs text-slate-500">词</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">生词本内 {studyData.notebookWordIds.length} 词</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>最高打字速度</span>
            <Keyboard className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900">
              {bestWpm}
            </span>
            <span className="text-xs text-slate-500">WPM</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">练习记录 {studyData.typingRecords.length} 次</p>
        </div>
      </div>

      {/* 2-Column: 30-Day Punch Card + Today's Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 30-Day Calendar Heatmap (2 cols) */}
        <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-800">近28天打卡足迹</h2>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block" />
                已打卡
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-slate-100 inline-block border border-slate-200" />
                未打卡
              </span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 pt-2">
            {calendarDays.map((cd) => (
              <div
                key={cd.dateStr}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all ${
                  cd.isChecked
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                    : 'bg-slate-50/50 border-slate-100 text-slate-400'
                } ${cd.isToday ? 'ring-2 ring-emerald-500 ring-offset-1' : ''}`}
              >
                <span className="text-[10px] text-slate-400">
                  {cd.dateStr.slice(5)}
                </span>
                <span className="h-5 flex items-center justify-center font-mono mt-0.5">
                  {cd.isChecked ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <span className="text-xs">{cd.dayNum}</span>
                  )}
                </span>
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-400 text-right">
            累计学习时长：约 {studyData.totalMinutesStudied} 分钟
          </p>
        </div>

        {/* Today's Tasks Checklist (1 col) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-800">今日学习目标</h2>
            </div>

            <div className="space-y-2.5 text-xs">
              <div 
                onClick={() => onGoToTab('lessons')}
                className="p-3 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors"
              >
                <div>
                  <p className="font-semibold text-slate-800">精读/背诵课文 1 课</p>
                  <p className="text-slate-500 mt-0.5">听录音并跟读课文对话</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                  todayLessonDone ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  {todayLessonDone ? '已完成' : '去完成'}
                </span>
              </div>

              <div 
                onClick={() => onGoToTab('vocab')}
                className="p-3 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors"
              >
                <div>
                  <p className="font-semibold text-slate-800">卡片记忆单词 5 个</p>
                  <p className="text-slate-500 mt-0.5">掌握音标与例句释义</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                  todayVocabDone ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  {todayVocabDone ? '已完成' : '去完成'}
                </span>
              </div>

              <div 
                onClick={() => onGoToTab('typing')}
                className="p-3 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors"
              >
                <div>
                  <p className="font-semibold text-slate-800">新概念打字练习 1 轮</p>
                  <p className="text-slate-500 mt-0.5">强化键盘英文肌肉记忆</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                  todayTypingDone ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  {todayTypingDone ? '已完成' : '去完成'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-400">
              完成上述任意一项均可点亮打卡成就
            </span>
          </div>
        </div>
      </div>

      {/* Recent Typing History */}
      {studyData.typingRecords.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-800">打字练习测试记录</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">练习内容</th>
                  <th className="py-2.5 px-3 font-semibold">打字速度 (WPM)</th>
                  <th className="py-2.5 px-3 font-semibold">正确率</th>
                  <th className="py-2.5 px-3 font-semibold">练习耗时</th>
                  <th className="py-2.5 px-3 font-semibold">练习日期</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studyData.typingRecords.slice(0, 5).map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-medium text-slate-800">{rec.title}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">{rec.wpm} WPM</td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">{rec.accuracy}%</td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">{rec.timeSpent}s</td>
                    <td className="py-2.5 px-3 text-slate-400">{rec.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
