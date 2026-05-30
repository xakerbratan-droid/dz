import { supabase } from '../lib/supabase';

export interface ScheduleItem {
  id: string;
  dayOfWeek: number;
  period: number;
  subject: string;
  weekType: 'numerator' | 'denominator';
}

const DB_TABLE = 'schedule';

export async function loadSchedule(): Promise<ScheduleItem[]> {
  try {
    const { data, error } = await supabase
      .from(DB_TABLE)
      .select('*')
      .order('day_of_week', { ascending: true })
      .order('period', { ascending: true });

    if (error) throw error;

    if (data && data.length > 0) {
      return data.map(row => ({
        id: row.id,
        dayOfWeek: row.day_of_week,
        period: row.period,
        subject: row.subject,
        weekType: row.week_type,
      }));
    }

    return [];
  } catch (e) {
    console.error('Ошибка загрузки расписания:', e);
    return [];
  }
}

export async function saveSchedule(items: ScheduleItem[]): Promise<void> {
  try {
    // Удаляем все старые записи
    const { error: deleteError } = await supabase
      .from(DB_TABLE)
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (deleteError) throw deleteError;

    // Вставляем новые
    if (items.length > 0) {
      const rows = items.map(item => ({
        id: item.id || crypto.randomUUID(),
        day_of_week: item.dayOfWeek,
        period: item.period,
        subject: item.subject,
        week_type: item.weekType,
      }));

      const { error: insertError } = await supabase
        .from(DB_TABLE)
        .insert(rows);

      if (insertError) throw insertError;
    }
  } catch (e) {
    console.error('Ошибка сохранения расписания:', e);
    throw e;
  }
}

export async function addScheduleItem(item: Omit<ScheduleItem, 'id'>): Promise<ScheduleItem> {
  const id = crypto.randomUUID();

  const { error } = await supabase
    .from(DB_TABLE)
    .insert({
      id,
      day_of_week: item.dayOfWeek,
      period: item.period,
      subject: item.subject,
      week_type: item.weekType,
    });

  if (error) throw error;

  return { id, ...item };
}

export async function deleteScheduleItem(id: string): Promise<void> {
  const { error } = await supabase
    .from(DB_TABLE)
    .delete()
    .eq('id', id);

  if (error) throw error;
}
