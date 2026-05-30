import { useState, useEffect } from 'react';
import { Entry } from '../types';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { BookOpen, CheckCircle, ClipboardList, Filter, SlidersHorizontal } from 'lucide-react';
import { AttachmentsGallery } from './AttachmentsGallery';
import { EntryLinks } from './EntryLinks';
import { MarkdownRenderer } from './MarkdownRenderer';
import { loadSubjects } from '../utils/subjects';
import { getSubjectColors } from './SubjectPicker';

interface SearchViewProps {
  entries: Entry[];
  onNavigate: (tab: 'homework' | 'srs') => void;
}

export function SearchView({ entries, onNavigate }: SearchViewProps) {
  const [subjectFilter, setSubjectFilter] = useState('Все');
  const [typeFilter, setTypeFilter] = useState<'all' | 'dz' | 'gdz' | 'srs'>('all');
  const [showFilters, setShowFilters] = useState(true);
  const [subjectOptions, setSubjectOptions] = useState<{ name: string; emoji: string }[]>([]);

  const load = () => loadSubjects().then(subjs => {
    setSubjectOptions([{ name: 'Все', emoji: '🗂️' }, ...subjs]);
  });

  useEffect(() => {
    load();
    const handler = () => load();
    window.addEventListener('subjects-changed', handler);
    return () => window.removeEventListener('subjects-changed', handler);
  }, []);

  const filtered = entries.filter(e => {
    const matchesSubject = subjectFilter === 'Все' || e.subject === subjectFilter;
    const matchesType = typeFilter === 'all' || e.type === typeFilter;
    return matchesSubject && matchesType;
  });

  const typeLabel = (t: string) => {
    if (t === 'dz') return 'ДЗ';
    if (t === 'gdz') return 'ГДЗ';
    if (t === 'srs') return 'СРС';
    return t;
  };

  const typeConfig: Record<string, { color: string; icon: React.ReactNode; bg: string }> = {
    dz: { color: 'text-blue-700', icon: <BookOpen size={14} />, bg: 'bg-blue-50 border-blue-200' },
    gdz: { color: 'text-green-700', icon: <CheckCircle size={14} />, bg: 'bg-green-50 border-green-200' },
    srs: { color: 'text-purple-700', icon: <ClipboardList size={14} />, bg: 'bg-purple-50 border-purple-200' },
  };

  // Обработка кнопки "назад" на телефоне
  useEffect(() => {
    const handlePopState = () => {
      // Если мы вернулись из детального просмотра, просто остаемся здесь
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleCardClick = (entry: Entry) => {
    const tab = entry.type === 'srs' ? 'srs' : 'homework';
    // Добавляем запись в историю, чтобы кнопка "назад" вернула сюда
    history.pushState({ searchView: true, entryId: entry.id }, '');
    onNavigate(tab);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#0F0F0F] p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Все задания</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            {filtered.length} {filtered.length === 1 ? 'запись' : filtered.length < 5 ? 'записи' : 'записей'}
          </p>
        </header>

      {/* Фильтры */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-6 overflow-hidden">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <SlidersHorizontal size={18} className="text-gray-400 dark:text-gray-500" />
            Фильтры
          </div>
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className={`text-gray-400 dark:text-gray-500 transition-transform ${showFilters ? 'rotate-180' : ''}`}
          >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {showFilters && (
            <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Предмет</label>
                <div className="flex flex-wrap gap-1.5">
                  {subjectOptions.map(s => {
                    const isSelected = subjectFilter === s.name;
                    const colors = s.name === 'Все' ? null : getSubjectColors(s.name);
                    return (
                      <button
                        key={s.name}
                        onClick={() => setSubjectFilter(s.name)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                          isSelected
                            ? s.name === 'Все'
                              ? 'bg-gray-800 text-white border-gray-800 shadow-sm'
                              : `${colors!.solid} text-white ${colors!.border} shadow-sm`
                            : s.name === 'Все'
                              ? 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                              : `${colors!.soft} ${colors!.text} ${colors!.border} hover:opacity-90`
                        }`}
                      >
                        <span>{s.emoji}</span>
                        <span>{s.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Тип</label>
                <div className="flex gap-1.5">
                  {([
                    { key: 'all' as const, label: 'Все' },
                    { key: 'dz' as const, label: 'ДЗ' },
                    { key: 'gdz' as const, label: 'ГДЗ' },
                    { key: 'srs' as const, label: 'СРС' },
                  ]).map(t => (
                    <button
                      key={t.key}
                      onClick={() => setTypeFilter(t.key)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        typeFilter === t.key
                          ? t.key === 'all' ? 'bg-gray-800 text-white' 
                          : t.key === 'dz' ? 'bg-blue-600 text-white' 
                          : t.key === 'gdz' ? 'bg-green-600 text-white' 
                          : 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Результаты */}
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 border-dashed p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <Filter className="text-gray-400 dark:text-gray-500" size={28} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Нет записей</h3>
            <p className="text-gray-500 dark:text-gray-400">По выбранным фильтрам записей не найдено</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(entry => {
              const cfg = typeConfig[entry.type] || typeConfig.dz;
              return (
                <div 
                  key={entry.id} 
                  className={`bg-white dark:bg-gray-800 rounded-xl border p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow ${cfg.bg}`}
                  onClick={() => handleCardClick(entry)}
                >
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold ${cfg.color}`}>
                        {cfg.icon}
                        {typeLabel(entry.type)}
                      </span>
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{entry.subject}</span>
                    </div>
                    <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                      {format(parseISO(entry.date), 'd MMM yyyy', { locale: ru })}
                      {entry.deadline && ` → до ${format(parseISO(entry.deadline), 'd MMM', { locale: ru })}`}
                    </span>
                  </div>
                  {entry.content && (
                    <div className="text-sm leading-relaxed">
                      <MarkdownRenderer content={entry.content} />
                    </div>
                  )}
                  <AttachmentsGallery entry={entry} alt="Вложение" />
                  <EntryLinks links={entry.links} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
