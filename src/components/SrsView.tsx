import { useState } from 'react';
import { Entry } from '../types';
import { format, parseISO, isPast, isToday, differenceInDays, differenceInHours } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ClipboardList, Trash2, AlertTriangle, CheckCircle, Clock, Plus, Archive, ListTodo, Edit2 } from 'lucide-react';
import { AttachmentsGallery } from './AttachmentsGallery';
import { EntryLinks } from './EntryLinks';
import { MarkdownRenderer } from './MarkdownRenderer';

interface SrsViewProps {
  entries: Entry[];
  onDelete: (id: string) => void;
  onEdit: (entry: Entry) => void;
  onAddClick: () => void;
}

type SrsTab = 'active' | 'expired';

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
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Удалить СРС?</h3>
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

// Подробное описание оставшегося времени
function getTimeLeftLabel(deadline: string): string {
  const deadlineDate = parseISO(deadline);
  // конец дня дедлайна — до 23:59
  deadlineDate.setHours(23, 59, 59, 999);
  const now = new Date();
  const days = differenceInDays(deadlineDate, now);
  const hours = differenceInHours(deadlineDate, now);

  if (isToday(parseISO(deadline))) {
    if (hours <= 0) return 'Сдать сегодня';
    return `Осталось ${hours} ч.`;
  }
  if (days === 1) return 'Остался 1 день';
  if (days < 5) return `Осталось ${days} дня`;
  if (days < 21) return `Осталось ${days} дней`;
  // Через неделю/больше — округляем
  const weeks = Math.round(days / 7);
  if (weeks === 1) return 'Через неделю';
  if (weeks < 5) return `Через ${weeks} недели`;
  return `Через ${weeks} недель`;
}

// Просрочка: на сколько дней
function getOverdueLabel(deadline: string): string {
  const deadlineDate = parseISO(deadline);
  const days = differenceInDays(new Date(), deadlineDate);
  if (days === 0) return 'Срок сегодня истёк';
  if (days === 1) return 'Просрочено на 1 день';
  if (days < 5) return `Просрочено на ${days} дня`;
  return `Просрочено на ${days} дней`;
}

function SrsCard({
  entry,
  isExpired,
  onDelete,
  onEdit,
}: {
  entry: Entry;
  isExpired: boolean;
  onDelete: (id: string, subject: string) => void;
  onEdit: (entry: Entry) => void;
}) {
  const deadlineDate = parseISO(entry.deadline!);
  const isUrgent = !isExpired && (isToday(deadlineDate) || differenceInDays(deadlineDate, new Date()) <= 2);

  const statusBadgeClass = isExpired
    ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
    : isUrgent
    ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800'
    : 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800';

  const StatusIcon = isExpired ? AlertTriangle : isUrgent ? Clock : CheckCircle;

  const borderClass = isExpired
    ? 'border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-900/10'
    : isUrgent
    ? 'border-orange-200 dark:border-orange-800'
    : 'border-purple-100 dark:border-purple-800';

  return (
    <div className={`bg-white rounded-xl shadow-sm border p-4 sm:p-5 relative ${borderClass}`}>
      <div className="flex justify-between items-start mb-3 gap-2">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            {entry.subject}
          </span>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${statusBadgeClass}`}>
            <StatusIcon size={12} />
            {isExpired ? getOverdueLabel(entry.deadline!) : getTimeLeftLabel(entry.deadline!)}
          </span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => onEdit(entry)}
            className="text-blue-400 hover:text-blue-600 hover:bg-blue-50 p-1.5 rounded-md transition-colors"
            title="Редактировать"
            aria-label="Редактировать запись"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={() => onDelete(entry.id, entry.subject)}
            className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-md transition-colors flex-shrink-0"
            title="Удалить"
            aria-label="Удалить запись"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="text-xs text-gray-500 mb-2">
        Сдать до: <span className="font-medium text-gray-700">{format(deadlineDate, 'd MMMM yyyy', { locale: ru })}</span>
      </div>

      {entry.content && (
        <div className="mb-3">
          <MarkdownRenderer content={entry.content} />
        </div>
      )}

      <AttachmentsGallery entry={entry} alt="Вложение" />
      <EntryLinks links={entry.links} />
    </div>
  );
}

export function SrsView({ entries, onDelete, onEdit, onAddClick }: SrsViewProps) {
  const [pendingDelete, setPendingDelete] = useState<{ id: string; subject: string } | null>(null);
  const [activeTab, setActiveTab] = useState<SrsTab>('active');

  const srsEntries = entries.filter(e => e.type === 'srs' && e.deadline);

  // Активные — срок ещё не истёк (сегодня тоже считается активным)
  const activeEntries = srsEntries
    .filter(e => {
      const d = parseISO(e.deadline!);
      return isToday(d) || !isPast(d);
    })
    .sort((a, b) => (a.deadline || '').localeCompare(b.deadline || ''));

  // Просроченные — срок уже истёк
  const expiredEntries = srsEntries
    .filter(e => {
      const d = parseISO(e.deadline!);
      return isPast(d) && !isToday(d);
    })
    .sort((a, b) => (b.deadline || '').localeCompare(a.deadline || ''));

  const displayEntries = activeTab === 'active' ? activeEntries : expiredEntries;

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
        <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ClipboardList className="text-purple-600" size={28} />
              Самостоятельные работы
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm sm:text-base">
              Отслеживай дедлайны и не забывай сдавать вовремя
            </p>
          </div>
          <button
            onClick={() => onAddClick()}
            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm transition-colors flex items-center justify-center gap-2 whitespace-nowrap text-sm"
          >
            <Plus size={18} />
            Добавить СРС
          </button>
        </header>

        {/* Вкладки: Активные / Просроченные */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1 rounded-xl flex gap-1 mb-6 shadow-sm">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'active'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <ListTodo size={16} />
            Актуальные
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              activeTab === 'active' ? 'bg-white/20 text-white' : 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'
            }`}>
              {activeEntries.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('expired')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'expired'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Archive size={16} />
            Просроченные
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              activeTab === 'expired' ? 'bg-white/20 text-white' : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
            }`}>
              {expiredEntries.length}
            </span>
          </button>
        </div>

        {displayEntries.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 border-dashed p-12 text-center">
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              activeTab === 'active' ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-red-100 dark:bg-red-900/30'
            }`}>
              {activeTab === 'active' ? (
                <CheckCircle className="text-purple-400" size={28} />
              ) : (
                <Archive className="text-red-400" size={28} />
              )}
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
              {activeTab === 'active' ? 'Нет актуальных работ' : 'Нет просроченных работ'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {activeTab === 'active'
                ? 'Все самостоятельные работы выполнены или ещё не добавлены.'
                : 'Отлично! Ты ничего не просрочил 🎉'}
            </p>
            {activeTab === 'active' && (
              <button
                onClick={() => onAddClick()}
                className="text-purple-600 dark:text-purple-400 font-medium hover:text-purple-700"
              >
                Добавить СРС
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {displayEntries.map(entry => (
              <SrsCard
                key={entry.id}
                entry={entry}
                isExpired={activeTab === 'expired'}
                onDelete={handleDelete}
                onEdit={onEdit}
              />
            ))}
          </div>
        )}
      </div>

      {/* Confirm dialog */}
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
