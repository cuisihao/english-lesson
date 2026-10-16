import React, { useState } from 'react';
import { getAllVocabulary, WordItem, BookId } from '../data/nceCatalog.ts';
import { speakEnglish } from '../utils/audio.ts';
import { 
  BookMarked, Volume2, Star, Search, Filter, 
  Trash2, RotateCw, Sparkles, CheckCircle2 
} from 'lucide-react';

interface NotebookViewProps {
  notebookWordIds: string[];
  wordMastery: Record<string, 'mastered' | 'fuzzy' | 'forgot'>;
  onToggleNotebook: (wordId: string) => void;
  onSetMastery: (wordId: string, status: 'mastered' | 'fuzzy' | 'forgot') => void;
  onStartReview: () => void;
}

export const NotebookView: React.FC<NotebookViewProps> = ({
  notebookWordIds,
  wordMastery,
  onToggleNotebook,
  onSetMastery,
  onStartReview
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'fuzzy_only' | 'starred_only'>('all');
  const [bookFilter, setBookFilter] = useState<'all' | BookId>('all');

  const allWords = getAllVocabulary();

  // Find all words that are either starred or have 'fuzzy' / 'forgot' status
  const notebookWords = allWords.filter(w => {
    const isStarred = notebookWordIds.includes(w.id);
    const mastery = wordMastery[w.id];
    const isNeedsReview = mastery === 'fuzzy' || mastery === 'forgot';

    if (bookFilter !== 'all') {
      const bookPrefix = `${bookFilter}-`;
      if (!w.id.startsWith(bookPrefix)) return false;
    }

    if (filterType === 'starred_only') return isStarred;
    if (filterType === 'fuzzy_only') return isNeedsReview;
    return isStarred || isNeedsReview;
  });

  const filteredWords = notebookWords.filter(w => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      w.word.toLowerCase().includes(term) ||
      w.meaning.includes(term) ||
      w.example.toLowerCase().includes(term)
    );
  });

  const playWord = (word: string) => {
    speakEnglish(word, { lang: 'en-GB' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <BookMarked className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">我的生词本与错题复习</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              共收录 {notebookWords.length} 个重点复习单词 · 背诵更聚焦
            </p>
          </div>
        </div>

        {notebookWords.length > 0 && (
          <button
            onClick={onStartReview}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-xs shrink-0"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>开始轮播卡片复习</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索单词、中文含义或例句..."
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-800 placeholder-slate-400 focus:outline-emerald-500"
          />
        </div>

        {/* Book filter and status filter */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1 bg-slate-200/70 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setBookFilter('all')}
              className={`px-2 py-1 rounded-md font-semibold transition-all ${
                bookFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              全套生词
            </button>
            <button
              onClick={() => setBookFilter(1)}
              className={`px-2 py-1 rounded-md font-semibold transition-all ${
                bookFilter === 1 ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              第一册
            </button>
            <button
              onClick={() => setBookFilter(2)}
              className={`px-2 py-1 rounded-md font-semibold transition-all ${
                bookFilter === 2 ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              第二册
            </button>
            <button
              onClick={() => setBookFilter(3)}
              className={`px-2 py-1 rounded-md font-semibold transition-all ${
                bookFilter === 3 ? 'bg-white text-indigo-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              第三册
            </button>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setFilterType('all')}
              className={`flex-1 sm:flex-none px-3 py-1 rounded-md font-medium transition-all ${
                filterType === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              全部 ({notebookWords.length})
            </button>
            <button
              onClick={() => setFilterType('fuzzy_only')}
              className={`flex-1 sm:flex-none px-3 py-1 rounded-md font-medium transition-all ${
                filterType === 'fuzzy_only' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              模糊/需巩固
            </button>
            <button
              onClick={() => setFilterType('starred_only')}
              className={`flex-1 sm:flex-none px-3 py-1 rounded-md font-medium transition-all ${
                filterType === 'starred_only' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              星标收藏
            </button>
          </div>
        </div>
      </div>

      {/* Words List */}
      {filteredWords.length > 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 shadow-xs overflow-hidden">
          {filteredWords.map((w) => {
            const isStarred = notebookWordIds.includes(w.id);
            const mastery = wordMastery[w.id];

            return (
              <div key={w.id} className="p-4 sm:p-5 flex items-start sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => playWord(w.word)}
                    className="p-2 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors mt-0.5 sm:mt-0"
                    title="播放发音"
                    aria-label="播放发音"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base font-bold text-slate-900">{w.word}</span>
                      <span className="text-xs font-phonetic text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        {w.phonetic}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        第 {w.lessonNumber} 课
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 mt-1">
                      <span className="font-semibold text-slate-700 mr-2">{w.meaning}</span>
                      <span className="text-slate-400">({w.pos})</span>
                    </div>

                    <p className="text-xs text-slate-500 mt-1 bg-slate-50 p-2 rounded-md">
                      <span className="font-medium text-slate-700">{w.example}</span>
                      <span className="block text-slate-400 mt-0.5">{w.exampleZh}</span>
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onSetMastery(w.id, 'mastered')}
                    className={`p-2 rounded-lg text-xs font-medium transition-colors ${
                      mastery === 'mastered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'border border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                    title="标记为已掌握"
                    aria-label="标记为已掌握"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onToggleNotebook(w.id)}
                    className={`p-2 rounded-lg text-xs transition-colors ${
                      isStarred ? 'text-amber-500 bg-amber-50' : 'text-slate-300 hover:text-slate-600'
                    }`}
                    title={isStarred ? "取消星标收藏" : "星标收藏"}
                    aria-label={isStarred ? "取消星标收藏" : "星标收藏"}
                  >
                    <Star className={`w-4 h-4 ${isStarred ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs space-y-3">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <BookMarked className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">
            {searchTerm ? '未找到符合搜索条件的生词' : '生词本空空如也'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            在背诵单词或做拼写测验时，标记为“模糊”或点击星标的生词会自动保存在这里，方便集中突破。
          </p>
        </div>
      )}
    </div>
  );
};
