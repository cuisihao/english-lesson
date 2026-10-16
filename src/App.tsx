/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  getBookLessons, 
  getLessonById, 
  BOOKS_METADATA, 
  BookId, 
  Lesson 
} from './data/nceCatalog.ts';
import { 
  loadUserStudyData, 
  saveUserStudyData, 
  checkInToday, 
  toggleLessonCompleted, 
  setWordMastery, 
  toggleNotebookWord, 
  recordTypingResult,
  setSelectedBook,
  UserStudyData 
} from './utils/storage.ts';
import { soundManager } from './utils/audio.ts';
import { Header, ActiveTab } from './components/Header.tsx';
import { LessonReader } from './components/LessonReader.tsx';
import { VocabPractice } from './components/VocabPractice.tsx';
import { TypingPractice } from './components/TypingPractice.tsx';
import { CheckInDashboard } from './components/CheckInDashboard.tsx';
import { NotebookView } from './components/NotebookView.tsx';
import { Sparkles } from 'lucide-react';

export default function App() {
  const [studyData, setStudyData] = useState<UserStudyData>(loadUserStudyData());
  const [activeTab, setActiveTab] = useState<ActiveTab>('lessons');
  const [currentBookId, setCurrentBookId] = useState<BookId>(() => studyData.selectedBookId || 1);
  const [currentLesson, setCurrentLesson] = useState<Lesson>(() => {
    const bookLessons = getBookLessons(studyData.selectedBookId || 1);
    return bookLessons[0];
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync state with storage updates
  useEffect(() => {
    const handleUpdate = () => {
      setStudyData(loadUserStudyData());
    };
    window.addEventListener('study_data_updated', handleUpdate);
    return () => window.removeEventListener('study_data_updated', handleUpdate);
  }, []);

  const currentBookLessons = getBookLessons(currentBookId);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleChangeBook = (newBookId: BookId) => {
    setCurrentBookId(newBookId);
    setSelectedBook(newBookId);
    const newBookLessons = getBookLessons(newBookId);
    setCurrentLesson(newBookLessons[0]);
    const bookInfo = BOOKS_METADATA.find(b => b.id === newBookId);
    showToast(`📖 已切换至《新概念英语》${bookInfo?.title || `第${newBookId}册`} (共${newBookLessons.length}课)`);
    setStudyData(loadUserStudyData());
  };

  const handleManualCheckIn = () => {
    const res = checkInToday();
    soundManager.playSuccessChime();
    if (res.isNewCheckIn) {
      showToast('🎉 今日打卡成功！连续天数 +1');
    } else {
      showToast('✓ 今日已经打过卡啦，继续加油！');
    }
    setStudyData(loadUserStudyData());
  };

  const handleToggleCompleted = () => {
    const isNow = toggleLessonCompleted(currentLesson.id);
    if (isNow) {
      soundManager.playSuccessChime();
      showToast(`👏 第${currentBookId}册 第${currentLesson.lessonNumber}课已标记背诵完成！`);
    } else {
      showToast(`已取消第${currentBookId}册 第${currentLesson.lessonNumber}课的完成标记`);
    }
    setStudyData(loadUserStudyData());
  };

  const handleSetMastery = (wordId: string, status: 'mastered' | 'fuzzy' | 'forgot') => {
    setWordMastery(wordId, status);
    setStudyData(loadUserStudyData());
  };

  const handleToggleNotebook = (wordId: string) => {
    const added = toggleNotebookWord(wordId);
    showToast(added ? '已添加至生词本' : '已从生词本移除');
    setStudyData(loadUserStudyData());
  };

  const handleFinishTyping = (record: { title: string; wpm: number; accuracy: number; timeSpent: number }) => {
    recordTypingResult(record);
    soundManager.playSuccessChime();
    showToast(`⚡ 打字成绩已保存：${record.wpm} WPM · 正确率 ${record.accuracy}%`);
    setStudyData(loadUserStudyData());
    setActiveTab('checkin');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        checkInDates={studyData.checkInDates}
        onCheckInClick={handleManualCheckIn}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        currentBookId={currentBookId}
        onChangeBook={handleChangeBook}
        currentLessonNum={currentLesson.lessonNumber}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'lessons' && (
          <LessonReader
            lessons={currentBookLessons}
            currentLesson={currentLesson}
            onSelectLesson={setCurrentLesson}
            currentBookId={currentBookId}
            onChangeBook={handleChangeBook}
            isCompleted={studyData.completedLessonIds.includes(currentLesson.id)}
            onToggleCompleted={handleToggleCompleted}
            onGoToTyping={() => setActiveTab('typing')}
            onGoToVocab={() => setActiveTab('vocab')}
            completedLessonIds={studyData.completedLessonIds}
          />
        )}

        {activeTab === 'vocab' && (
          <VocabPractice
            currentLesson={currentLesson}
            wordMastery={studyData.wordMastery}
            notebookWordIds={studyData.notebookWordIds}
            onSetMastery={handleSetMastery}
            onToggleNotebook={handleToggleNotebook}
            onSelectLesson={setCurrentLesson}
            allLessons={currentBookLessons}
            currentBookId={currentBookId}
            onChangeBook={handleChangeBook}
          />
        )}

        {activeTab === 'typing' && (
          <TypingPractice
            currentLesson={currentLesson}
            onSelectLesson={setCurrentLesson}
            allLessons={currentBookLessons}
            onFinishTyping={handleFinishTyping}
            currentBookId={currentBookId}
            onChangeBook={handleChangeBook}
          />
        )}

        {activeTab === 'checkin' && (
          <CheckInDashboard
            studyData={studyData}
            onCheckIn={handleManualCheckIn}
            onGoToTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'notebook' && (
          <NotebookView
            notebookWordIds={studyData.notebookWordIds}
            wordMastery={studyData.wordMastery}
            onToggleNotebook={handleToggleNotebook}
            onSetMastery={handleSetMastery}
            onStartReview={() => setActiveTab('vocab')}
          />
        )}
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-lg text-xs font-semibold animate-slide-up">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            新概念英语全套 (第1册 144课 · 第2册 96课 · 第3册 60课 · 共300课) · 沉浸式听读背诵与打字专训
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>支持全本地离线学习</span>
            <span aria-hidden="true">·</span>
            <span>Web Speech 智能真人发音</span>
            <span aria-hidden="true">·</span>
            <span>标点免输入键盘打字</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
