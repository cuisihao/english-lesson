import React, { useState, useEffect } from 'react';
import { Lesson, BookId, BOOKS_METADATA } from '../data/types.ts';
import { speakEnglish, stopSpeaking } from '../utils/audio.ts';
import { maskSentenceForRecitation } from '../utils/studyLogic.ts';
import { 
  Play, Pause, RotateCcw, Volume2, CheckCircle, 
  ChevronLeft, ChevronRight, Keyboard, Eye, EyeOff, BookOpen, GraduationCap,
  Search, Filter, List, X
} from 'lucide-react';

interface LessonReaderProps {
  lessons: Lesson[];
  currentLesson: Lesson;
  onSelectLesson: (lesson: Lesson) => void;
  currentBookId: BookId;
  onChangeBook: (bookId: BookId) => void;
  isCompleted: boolean;
  onToggleCompleted: () => void;
  onGoToTyping: () => void;
  onGoToVocab: () => void;
  completedLessonIds?: string[];
}

export const LessonReader: React.FC<LessonReaderProps> = ({
  lessons,
  currentLesson,
  onSelectLesson,
  currentBookId,
  onChangeBook,
  isCompleted,
  onToggleCompleted,
  onGoToTyping,
  onGoToVocab,
  completedLessonIds = []
}) => {
  const [studyMode, setStudyMode] = useState<'bilingual' | 'english_only' | 'recite_cloze'>('bilingual');
  const [clozeLevel, setClozeLevel] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [revealedSentences, setRevealedSentences] = useState<Record<number, boolean>>({});
  
  // Audio state
  const [isPlayingAll, setIsPlayingAll] = useState<boolean>(false);
  const [currentPlayingLine, setCurrentPlayingLine] = useState<number | null>(null);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [accent, setAccent] = useState<'en-GB' | 'en-US'>('en-GB');

  // Catalog modal state
  const [showCatalogModal, setShowCatalogModal] = useState<boolean>(false);
  const [catalogSearch, setCatalogSearch] = useState<string>('');
  const [selectedUnitFilter, setSelectedUnitFilter] = useState<string>('all');

  // Cancel any active speech on lesson switch
  useEffect(() => {
    stopSpeaking();
    setIsPlayingAll(false);
    setCurrentPlayingLine(null);
    setRevealedSentences({});
  }, [currentLesson.id]);

  const currentIndex = lessons.findIndex(l => l.id === currentLesson.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < lessons.length - 1;

  const handlePrev = () => {
    if (hasPrev) onSelectLesson(lessons[currentIndex - 1]);
  };

  const handleNext = () => {
    if (hasNext) onSelectLesson(lessons[currentIndex + 1]);
  };

  // Play single sentence
  const handlePlayLine = (lineIndex: number, text: string) => {
    stopSpeaking();
    setIsPlayingAll(false);
    setCurrentPlayingLine(lineIndex);
    speakEnglish(text, {
      rate: speechRate,
      lang: accent,
      onEnd: () => setCurrentPlayingLine(null)
    });
  };

  // Sequential playback of entire lesson
  const handlePlayAll = () => {
    if (isPlayingAll) {
      stopSpeaking();
      setIsPlayingAll(false);
      setCurrentPlayingLine(null);
      return;
    }

    setIsPlayingAll(true);
    let index = 0;

    const playNext = () => {
      if (index >= currentLesson.dialogue.length) {
        setIsPlayingAll(false);
        setCurrentPlayingLine(null);
        return;
      }
      setCurrentPlayingLine(index);
      speakEnglish(currentLesson.dialogue[index].en, {
        rate: speechRate,
        lang: accent,
        onEnd: () => {
          index++;
          playNext();
        }
      });
    };

    playNext();
  };

  const toggleRevealSentence = (idx: number) => {
    setRevealedSentences(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  // Unique units for catalog filtering
  const allUnits = Array.from(new Set(lessons.map(l => l.unitGroup)));

  const filteredCatalogLessons = lessons.filter(l => {
    const matchesUnit = selectedUnitFilter === 'all' || l.unitGroup === selectedUnitFilter;
    if (!matchesUnit) return false;
    if (!catalogSearch.trim()) return true;
    const term = catalogSearch.toLowerCase().trim();
    return (
      String(l.lessonNumber) === term ||
      l.titleEn.toLowerCase().includes(term) ||
      l.titleZh.includes(term) ||
      l.grammarFocus.toLowerCase().includes(term)
    );
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Book Tabs Banner */}
      <div className="flex items-center justify-between gap-3 p-1.5 bg-slate-200/70 rounded-xl text-xs overflow-x-auto">
        {BOOKS_METADATA.map((b) => (
          <button
            key={b.id}
            onClick={() => onChangeBook(b.id)}
            className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-lg font-semibold transition-all whitespace-nowrap text-center flex items-center justify-center gap-1.5 ${
              currentBookId === b.id
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <span>{b.id === 1 ? '📘' : b.id === 2 ? '📗' : '📕'}</span>
            <span>{b.title}</span>
            <span className="text-[11px] px-1.5 py-0.2 bg-slate-100 rounded text-slate-500 font-normal">
              {b.totalLessons}课
            </span>
          </button>
        ))}
      </div>

      {/* Top Banner: Navigation between lessons and status */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-md shrink-0 ${
              currentBookId === 1 ? 'bg-emerald-100 text-emerald-800' :
              currentBookId === 2 ? 'bg-blue-100 text-blue-800' : 'bg-indigo-100 text-indigo-800'
            }`}>
              第 {currentBookId} 册 · 第 {currentLesson.lessonNumber} 课
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {currentLesson.titleEn}
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                {currentLesson.titleZh} · {currentLesson.unitGroup}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handlePrev}
              disabled={!hasPrev}
              className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              title="上一课"
              aria-label="上一课"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Quick dropdown selector */}
            <select
              value={currentLesson.id}
              onChange={(e) => {
                const found = lessons.find(l => l.id === e.target.value);
                if (found) onSelectLesson(found);
              }}
              aria-label="快速切换课文"
              className="text-xs font-medium border border-slate-200 rounded-lg px-2.5 py-2 bg-white text-slate-700 hover:border-slate-300 focus:outline-emerald-500 max-w-[210px] truncate"
            >
              {lessons.map(l => (
                <option key={l.id} value={l.id}>
                  第 {l.lessonNumber} 课: {l.titleEn} ({l.titleZh})
                </option>
              ))}
            </select>

            <button
              onClick={handleNext}
              disabled={!hasNext}
              className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              title="下一课"
              aria-label="下一课"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Course Catalog Drawer Trigger */}
            <button
              onClick={() => setShowCatalogModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors"
              title="查看全部课文目录 (共全部课程)"
            >
              <List className="w-3.5 h-3.5 text-emerald-600" />
              <span>全书目录 ({lessons.length}课)</span>
            </button>

            {/* Completed badge */}
            <button
              onClick={onToggleCompleted}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
                isCompleted
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <CheckCircle className={`w-3.5 h-3.5 ${isCompleted ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>{isCompleted ? '已打卡背诵' : '标记已背诵'}</span>
            </button>
          </div>
        </div>

        {/* Study Toolbar: Audio control + Mode selectors */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Audio playback row */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePlayAll}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                isPlayingAll
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              {isPlayingAll ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>暂停朗读</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>朗读全篇课文</span>
                </>
              )}
            </button>

            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
              <button
                onClick={() => setAccent(accent === 'en-GB' ? 'en-US' : 'en-GB')}
                className="px-2.5 py-1.5 text-slate-700 hover:bg-slate-200 transition-colors"
                title="切换英音/美音"
              >
                {accent === 'en-GB' ? '🇬🇧 英音' : '🇺🇸 美音'}
              </button>
              <span className="w-px h-4 bg-slate-200" />
              <button
                onClick={() => {
                  const rates = [0.8, 1.0, 1.2];
                  const nextIdx = (rates.indexOf(speechRate) + 1) % rates.length;
                  setSpeechRate(rates[nextIdx]);
                }}
                className="px-2.5 py-1.5 text-slate-700 hover:bg-slate-200 transition-colors"
                title="调节语速"
              >
                {speechRate}x 语速
              </button>
            </div>
          </div>

          {/* Mode Segmented Control */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setStudyMode('bilingual')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                studyMode === 'bilingual'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              中英双语
            </button>
            <button
              onClick={() => setStudyMode('english_only')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                studyMode === 'english_only'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              英文沉浸
            </button>
            <button
              onClick={() => setStudyMode('recite_cloze')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                studyMode === 'recite_cloze'
                  ? 'bg-white text-emerald-800 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              遮词背诵 (Cloze)
            </button>
          </div>
        </div>

        {/* Recite Cloze Level Selector */}
        {studyMode === 'recite_cloze' && (
          <div className="mt-3 p-3 bg-amber-50/70 border border-amber-200 rounded-lg flex items-center justify-between text-xs text-amber-900 flex-wrap gap-2">
            <span>遮词背诵模式：尝试看着挖空凭记忆跟读或默念，点击小眼睛可偷看答案。</span>
            <div className="flex items-center gap-1">
              <span className="text-amber-800 font-medium">难度：</span>
              {(['easy', 'medium', 'hard'] as const).map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setClozeLevel(lvl)}
                  className={`px-2 py-0.5 rounded text-xs transition-colors ${
                    clozeLevel === lvl
                      ? 'bg-amber-600 text-white font-medium'
                      : 'bg-white text-amber-900 border border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  {lvl === 'easy' ? '初级' : lvl === 'medium' ? '中级' : '通篇全遮'}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Dialogue / Sentence List */}
      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 shadow-xs overflow-hidden">
        {currentLesson.dialogue.map((line, idx) => {
          const isPlayingThis = currentPlayingLine === idx;
          const isRevealed = revealedSentences[idx];
          const masked = maskSentenceForRecitation(line.en, clozeLevel);
          const displayText = studyMode === 'recite_cloze' && !isRevealed
            ? masked.maskedSentence
            : line.en;

          return (
            <div
              key={idx}
              className={`p-4 sm:p-5 transition-colors flex items-start gap-4 ${
                isPlayingThis ? 'bg-emerald-50/60' : 'hover:bg-slate-50/60'
              }`}
            >
              {/* Speaker label badge */}
              <div className="w-16 sm:w-24 shrink-0 pt-0.5">
                <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 truncate max-w-full">
                  {line.speaker}
                </span>
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <p className={`text-base sm:text-lg tracking-normal ${
                    studyMode === 'recite_cloze' && !isRevealed
                      ? 'font-mono text-slate-700 tracking-wider'
                      : 'font-medium text-slate-900'
                  }`}>
                    {displayText}
                  </p>

                  <div className="flex items-center gap-1 shrink-0">
                    {studyMode === 'recite_cloze' && (
                      <button
                        onClick={() => toggleRevealSentence(idx)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded transition-colors"
                        title={isRevealed ? "隐藏原文" : "偷看原文"}
                        aria-label={isRevealed ? "隐藏原文" : "偷看原文"}
                      >
                        {isRevealed ? <EyeOff className="w-4 h-4 text-emerald-600" /> : <Eye className="w-4 h-4" />}
                      </button>
                    )}

                    <button
                      onClick={() => handlePlayLine(idx, line.en)}
                      className={`p-1.5 rounded transition-colors ${
                        isPlayingThis
                          ? 'text-emerald-700 bg-emerald-100'
                          : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                      }`}
                      title="朗读该句"
                      aria-label="朗读该句"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Chinese translation line */}
                {studyMode !== 'english_only' && (
                  <p className="text-sm text-slate-500 mt-1">
                    {line.zh}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Grammar & Key Sentences Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Grammar Focus Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm mb-3">
            <GraduationCap className="w-4 h-4 text-emerald-600" />
            <span>核心语法与句型重点</span>
          </div>
          <p className="text-xs font-semibold text-slate-700 mb-2">
            {currentLesson.grammarFocus}
          </p>
          <ul className="space-y-1.5 text-xs text-slate-600">
            {currentLesson.grammarNotes.map((note, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold shrink-0">·</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Launchpad to Typing & Vocab */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm mb-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>本课练习进阶</span>
            </div>
            <p className="text-xs text-slate-500">
              课文读懂了吗？立刻通过打字和词汇卡片强化肌肉记忆与拼写！
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-3">
            <button
              onClick={onGoToTyping}
              className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-xs"
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span>练习本课打字</span>
            </button>
            <button
              onClick={onGoToVocab}
              className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>背诵本课单词 ({currentLesson.vocabulary.length}词)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Course Catalog Modal / Drawer */}
      {showCatalogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-600" />
                  <span>第 {currentBookId} 册全部课文目录 (共 {lessons.length} 课)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  点击任意课文卡片即可快速跳转开始背诵、阅读与打字
                </p>
              </div>
              <button
                onClick={() => setShowCatalogModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                aria-label="关闭目录"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between bg-white">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="搜索课文编号、英文标题或语法..."
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-emerald-500 focus:border-emerald-500"
                />
              </div>

              {/* Unit Filter dropdown */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs text-slate-500 shrink-0">单元筛选:</span>
                <select
                  value={selectedUnitFilter}
                  onChange={(e) => setSelectedUnitFilter(e.target.value)}
                  className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white text-slate-700 max-w-[240px] truncate"
                >
                  <option value="all">全部单元 ({lessons.length} 课)</option>
                  {allUnits.map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Grid of Lessons */}
            <div className="p-5 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredCatalogLessons.map((l) => {
                const isSelected = l.id === currentLesson.id;
                const isDone = completedLessonIds.includes(l.id);

                return (
                  <div
                    key={l.id}
                    onClick={() => {
                      onSelectLesson(l);
                      setShowCatalogModal(false);
                    }}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all hover:shadow-xs flex flex-col justify-between ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-400/40'
                        : isDone
                        ? 'border-emerald-200 bg-emerald-50/20 hover:border-emerald-300'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          第 {l.lessonNumber} 课
                        </span>
                        {isDone && (
                          <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            <span>已背诵</span>
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {l.titleEn}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        {l.titleZh}
                      </p>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                      <span className="truncate max-w-[150px]">{l.grammarFocus}</span>
                      <span className="text-emerald-600 font-semibold shrink-0">研读 →</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
