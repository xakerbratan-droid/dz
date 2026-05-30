import { useState, useEffect } from 'react';
import { format, addDays, startOfWeek, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Settings, X, Trash2 } from 'lucide-react';
import { loadSchedule, saveSchedule } from '../hooks/scheduleStore';
import { SubjectPicker, getSubjectColors } from './SubjectPicker';
import { getSubject } from '../utils/subjects';
import { getPairTimeString, getPairTime } from '../utils/pairTimes';

export interface ScheduleItem {
  id: string;
  dayOfWeek: number; // 1=Пн ... 6=Сб
  period: number;
  subject: string;
  weekType: 'numerator' | 'denominator';
}

const DAY_NAMES = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const DAY_NAMES_FULL = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

function getWeekType(date: Date): 'numerator' | 'denominator' {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const diff = Math.floor((date.getTime() - startOfYear.getTime()) / (7 * 24 * 60 * 60 * 1000));
  return diff % 2 === 0 ? 'numerator' : 'denominator';
}

interface ScheduleViewProps {
  today: Date;
}

export function ScheduleView({ today }: ScheduleViewProps) {
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentWeek, setCurrentWeek] = useState<Date>(startOfWeek(today, { weekStartsOn: 1 }));
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    loadSchedule().then(data => {
      setItems(data as ScheduleItem[]);
      setIsLoaded(true);
    });
  }, []);

  const weekType = getWeekType(currentWeek);
  const weekDays = Array.from({ length: 6 }, (_, i) => addDays(currentWeek, i));

  const getItemsForDay = (dayOfWeek: number) =>
    items.filter(i => i.dayOfWeek === dayOfWeek && i.weekType === weekType).sort((a, b) => a.period - b.period);

  const handleSaveItems = (newItems: ScheduleItem[]) => {
    setItems(newItems);
    saveSchedule(newItems);
  };

  const nextWeek = () => setCurrentWeek(addWeeks(currentWeek, 1));
  const prevWeek = () => setCurrentWeek(subWeeks(currentWeek, 1));
  const goToday = () => setCurrentWeek(startOfWeek(today, { weekStartsOn: 1 }));

  const isCurrentWeek = isSameDay(currentWeek, startOfWeek(today, { weekStartsOn: 1 }));

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#0F0F0F] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="text-indigo-600" size={28} />
            Расписание
          </h1>
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors shadow-sm"
          >
            <Settings size={16} />
            Настроить
          </button>
        </header>

        {/* Навигация */}
        <div className="bg-white dark:bg-[#171717] rounded-xl border border-gray-200 dark:border-[#333333] p-3 mb-6 flex items-center justify-between">
          <button onClick={prevWeek} className="p-2 hover:bg-gray-100 dark:hover:bg-[#222222] rounded-lg transition-colors">
            <ChevronLeft size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
          <div className="text-center">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              {format(weekDays[0], 'd', { locale: ru })}–{format(weekDays[5], 'd MMMM', { locale: ru })}
            </h2>
            {!isCurrentWeek && (
              <button onClick={goToday} className="text-xs text-indigo-600 dark:text-emerald-400 hover:text-indigo-800 dark:hover:text-emerald-300 font-medium">
                ← Сегодня
              </button>
            )}
          </div>
          <button onClick={nextWeek} className="p-2 hover:bg-gray-100 dark:hover:bg-[#222222] rounded-lg transition-colors">
            <ChevronRight size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Сетка дней */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {weekDays.map((day, idx) => {
            const dayNum = idx + 1;
            const isToday = isSameDay(day, today);
            const dayItems = getItemsForDay(dayNum);

            return (
              <div
                key={day.toISOString()}
                className={`rounded-xl border p-3 ${
                  isToday
                    ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-100 dark:bg-emerald-950/30 dark:border-emerald-800 dark:ring-emerald-900/60'
                    : 'bg-white border-gray-200 dark:bg-[#171717] dark:border-[#333333]'
                }`}
              >
                <div className="flex items-center justify-between mb-3 px-1">
                  <div>
                    <p className={`font-semibold text-sm ${isToday ? 'text-indigo-700 dark:text-emerald-300' : 'text-gray-800 dark:text-gray-200'}`}>
                      {DAY_NAMES_FULL[idx]}
                    </p>
                    <p className={`text-xs ${isToday ? 'text-indigo-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}>
                      {format(day, 'd MMMM', { locale: ru })}
                    </p>
                  </div>
                  {isToday && (
                    <span className="text-xs font-medium bg-indigo-600 dark:bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                      Сегодня
                    </span>
                  )}
                </div>

                {dayItems.length === 0 ? (
                  <p className="text-xs text-gray-400 italic px-2 py-3">Нет занятий</p>
                ) : (
                  <div className="space-y-1.5">
                    {dayItems.map(item => {
                      const subj = getSubject(item.subject);
                      const colors = getSubjectColors(item.subject);
                      return (
                        <div
                          key={item.id}
                          className={`flex items-center gap-2 p-2 rounded-lg ${colors.soft} ${colors.border} border`}
                        >
                          <div className="flex flex-col items-center justify-center w-9 flex-shrink-0">
                            <span className={`text-xs font-bold ${colors.text}`}>{item.period}</span>
                            <span className="text-[9px] text-gray-500 font-mono leading-tight">
                              {getPairTime(item.period).start}
                            </span>
                          </div>
                          <div className="text-lg flex-shrink-0">{subj.emoji}</div>
                          <div className="min-w-0 flex-1">
                            <p className={`text-xs font-semibold leading-tight ${colors.text}`}>{subj.name}</p>
                            <p className="text-[10px] text-gray-500 font-mono">
                              {getPairTimeString(item.period)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {showSettings && (
          <ScheduleSettingsModal
            items={items}
            weekType={weekType}
            onSave={handleSaveItems}
            onClose={() => setShowSettings(false)}
          />
        )}
      </div>
    </div>
  );
}

function ScheduleSettingsModal({
  items, weekType, onSave, onClose
}: {
  items: ScheduleItem[];
  weekType: 'numerator' | 'denominator';
  onSave: (items: ScheduleItem[]) => void;
  onClose: () => void;
}) {
  const [activeDay, setActiveDay] = useState(1);
  const [localItems, setLocalItems] = useState(items);

  const update = (newItems: ScheduleItem[]) => {
    setLocalItems(newItems);
    onSave(newItems);
  };

  const dayItems = localItems
    .filter(i => i.weekType === weekType && i.dayOfWeek === activeDay)
    .sort((a, b) => a.period - b.period);

  const getItemForPeriod = (period: number) =>
    dayItems.find(i => i.period === period);

  const setPeriodSubject = (period: number, subject: string | null) => {
    const existing = getItemForPeriod(period);
    let updated: ScheduleItem[];
    if (existing) {
      if (!subject) {
        updated = localItems.filter(i => i.id !== existing.id);
      } else {
        updated = localItems.map(i => i.id === existing.id ? { ...i, subject } : i);
      }
    } else if (subject) {
      const newItem: ScheduleItem = {
        id: crypto.randomUUID(),
        dayOfWeek: activeDay,
        period,
        subject,
        weekType,
      };
      updated = [...localItems, newItem];
    } else {
      updated = localItems;
    }
    update(updated);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center sm:p-4 z-50" onClick={onClose}>
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[95vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Шапка */}
        <div className="p-4 border-b shrink-0">
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-3 sm:hidden" />
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Настройка расписания</h3>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Дни недели — табы */}
        <div className="px-3 py-2 border-b shrink-0 overflow-x-auto">
          <div className="flex gap-1">
            {DAY_NAMES.map((d, i) => {
              const dayNum = i + 1;
              const count = localItems.filter(it => it.weekType === weekType && it.dayOfWeek === dayNum).length;
              const isActive = activeDay === dayNum;
              return (
                <button
                  key={dayNum}
                  onClick={() => setActiveDay(dayNum)}
                  className={`flex flex-col items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors min-w-[48px] ${
                    isActive ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>{d}</span>
                  {count > 0 && (
                    <span className={`text-[10px] font-bold mt-0.5 ${isActive ? 'text-indigo-100' : 'text-gray-400'}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Список пар */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <p className="text-xs text-gray-500 px-1 mb-1">
            Выберите предметы для каждой пары. Пустые слоты можно пропустить.
          </p>
          {PERIODS.map(period => {
            const item = getItemForPeriod(period);

            return (
              <PairSlot
                key={period}
                period={period}
                item={item}
                onSet={(subject) => setPeriodSubject(period, subject)}
                onClear={() => setPeriodSubject(period, null)}
              />
            );
          })}
        </div>

        <div className="p-3 border-t shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
}

function PairSlot({
  period,
  item,
  onSet,
  onClear
}: {
  period: number;
  item?: ScheduleItem;
  onSet: (subject: string) => void;
  onClear: () => void;
}) {
  const time = getPairTimeString(period);
  const colors = item ? getSubjectColors(item.subject) : null;

  return (
    <div className={`rounded-xl border p-2.5 flex items-center gap-3 ${
      item ? `${colors!.soft} ${colors!.border}` : 'bg-gray-50 border-gray-200 border-dashed'
    }`}>
      {/* Номер пары + время */}
      <div className={`flex flex-col items-center justify-center w-14 flex-shrink-0 ${item ? colors!.text : 'text-gray-400'}`}>
        <span className="text-lg font-bold leading-none">{period}</span>
        <span className="text-[10px] font-mono leading-tight mt-0.5">{time.split('–')[0]}</span>
        <span className="text-[10px] font-mono leading-tight text-gray-400">{time.split('–')[1]}</span>
      </div>

      {/* Предмет */}
      <div className="flex-1 min-w-0">
        <SubjectPicker
          value={item?.subject || ''}
          onChange={onSet}
          placeholder={item ? undefined : "Добавить пару"}
        />
      </div>

      {/* Удалить */}
      {item && (
        <button
          onClick={(e) => { e.stopPropagation(); onClear(); }}
          className="p-1.5 hover:bg-red-100 rounded-md text-gray-400 hover:text-red-500 flex-shrink-0"
          title="Очистить"
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
}
