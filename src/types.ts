export type EntryType = 'dz' | 'gdz' | 'srs';

export type MediaType = 'image' | 'video';

export interface Attachment {
  data: string; // Data URL файла
  type: MediaType;
  name: string;
}

export interface Entry {
  id: string;
  date: string; // YYYY-MM-DD format (дата создания/добавления)
  subject: string;
  type: EntryType;
  content: string;
  deadline?: string; // YYYY-MM-DD format (дата сдачи для СРС)
  imageUrl?: string; // Оставлено для обратной совместимости
  attachment?: Attachment; // Старое поле (одно вложение) — для обратной совместимости
  attachments?: Attachment[]; // Новое поле — массив вложений
  links?: string[]; // Внешние ссылки
  createdAt: number;
}
