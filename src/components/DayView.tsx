import { useState } from 'react';
import { Entry } from '../types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { BookOpen, CheckCircle, Trash2, ChevronDown, Plus, FileText, Sparkles, AlertTriangle, Edit2 } from 'lucide-react';
import { AttachmentsGallery } from './AttachmentsGallery';
import { EntryLinks } from './EntryLinks';
import { MarkdownRenderer } from './MarkdownRenderer';

interface DayViewProps {
  date: Date;
  entries: Entry[];
  onDelete: (id: string) => void;
  onEdit: (entry: Entry) => void;
  onAddClick: (preset?: { type: 'dz' | 'gdz'; subject: string }) => void;
}

function DeleteConfirmDialog({
  subject,
  onConfirm,
  onCancel,
}: {
  subject: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[60]" onClick={onCancel}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-xs p-6 text-center" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="text-red-500" size={28} />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Удалить запись?</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Запись по предмету «{subject}» будет удалена безвозвратно.</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
}

function EntryCard({
  entry,
  onDelete,
  onEdit,
  hasGdz,
  relatedGdz,
  isExpanded,
  onToggleExpand,
  onAddGdz,
}: {
  entry: Entry;
  onDelete: (id: string) => void;
  onEdit: (entry: Entry) => void;
  hasGdz: boolean;
  relatedGdz: Entry[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onAddGdz: () => void;
}) {
  return (
    <div className="rounded-xl overflow-hidden transition-all duration-300">
      <div
        onClick={onToggleExpand}
        className={`
          bg-white dark:bg-gray-800 shadow-sm border p-4 sm:p-5 cursor-pointer relative
          transition-all duration-200 select-none
          ${isExpanded
            ? 'border-blue-300 dark:border-blue-600 ring-2 ring-blue-100 dark:ring-blue-900/50 rounded-t-xl rounded-b-none'
            : 'border-blue-100 dark:border-blue-900/50 rounded-xl hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md'
          }
        `}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
              {entry.subject}
            </span>
            {hasGdz ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300">
                <CheckCircle size={12} />
                ГДЗ ({relatedGdz.length})
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-300">
                <Sparkles size={12} />
                Нет решения
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }}
              className="text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 p-1.5 rounded-md transition-colors"
              title="Удалить"
            >
              <Trash2 size={18} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(entry); }}
              className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 p-1.5 rounded-md transition-colors"
              title="Редактировать"
            >
              <Edit2 size={18} />
            </button>
            <div className={`text-blue-400 dark:text-blue-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
              <ChevronDown size={18} />
            </div>
          </div>
        </div>
        {entry.content && (
          <MarkdownRenderer content={entry.content} />
        )}
        <AttachmentsGallery entry={entry} alt="Приложение" />
        <EntryLinks links={entry.links} />
        <div className="mt-3 text-xs text-blue-500 dark:text-blue-400 font-medium flex items-center gap-1">
          {hasGdz
            ? (isExpanded ? 'Скрыть решение' : 'Нажмите, чтобы посмотреть решение')
            : (isExpanded ? 'Скрыть' : 'Нажмите, чтобы добавить решение')
          }
        </div>
      </div>

      <div
        className={`
          overflow-hidden transition-all duration-500 ease-in-out
          ${isExpanded ? 'max-h-[999999px] opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="bg-green-50 dark:bg-green-900/20 border border-t-0 border-green-200 dark:border-green-800 rounded-b-xl p-4 space-y-3">
          {hasGdz ? (
            <>
              <div className="flex items-center gap-2 text-green-700 dark:text-green-300 font-medium text-sm mb-3">
                <CheckCircle size={16} />
                {relatedGdz.length === 1 ? 'Готовое решение' : `Готовые решения (${relatedGdz.length})`}
              </div>
              {relatedGdz.map(gdz => (
                <div key={gdz.id} className="bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-800 p-4 relative group/gdz">
                  <div className="flex gap-1 absolute top-2 right-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); onEdit(gdz); }}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-blue-500 rounded-md transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(gdz.id); }}
                      className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-400 hover:text-red-600 rounded-md transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  {gdz.content && (
                    <div className="pr-16">
                      <MarkdownRenderer content={gdz.content} />
                    </div>
                  )}
                  <AttachmentsGallery entry={gdz} alt="Решение" />
                  <EntryLinks links={gdz.links} />
                </div>
              ))}
              <button
                onClick={() => onAddGdz()}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border-2 border-dashed border-green-300 dark:border-green-700 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-sm font-medium"
              >
                <Plus size={16} />
                Добавить ещё решение
              </button>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-3">
                <FileText className="text-green-500" size={22} />
              </div>
              <p className="text-green-700 dark:text-green-400 font-medium mb-1">Решение ещё не добавлено</p>
              <p className="text-green-600/70 dark:text-green-500/70 text-sm mb-4">Вы можете добавить готовое решение для этого задания</p>
              <button
                onClick={() => onAddGdz()}
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-medium transition-colors text-sm"
              >
                <Plus size={16} />
                Добавить ГДЗ
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function DayView({ date, entries, onDelete, onEdit, onAddClick }: DayViewProps) {
  const [expandedDzIds, setExpandedDzIds] = useState<Set<string>>(new Set());
  const [pendingDelete, setPendingDelete] = useState<{ id: string; subject: string } | null>(null);
  const dateStr = format(date, 'yyyy-MM-dd');
  const dayEntries = entries.filter((e) => e.date === dateStr && e.type !== 'srs');

  const dzEntries = dayEntries.filter((e) => e.type === 'dz');
  const gdzEntries = dayEntries.filter((e) => e.type === 'gdz');

  const dzSubjects = new Set(dzEntries.map(e => e.subject));
  const orphanGdz = gdzEntries.filter(e => !dzSubjects.has(e.subject));

  const toggleExpand = (id: string) => {
    setExpandedDzIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getGdzForDz = (dzEntry: Entry) => {
    return gdzEntries.filter(g => g.subject === dzEntry.subject);
  };

  const handleDelete = (id: string, subject: string) => {
    setPendingDelete({ id, subject });
  };

  const confirmDelete = () => {
    if (pendingDelete) {
      onDelete(pendingDelete.id);
      setPendingDelete(null);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#0F0F0F] p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <header className="mb-6 sm:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white capitalize">
              {format(date, 'EEEE', { locale: ru })}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm sm:text-base">
              {format(date, 'd MMMM yyyy', { locale: ru })}
            </p>
          </div>
          <button
            onClick={() => onAddClick()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm transition-colors flex items-center justify-center gap-2 whitespace-nowrap text-sm"
          >
            <Plus size={18} />
            Добавить
          </button>
        </header>

        {dayEntries.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 border-dashed p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="text-gray-400" size={28} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Нет записей</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">На этот день ничего не задано.</p>
            <button
              onClick={() => onAddClick()}
              className="text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700"
            >
              Добавить запись
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {dzEntries.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                  <BookOpen className="text-blue-500" size={20} />
                  Домашнее задание ({dzEntries.length})
                </h2>
                <div className="space-y-3">
                  {dzEntries.map(dzEntry => {
                    const relatedGdz = getGdzForDz(dzEntry);
                    const isExpanded = expandedDzIds.has(dzEntry.id);
                    const hasGdz = relatedGdz.length > 0;

                    return (
                      <EntryCard
                        key={dzEntry.id}
                        entry={dzEntry}
                        onDelete={(id) => handleDelete(id, dzEntry.subject)}
                        onEdit={(entry) => onEdit(entry)}
                        hasGdz={hasGdz}
                        relatedGdz={relatedGdz}
                        isExpanded={isExpanded}
                        onToggleExpand={() => toggleExpand(dzEntry.id)}
                        onAddGdz={() => onAddClick({ type: 'gdz', subject: dzEntry.subject })}
                      />
                    );
                  })}
                </div>
              </section>
            )}

            {orphanGdz.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                  <CheckCircle className="text-green-500" size={20} />
                  Решения без задания ({orphanGdz.length})
                </h2>
                <div className="grid gap-3">
                  {orphanGdz.map(entry => (
                    <div key={entry.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-green-100 dark:border-green-900/40 p-4 sm:p-5 relative">
                      <div className="flex justify-between items-start mb-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300">
                          {entry.subject}
                        </span>
                        <div className="flex gap-1 flex-shrink-0 ml-2">
                          <button
                            onClick={() => onEdit(entry)}
                            className="text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 p-1.5 rounded-md transition-colors"
                            title="Редактировать"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(entry.id, entry.subject)}
                            className="text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 p-1.5 rounded-md transition-colors"
                            title="Удалить"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                      {entry.content && (
                        <MarkdownRenderer content={entry.content} />
                      )}
                      <AttachmentsGallery entry={entry} alt="Решение" />
                      <EntryLinks links={entry.links} />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      {pendingDelete && (
        <DeleteConfirmDialog
          subject={pendingDelete.subject}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
