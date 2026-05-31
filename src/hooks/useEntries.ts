import { useState, useEffect, useCallback } from 'react';
import { Entry } from '../types';
import { supabase } from '../lib/supabase';

const DB_TABLE = 'entries';

export function useEntries() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFromSupabase();
  }, []);

  const loadFromSupabase = async () => {
    try {
      setError(null);
      // Выбираем только нужные поля — без тяжёлых base64 данных
      const { data, error: fetchError } = await supabase
        .from(DB_TABLE)
        .select('id, date, subject, type, content, deadline, image_url, attachments, links, created_at')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      if (data) {
        const formatted: Entry[] = data.map(row => {
          // Очищаем вложения от base64 data если есть url (экономим память)
          const attachments = row.attachments
            ? row.attachments.map((att: any) => ({
                url: att.url,
                // Оставляем data только для legacy записей без url
                data: att.url ? undefined : att.data,
                type: att.type,
                name: att.name,
              }))
            : undefined;

          return {
            id: row.id,
            date: row.date,
            subject: row.subject,
            type: row.type,
            content: row.content,
            deadline: row.deadline || undefined,
            imageUrl: row.image_url || undefined,
            attachments,
            links: row.links || undefined,
            createdAt: new Date(row.created_at).getTime(),
          };
        });
        setEntries(formatted);
      }
    } catch (e) {
      console.error('Ошибка загрузки из Supabase:', e);
      setError('Не удалось загрузить данные');
    } finally {
      setIsLoaded(true);
    }
  };

  const addEntry = useCallback(async (entry: Omit<Entry, 'id' | 'createdAt'>) => {
    const id = crypto.randomUUID();
    const createdAt = Date.now();
    const now = new Date(createdAt).toISOString();

    // Сохраняем только url, не base64
    const cleanAttachments = entry.attachments
      ? entry.attachments.map(att => ({
          url: att.url,
          data: att.url ? undefined : att.data,
          type: att.type,
          name: att.name,
        }))
      : null;

    const dbRow = {
      id,
      date: entry.date,
      subject: entry.subject,
      type: entry.type,
      content: entry.content,
      deadline: entry.deadline || null,
      image_url: entry.imageUrl || null,
      attachments: cleanAttachments,
      links: entry.links || null,
      created_at: now,
      updated_at: now,
    };

    try {
      setError(null);
      const { error: insertError } = await supabase.from(DB_TABLE).insert(dbRow);
      if (insertError) throw insertError;

      const newEntry: Entry = {
        id,
        date: entry.date,
        subject: entry.subject,
        type: entry.type,
        content: entry.content,
        deadline: entry.deadline,
        imageUrl: entry.imageUrl,
        attachments: entry.attachments,
        links: entry.links,
        createdAt,
      };

      setEntries(prev => [newEntry, ...prev]);
    } catch (e) {
      console.error('Ошибка добавления:', e);
      setError('Не удалось добавить запись');
      throw e;
    }
  }, []);

  const updateEntry = useCallback(async (id: string, updates: Partial<Entry>) => {
    const now = new Date().toISOString();
    const dbUpdates: Record<string, any> = { updated_at: now };

    if (updates.date !== undefined) dbUpdates.date = updates.date;
    if (updates.subject !== undefined) dbUpdates.subject = updates.subject;
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    if (updates.content !== undefined) dbUpdates.content = updates.content;
    if (updates.deadline !== undefined) dbUpdates.deadline = updates.deadline || null;
    if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl || null;
    if (updates.links !== undefined) dbUpdates.links = updates.links || null;
    if (updates.attachments !== undefined) {
      dbUpdates.attachments = updates.attachments
        ? updates.attachments.map(att => ({
            url: att.url,
            data: att.url ? undefined : att.data,
            type: att.type,
            name: att.name,
          }))
        : null;
    }

    try {
      setError(null);
      const { error: updateError } = await supabase.from(DB_TABLE).update(dbUpdates).eq('id', id);
      if (updateError) throw updateError;
      setEntries(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    } catch (e) {
      console.error('Ошибка обновления:', e);
      setError('Не удалось обновить запись');
      throw e;
    }
  }, []);

  const deleteEntry = useCallback(async (id: string) => {
    try {
      setError(null);
      const { error: deleteError } = await supabase.from(DB_TABLE).delete().eq('id', id);
      if (deleteError) throw deleteError;
      setEntries(prev => prev.filter(e => e.id !== id));
    } catch (e) {
      console.error('Ошибка удаления:', e);
      setError('Не удалось удалить запись');
      throw e;
    }
  }, []);

  const replaceAllEntries = useCallback(async (newEntries: Entry[]) => {
    try {
      setError(null);
      const { error: deleteAllError } = await supabase.from(DB_TABLE).delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (deleteAllError) throw deleteAllError;

      if (newEntries.length > 0) {
        const rows = newEntries.map(e => ({
          id: e.id || crypto.randomUUID(),
          date: e.date,
          subject: e.subject,
          type: e.type,
          content: e.content,
          deadline: e.deadline || null,
          image_url: e.imageUrl || null,
          attachments: e.attachments || null,
          links: e.links || null,
          created_at: new Date(e.createdAt || Date.now()).toISOString(),
          updated_at: new Date().toISOString(),
        }));
        const { error: insertError } = await supabase.from(DB_TABLE).insert(rows);
        if (insertError) throw insertError;
      }

      setEntries(newEntries);
    } catch (e) {
      console.error('Ошибка замены всех записей:', e);
      setError('Не удалось заменить записи');
      throw e;
    }
  }, []);

  const mergeEntries = useCallback(async (importedEntries: Entry[]) => {
    try {
      setError(null);
      const existingIds = new Set(entries.map(e => e.id));
      const newEntries = importedEntries.filter(e => !existingIds.has(e.id));

      if (newEntries.length === 0) return { added: 0, skipped: importedEntries.length };

      const rows = newEntries.map(e => ({
        id: e.id || crypto.randomUUID(),
        date: e.date,
        subject: e.subject,
        type: e.type,
        content: e.content,
        deadline: e.deadline || null,
        image_url: e.imageUrl || null,
        attachments: e.attachments || null,
        links: e.links || null,
        created_at: new Date(e.createdAt || Date.now()).toISOString(),
        updated_at: new Date().toISOString(),
      }));

      const { error: insertError } = await supabase.from(DB_TABLE).insert(rows);
      if (insertError) throw insertError;

      setEntries(prev => [...newEntries, ...prev]);
      return { added: newEntries.length, skipped: importedEntries.length - newEntries.length };
    } catch (e) {
      console.error('Ошибка объединения записей:', e);
      setError('Не удалось импортировать записи');
      throw e;
    }
  }, [entries]);

  const refresh = useCallback(async () => {
    await loadFromSupabase();
  }, []);

  return { entries, addEntry, updateEntry, deleteEntry, replaceAllEntries, mergeEntries, refresh, isLoaded, error };
}
