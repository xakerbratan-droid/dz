import { useState } from 'react';
import { Settings, BookOpen, Calendar as CalendarIcon, Plus, Trash2, Edit2, Save, X, RotateCcw } from 'lucide-react';
import { SubjectInfo } from '../utils/subjects';
import { useCustomSubjects } from '../hooks/useCustomSubjects';

const COLOR_OPTIONS = [
  { name: 'Красный', value: 'red' },
  { name: 'Синий', value: 'blue' },
  { name: 'Голубой', value: 'sky' },
  { name: 'Индиго', value: 'indigo' },
  { name: 'Фиолетовый', value: 'purple' },
  { name: 'Фиолетовый 2', value: 'violet' },
  { name: 'Изумрудный', value: 'emerald' },
  { name: 'Янтарный', value: 'amber' },
  { name: 'Бирюзовый', value: 'teal' },
  { name: 'Розовый', value: 'rose' },
  { name: 'Лайм', value: 'lime' },
  { name: 'Розовый 2', value: 'pink' },
  { name: 'Камень', value: 'stone' },
  { name: 'Циан', value: 'cyan' },
  { name: 'Оранжевый', value: 'orange' },
];

type Tab = 'subjects' | 'schedule';

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('subjects');
  const { subjects, isLoaded, addSubject, updateSubject, deleteSubject, resetToDefaults } = useCustomSubjects();

  const [isAdding, setIsAdding] = useState(false);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [formData, setFormData] = useState<SubjectInfo>({ name: '', emoji: '📝', color: 'blue' });

  const handleAdd = () => {
    if (!formData.name.trim()) return;
    addSubject(formData);
    setFormData({ name: '', emoji: '📝', color: 'blue' });
    setIsAdding(false);
    window.dispatchEvent(new CustomEvent('subjects-changed'));
  };

  const handleUpdate = (oldName: string) => {
    if (!formData.name.trim()) return;
    updateSubject(oldName, formData);
    setEditingName(null);
    setFormData({ name: '', emoji: '📝', color: 'blue' });
    window.dispatchEvent(new CustomEvent('subjects-changed'));
  };

  const handleDelete = (name: string) => {
    deleteSubject(name);
    window.dispatchEvent(new CustomEvent('subjects-changed'));
  };

  const handleReset = () => {
    resetToDefaults();
    window.dispatchEvent(new CustomEvent('subjects-changed'));
  };

  const startEdit = (s: SubjectInfo) => {
    setEditingName(s.name);
    setFormData(s);
    setIsAdding(false);
  };

  const cancelEdit = () => {
    setEditingName(null);
    setIsAdding(false);
    setFormData({ name: '', emoji: '📝', color: 'blue' });
  };

  if (!isLoaded) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[70]" onClick={onClose}>
      <div
        className="bg-white dark:bg-[#171717] rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b dark:border-[#333333] shrink-0">
          <div className="flex items-center gap-2">
            <Settings className="text-gray-500 dark:text-gray-400" size={22} />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Настройки</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#222222] rounded-full text-gray-500 dark:text-gray-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b dark:border-[#333333] shrink-0">
          <button
            onClick={() => setActiveTab('subjects')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
              activeTab === 'subjects'
                ? 'border-b-2 border-indigo-600 dark:border-emerald-500 text-indigo-600 dark:text-emerald-400'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <BookOpen size={16} />
            Предметы
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
              activeTab === 'schedule'
                ? 'border-b-2 border-indigo-600 dark:border-emerald-500 text-indigo-600 dark:text-emerald-400'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <CalendarIcon size={16} />
            Расписание
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'subjects' ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Управляйте списком предметов.
              </p>

              {!isAdding && !editingName && (
                <button
                  onClick={() => setIsAdding(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 border-dashed border-indigo-200 dark:border-emerald-800 text-indigo-600 dark:text-emerald-400 hover:bg-indigo-50 dark:hover:bg-emerald-900/20 text-sm font-medium transition-colors"
                >
                  <Plus size={16} />
                  Добавить предмет
                </button>
              )}

              {(isAdding || editingName) && (
                <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-xl border dark:border-[#333333] p-4 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Название</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 dark:border-[#404040] dark:bg-[#222222] dark:text-white p-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Эмодзи</label>
                    <input
                      type="text"
                      value={formData.emoji}
                      onChange={e => setFormData({ ...formData, emoji: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 dark:border-[#404040] dark:bg-[#222222] dark:text-white p-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Цвет</label>
                    <div className="flex flex-wrap gap-1.5">
                      {COLOR_OPTIONS.map(c => (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, color: c.value })}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border ${
                            formData.color === c.value
                              ? `bg-${c.value}-600 text-white border-${c.value}-700`
                              : 'bg-gray-100 dark:bg-[#222222] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-[#333333] hover:bg-gray-200 dark:hover:bg-[#2A2A2A]'
                          }`}
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button onClick={cancelEdit} className="flex-1 py-2 rounded-lg border border-gray-300 dark:border-[#404040] text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-[#222222]">Отмена</button>
                    <button onClick={() => editingName ? handleUpdate(editingName) : handleAdd()} className="flex-1 py-2 rounded-lg bg-indigo-600 dark:bg-emerald-600 text-white text-sm font-medium hover:bg-indigo-700 dark:hover:bg-emerald-700 flex items-center justify-center gap-1">
                      <Save size={14} />
                      Сохранить
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {subjects.map(s => (
                  <div key={s.name} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-[#1A1A1A] border dark:border-[#333333]">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{s.emoji}</span>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{s.name}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => startEdit(s)} className="p-1.5 hover:bg-gray-200 dark:hover:bg-[#2A2A2A] rounded-md text-gray-400 hover:text-gray-600"><Edit2 size={14} /></button>
                      <button onClick={() => handleDelete(s.name)} className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={handleReset} className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-gray-300 dark:border-[#404040] text-gray-500 dark:text-gray-400 text-sm hover:bg-gray-50 dark:hover:bg-[#222222] transition-colors">
                <RotateCcw size={14} />
                Сбросить к стандартному списку
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <CalendarIcon className="text-gray-400 dark:text-gray-500 mx-auto mb-3" size={48} />
              <p className="text-sm text-gray-500 dark:text-gray-400 px-4">Для настройки расписания перейдите во вкладку «Расписание» и нажмите кнопку «Настроить».</p>
              <button onClick={onClose} className="mt-4 px-6 py-2 rounded-lg bg-indigo-600 dark:bg-emerald-600 text-white text-sm font-medium">Закрыть</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
