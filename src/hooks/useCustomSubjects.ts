import { useState, useEffect, useCallback } from 'react';
import { SubjectInfo } from '../utils/subjects';
import { supabase } from '../lib/supabase';

export interface SubjectInfo {
  name: string;
  emoji: string;
  color: string;
}

const DB_TABLE = 'subjects';

export function useCustomSubjects() {
  const [subjects, setSubjects] = useState<SubjectInfo[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFromSupabase();
  }, []);

  const loadFromSupabase = async () => {
    try {
      setError(null);
      const { data, error: fetchError } = await supabase
        .from(DB_TABLE)
        .select('*')
        .order('name', { ascending: true });

      if (fetchError) throw fetchError;

      if (data && data.length > 0) {
        const formatted: SubjectInfo[] = data.map(row => ({
          name: row.name,
          emoji: row.emoji,
          color: row.color,
        }));
        setSubjects(formatted);
      }
    } catch (e) {
      console.error('Ошибка загрузки предметов:', e);
      setError('Не удалось загрузить предметы');
    } finally {
      setIsLoaded(true);
    }
  };

  const saveAllSubjects = useCallback(async (newSubjects: SubjectInfo[]) => {
    try {
      setError(null);
      // Удаляем все старые записи
      const { error: deleteError } = await supabase
        .from(DB_TABLE)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (deleteError) throw deleteError;

      // Вставляем новые
      if (newSubjects.length > 0) {
        const rows = newSubjects.map(s => ({
          id: crypto.randomUUID(),
          name: s.name,
          emoji: s.emoji,
          color: s.color,
        }));

        const { error: insertError } = await supabase
          .from(DB_TABLE)
          .insert(rows);

        if (insertError) throw insertError;
      }

      setSubjects(newSubjects);
    } catch (e) {
      console.error('Ошибка сохранения предметов:', e);
      setError('Не удалось сохранить предметы');
      throw e;
    }
  }, []);

  const addSubject = useCallback(async (subject: SubjectInfo) => {
    try {
      setError(null);
      const { error: insertError } = await supabase
        .from(DB_TABLE)
        .insert({
          id: crypto.randomUUID(),
          name: subject.name,
          emoji: subject.emoji,
          color: subject.color,
        });

      if (insertError) throw insertError;

      setSubjects(prev => [...prev, subject]);
    } catch (e) {
      console.error('Ошибка добавления предмета:', e);
      setError('Не удалось добавить предмет');
      throw e;
    }
  }, []);

  const updateSubject = useCallback(async (oldName: string, updated: SubjectInfo) => {
    try {
      setError(null);
      const { error: updateError } = await supabase
        .from(DB_TABLE)
        .update({
          name: updated.name,
          emoji: updated.emoji,
          color: updated.color,
        })
        .eq('name', oldName);

      if (updateError) throw updateError;

      setSubjects(prev => prev.map(s => s.name === oldName ? updated : s));
    } catch (e) {
      console.error('Ошибка обновления предмета:', e);
      setError('Не удалось обновить предмет');
      throw e;
    }
  }, []);

  const deleteSubject = useCallback(async (name: string) => {
    try {
      setError(null);
      const { error: deleteError } = await supabase
        .from(DB_TABLE)
        .delete()
        .eq('name', name);

      if (deleteError) throw deleteError;

      setSubjects(prev => prev.filter(s => s.name !== name));
    } catch (e) {
      console.error('Ошибка удаления предмета:', e);
      setError('Не удалось удалить предмет');
      throw e;
    }
  }, []);

  const refresh = useCallback(async () => {
    await loadFromSupabase();
  }, []);

  return {
    subjects,
    isLoaded,
    addSubject,
    updateSubject,
    deleteSubject,
    saveAllSubjects,
    refresh,
    error
  };
}
