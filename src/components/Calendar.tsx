import { useState } from 'react';
import { format, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Entry } from '../types';

interface CalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  entries: Entry[];
}

export function Calendar({ selectedDate, onSelectDate, entries }: CalendarProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(selectedDate, { weekStartsOn: 1 }));

  const nextWeek = () => setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  const prevWeek = () => setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  const today = () => {
    const now = new Date();
    setCurrentWeekStart(startOfWeek(now, { weekStartsOn: 1 }));
    onSelectDate(now);
  };

  const days = eachDayOfInterval({
    start: currentWeekStart,
    end: endOfWeek(currentWeekStart, { weekStartsOn: 1 })
  });

  const getDayDotColors = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayEntries = entries.filter(e => e.date === dateStr && e.type !== 'srs');
    const hasDz = dayEntries.some(e => e.type === 'dz');
    const hasGdz = dayEntries.some(e => e.type === 'gdz');

    return { hasDz, hasGdz };
  };

  return (
    <div className="bg-white dark:bg-[#1A1A1A] border-b md:border-b-0 md:border-r border-gray-200 dark:border-[#333333] w-full md:w-80 flex-shrink-0 flex flex-col notranslate" translate="no">
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200 font-semibold">
          <CalendarIcon size={20} className="text-blue-600" />
          <span>Календарь</span>
        </div>
        <button
          onClick={today}
          className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:hover:text-blue-400 transition-colors bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded"
        >
          Сегодня
        </button>
      </div>

      <div className="p-4 flex-1">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-medium text-gray-700 dark:text-gray-300 capitalize">
            {format(currentWeekStart, 'LLLL yyyy', { locale: ru })}
          </h2>
          <div className="flex gap-1">
            <button onClick={prevWeek} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-400">
              <ChevronLeft size={18} />
            </button>
            <button onClick={nextWeek} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-400">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-400 dark:text-gray-500 py-1">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const isSelected = isSameDay(day, selectedDate);
            const isTodayDate = isSameDay(day, new Date());
            const { hasDz, hasGdz } = getDayDotColors(day);

            return (
              <button
                key={day.toISOString()}
                onClick={() => onSelectDate(day)}
                className={`
                  flex flex-col items-center justify-center p-2 rounded-lg aspect-square relative
                  transition-all duration-200 ease-in-out
                  ${isSelected ? 'bg-blue-600 text-white shadow-md transform scale-105' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}
                  ${isTodayDate && !isSelected ? 'ring-2 ring-blue-500 ring-inset font-bold' : ''}
                `}
              >
                <span className="text-sm">{format(day, 'd')}</span>

                <div className="flex gap-0.5 mt-1 absolute bottom-1.5">
                  {hasDz && <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-500'}`} />}
                  {hasGdz && <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white/80' : 'bg-green-500'}`} />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
