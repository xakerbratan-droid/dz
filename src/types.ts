export type EntryType = 'dz' | 'gdz' | 'srs';

export type MediaType = 'image' | 'video';

export interface Attachment {
  data?: string;   // Data URL (только локально при загрузке, не хранится в БД)
  url?: string;    // Supabase Storage public URL (хранится в БД)
  type: MediaType;
  name: string;
}

export interface Entry {
  id: string;
  date: string;
  subject: string;
  type: EntryType;
  content: string;
  deadline?: string;
  imageUrl?: string;
  attachment?: Attachment;
  attachments?: Attachment[];
  links?: string[];
  createdAt: number;
}
