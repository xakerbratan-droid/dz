// Расписание звонков
// Пара длится 1ч 20мин (80 мин), между парами 10 мин перемена
// Длинная перемена 14:20 - 15:00 (между 4 и 5 парой)

export interface PairTime {
  start: string;
  end: string;
}

const SCHEDULE: PairTime[] = [
  { start: '08:30', end: '09:50' }, // 1
  { start: '10:00', end: '11:20' }, // 2
  { start: '11:30', end: '12:50' }, // 3
  { start: '13:00', end: '14:20' }, // 4
  { start: '15:00', end: '16:20' }, // 5 (после длинной перемены)
  { start: '16:30', end: '17:50' }, // 6
  { start: '18:00', end: '19:20' }, // 7
  { start: '19:30', end: '20:50' }, // 8
];

export function getPairTime(period: number): PairTime {
  return SCHEDULE[period - 1] || { start: '--:--', end: '--:--' };
}

export function getPairTimeString(period: number): string {
  const t = getPairTime(period);
  return `${t.start}–${t.end}`;
}
