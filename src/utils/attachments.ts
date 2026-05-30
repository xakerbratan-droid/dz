import { Entry, Attachment } from '../types';

/**
 * Возвращает все вложения записи в виде массива.
 * Учитывает старое поле `attachment` (одно вложение) и новое `attachments` (массив).
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
