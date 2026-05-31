import { Entry, Attachment } from '../types';
import { supabase } from '../lib/supabase';

/**
 * Возвращает все вложения записи в виде массива.
 */
export function getAttachments(entry: Entry): Attachment[] {
  const list: Attachment[] = [];
  if (entry.attachments && entry.attachments.length > 0) {
    list.push(...entry.attachments);
  } else if (entry.attachment) {
    list.push(entry.attachment);
  }
  return list;
}

/**
 * Возвращает отображаемый URL вложения.
 * Приоритет: url (Supabase Storage) > data (base64 legacy)
 */
export function getAttachmentDisplayUrl(att: Attachment): string {
  return att.url || att.data || '';
}

/**
 * Загружает файл в Supabase Storage и возвращает Attachment с url.
 * Если загрузка не удалась — возвращает Attachment с data (base64 fallback).
 */
export async function uploadAttachment(file: File): Promise<Attachment> {
  const isVideo = file.type.startsWith('video/');
  const ext = file.name.split('.').pop() || (isVideo ? 'mp4' : 'jpg');
  const path = `attachments/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

  try {
    const { error } = await supabase.storage
      .from('attachments')
      .upload(path, file, { cacheControl: '3600', upsert: false });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('attachments')
      .getPublicUrl(path);

    return {
      url: urlData.publicUrl,
      type: isVideo ? 'video' : 'image',
      name: file.name,
    };
  } catch (e) {
    console.warn('Storage upload failed, falling back to base64:', e);
    // Fallback: base64
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        resolve({
          data: ev.target?.result as string,
          type: isVideo ? 'video' : 'image',
          name: file.name,
        });
      };
      reader.readAsDataURL(file);
    });
  }
}
