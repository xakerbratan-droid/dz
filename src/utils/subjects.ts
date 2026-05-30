import { supabase } from '../lib/supabase';

export interface SubjectInfo {
  name: string;
  emoji: string;
  color: string;
}

export const DEFAULT_SUBJECTS_LIST: SubjectInfo[] = [
  { name: 'Русский язык', emoji: '📝', color: 'red' },
  { name: 'Кыргызский язык', emoji: '🇰🇬', color: 'blue' },
  { name: 'Кыргыз адабият', emoji: '📚', color: 'sky' },
  { name: 'Математика', emoji: '➗', color: 'indigo' },
  { name: 'Физика', emoji: '⚛️', color: 'purple' },
  { name: 'Астрономия', emoji: '🌌', color: 'violet' },
  { name: 'Химия', emoji: '🧪', color: 'emerald' },
  { name: 'История', emoji: '🏛️', color: 'amber' },
  { name: 'География', emoji: '🌍', color: 'teal' },
  { name: 'Английский язык', emoji: '🇬🇧', color: 'rose' },
  { name: 'ЧИО (экономика)', emoji: '💰', color: 'lime' },
  { name: 'ЧИО (психология)', emoji: '🧠', color: 'pink' },
  { name: 'НВП', emoji: '🪖', color: 'stone' },
  { name: 'Введение в специальность', emoji: '🎓', color: 'cyan' },
  { name: 'Физ-культура', emoji: '⚽', color: 'orange' },
];

let _cache: SubjectInfo[] | null = null;

export async function loadSubjects(): Promise<SubjectInfo[]> {
  if (_cache) return _cache;

  try {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .order('name');

    if (!error && data && data.length > 0) {
      _cache = data.map(row => ({
        name: row.name,
        emoji: row.emoji,
        color: row.color,
      }));
      return _cache!;
    }
  } catch (e) {
    console.error('Ошибка загрузки предметов:', e);
  }

  _cache = DEFAULT_SUBJECTS_LIST;
  return _cache;
}

export function getSubjectsSync(): SubjectInfo[] {
  return _cache || DEFAULT_SUBJECTS_LIST;
}

export const DEFAULT_SUBJECT_NAMES = DEFAULT_SUBJECTS_LIST.map(s => s.name);

export function getSubject(name: string): SubjectInfo {
  const list = _cache || DEFAULT_SUBJECTS_LIST;
  return list.find(s => s.name === name) || { name, emoji: '📄', color: 'gray' };
}
