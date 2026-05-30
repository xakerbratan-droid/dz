import { useState, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { getSubject, loadSubjects } from '../utils/subjects';
import type { SubjectInfo } from '../utils/subjects';

const COLOR_MAP: Record<string, { soft: string; text: string; border: string; ring: string; solid: string }> = {
  red:     { soft: 'bg-red-100',     text: 'text-red-700',     border: 'border-red-200',     ring: 'ring-red-500',     solid: 'bg-red-600' },
  blue:    { soft: 'bg-blue-100',    text: 'text-blue-700',    border: 'border-blue-200',    ring: 'ring-blue-500',    solid: 'bg-blue-600' },
  sky:     { soft: 'bg-sky-100',     text: 'text-sky-700',     border: 'border-sky-200',     ring: 'ring-sky-500',     solid: 'bg-sky-600' },
  indigo:  { soft: 'bg-indigo-100',  text: 'text-indigo-700',  border: 'border-indigo-200',  ring: 'ring-indigo-500',  solid: 'bg-indigo-600' },
  purple:  { soft: 'bg-purple-100',  text: 'text-purple-700',  border: 'border-purple-200',  ring: 'ring-purple-500',  solid: 'bg-purple-600' },
  violet:  { soft: 'bg-violet-100',  text: 'text-violet-700',  border: 'border-violet-200',  ring: 'ring-violet-500',  solid: 'bg-violet-600' },
  emerald: { soft: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', ring: 'ring-emerald-500', solid: 'bg-emerald-600' },
  amber:   { soft: 'bg-amber-100',   text: 'text-amber-700',   border: 'border-amber-200',   ring: 'ring-amber-500',   solid: 'bg-amber-600' },
  teal:    { soft: 'bg-teal-100',    text: 'text-teal-700',    border: 'border-teal-200',    ring: 'ring-teal-500',    solid: 'bg-teal-600' },
  rose:    { soft: 'bg-rose-100',    text: 'text-rose-700',    border: 'border-rose-200',    ring: 'ring-rose-500',    solid: 'bg-rose-600' },
  lime:    { soft: 'bg-lime-100',    text: 'text-lime-700',    border: 'border-lime-200',    ring: 'ring-lime-500',    solid: 'bg-lime-600' },
  pink:    { soft: 'bg-pink-100',    text: 'text-pink-700',    border: 'border-pink-200',    ring: 'ring-pink-500',    solid: 'bg-pink-600' },
  stone:   { soft: 'bg-stone-100',   text: 'text-stone-700',   border: 'border-stone-200',   ring: 'ring-stone-500',   solid: 'bg-stone-600' },
  cyan:    { soft: 'bg-cyan-100',    text: 'text-cyan-700',    border: 'border-cyan-200',    ring: 'ring-cyan-500',    solid: 'bg-cyan-600' },
  gray:    { soft: 'bg-gray-100',    text: 'text-gray-700',    border: 'border-gray-200',    ring: 'ring-gray-500',    solid: 'bg-gray-600' },
  orange:  { soft: 'bg-orange-100',  text: 'text-orange-700',  border: 'border-orange-200',  ring: 'ring-orange-500',  solid: 'bg-orange-600' },
};

export function getSubjectColors(name: string) {
  const info = getSubject(name);
  return COLOR_MAP[info.color] || COLOR_MAP.gray;
}

interface SubjectPickerProps {
  value: string;
  onChange: (subject: string) => void;
  placeholder?: string;
}

export function SubjectPicker({ value, onChange, placeholder }: SubjectPickerProps) {
  const [open, setOpen] = useState(false);
  const [subjects, setSubjects] = useState<SubjectInfo[]>([]);

  const load = () => loadSubjects().then(setSubjects);

  useEffect(() => {
    load();
    const handler = () => load();
    window.addEventListener('subjects-changed', handler);
    return () => window.removeEventListener('subjects-changed', handler);
  }, []);

  const currentInfo = getSubject(value);
  const currentColors = COLOR_MAP[currentInfo.color] || COLOR_MAP.gray;

  if (subjects.length === 0) {
    return (
      <div className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-[#171717]">
        <span className="text-sm text-gray-400">{placeholder || 'Выбрать предмет'}</span>
        <ChevronDown size={18} className="text-gray-400" />
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border-2 transition-colors ${
          value ? `${currentColors.soft} ${currentColors.border}` : 'bg-white dark:bg-[#171717] border-gray-200 dark:border-gray-600 border-dashed hover:bg-gray-50 dark:hover:bg-[#222222]'
        } hover:opacity-90`}
      >
        <span className="flex items-center gap-2 min-w-0">
          {value ? (
            <>
              <span className="text-xl">{currentInfo.emoji}</span>
              <span className={`text-sm font-semibold truncate ${currentColors.text}`}>{currentInfo.name}</span>
            </>
          ) : (
            <span className="text-sm text-gray-400 font-normal">{placeholder || 'Выбрать предмет'}</span>
          )}
        </span>
        <ChevronDown size={18} className={value ? currentColors.text : 'text-gray-400'} />
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/70 z-[55] flex items-end sm:items-center justify-center sm:p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white dark:bg-[#171717] rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md max-h-[85vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b dark:border-[#333333] shrink-0">
              <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-3 sm:hidden" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center">Выберите предмет</h3>
            </div>

            <div className="overflow-y-auto p-3">
              <div className="grid grid-cols-2 gap-2">
                {subjects.map(subject => {
                  const colors = COLOR_MAP[subject.color] || COLOR_MAP.gray;
                  const isSelected = subject.name === value;
                  return (
                    <button
                      key={subject.name}
                      type="button"
                      onClick={() => {
                        onChange(subject.name);
                        setOpen(false);
                      }}
                      className={`relative flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                        isSelected
                          ? `${colors.soft} ${colors.border} ring-2 ring-offset-1 ${colors.ring} scale-[1.02]`
                          : 'bg-white dark:bg-[#1A1A1A] border-gray-200 dark:border-[#333333] hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      {isSelected && (
                        <div className={`absolute top-1.5 right-1.5 w-5 h-5 rounded-full ${colors.solid} flex items-center justify-center`}>
                          <Check size={12} className="text-white" />
                        </div>
                      )}
                      <span className="text-2xl mb-1">{subject.emoji}</span>
                      <span className={`text-xs font-medium text-center leading-tight ${isSelected ? colors.text : 'text-gray-700 dark:text-gray-300'}`}>
                        {subject.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-3 border-t dark:border-[#333333] shrink-0">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-full py-2.5 rounded-lg bg-gray-100 dark:bg-[#222222] hover:bg-gray-200 dark:hover:bg-[#2A2A2A] text-gray-700 dark:text-gray-300 text-sm font-medium transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
