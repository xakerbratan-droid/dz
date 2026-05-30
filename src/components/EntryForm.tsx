import React, { useState, useRef } from 'react';
import { format, addDays } from 'date-fns';
import { X, Upload, File as FileIcon, Plus } from 'lucide-react';
import { EntryType, Attachment } from '../types';
import { SubjectPicker } from './SubjectPicker';
import { getSubjectsSync } from '../utils/subjects';

interface EntryFormProps {
  initialDate: Date;
  initialType?: EntryType;
  initialSubject?: string;
  initialContent?: string;
  initialAttachments?: Attachment[];
  initialDeadline?: string;
  initialTab?: 'homework' | 'srs' | 'schedule' | 'search';
  isEditing?: boolean;
  initialLinks?: string[];
  onSubmit: (data: { date: string; subject: string; type: EntryType; content: string; deadline?: string; attachments?: Attachment[]; links?: string[] }) => void;
  onClose: () => void;
}



export function EntryForm({ initialDate, initialType, initialSubject, initialContent = '', initialAttachments, initialDeadline, initialLinks, initialTab, isEditing, onSubmit, onClose }: EntryFormProps) {
  const [date, setDate] = useState(format(initialDate, 'yyyy-MM-dd'));
  const [subject, setSubject] = useState(initialSubject || getSubjectsSync()[0]?.name || 'Математика');
  const [type, setType] = useState<EntryType>(initialType || (initialTab === 'srs' ? 'srs' : 'dz'));
  const [content, setContent] = useState(initialContent);
  const [deadline, setDeadline] = useState(initialDeadline || format(addDays(initialDate, 7), 'yyyy-MM-dd'));

  const [attachments, setAttachments] = useState<Attachment[]>(initialAttachments || []);
  const [links, setLinks] = useState<string[]>(initialLinks || []);
  const [newLink, setNewLink] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddLink = () => {
    if (newLink.trim() && !links.includes(newLink.trim())) {
      setLinks([...links, newLink.trim()]);
      setNewLink('');
    }
  };

  const handleRemoveLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && attachments.length === 0 && links.length === 0) return;
    onSubmit({
      date,
      subject,
      type,
      content,
      deadline: type === 'srs' ? deadline : undefined,
      attachments: attachments.length > 0 ? attachments : undefined,
      links: links.length > 0 ? links : undefined
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const filesArray = Array.from(files);
    const newAttachments: Attachment[] = [];

    let completed = 0;
    filesArray.forEach((file) => {
      const isVideo = file.type.startsWith('video/');
      const reader = new FileReader();
      reader.onload = (event) => {
        newAttachments.push({
          data: event.target?.result as string,
          type: isVideo ? 'video' : 'image',
          name: file.name
        });
        completed++;
        if (completed === filesArray.length) {
          setAttachments((prev) => [...prev, ...newAttachments]);
          setIsUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      reader.onerror = () => {
        completed++;
        if (completed === filesArray.length) {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const isSrs = type === 'srs';
  const formTitle = isEditing
    ? `Редактировать ${isSrs ? 'СРС' : type === 'gdz' ? 'ГДЗ' : 'ДЗ'}`
    : isSrs ? 'Добавить СРС' : type === 'gdz' ? 'Добавить решение (ГДЗ)' : 'Добавить задание (ДЗ)';

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white dark:bg-[#1A1A1A] rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 shrink-0">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{formTitle}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500 dark:text-gray-400">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto flex-1 space-y-4">
          {!initialTab && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Тип</label>
              <div className="flex rounded-lg border border-gray-300 p-1 bg-gray-50">
                <button
                  type="button"
                  onClick={() => setType('dz')}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    type === 'dz' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  ДЗ
                </button>
                <button
                  type="button"
                  onClick={() => setType('gdz')}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    type === 'gdz' ? 'bg-white shadow text-green-600' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  ГДЗ
                </button>
                <button
                  type="button"
                  onClick={() => setType('srs')}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    type === 'srs' ? 'bg-white shadow text-purple-600' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  СРС
                </button>
              </div>
            </div>
          )}

          {!isSrs && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Дата</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border-gray-300 border p-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Предмет</label>
            <SubjectPicker value={subject} onChange={setSubject} />
          </div>

          {isSrs && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Сдать до</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full rounded-lg border-gray-300 border p-2 text-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Содержание</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full rounded-lg border-gray-300 dark:border-[#404040] dark:bg-[#1A1A1A] dark:text-gray-100 border p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y min-h-[120px]"
              placeholder={isSrs ? 'Опишите задание для самостоятельной работы...' : type === 'dz' ? 'Опишите домашнее задание...' : 'Напишите решение или ответ...'}
              required={attachments.length === 0}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Вложения (Фото / Видео)
              {attachments.length > 0 && (
                <span className="ml-2 text-xs text-gray-500 font-normal">— {attachments.length} шт.</span>
              )}
            </label>

            {/* Список загруженных файлов */}
            {attachments.length > 0 && (
              <div className="space-y-2 mb-2">
                {attachments.map((att, index) => (
                  <div key={index} className="w-full border rounded-xl p-2.5 flex items-center justify-between bg-gray-50 border-gray-200">
                    <div className="flex items-center gap-3 overflow-hidden">
                      {/* Превью изображения / иконка видео */}
                      {att.type === 'image' ? (
                        <img src={att.data} alt={att.name} className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
                          <FileIcon size={20} />
                        </div>
                      )}
                      <div className="truncate min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{att.name}</p>
                        <p className="text-xs text-gray-500">{att.type === 'video' ? 'Видео' : 'Изображение'}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="p-1.5 hover:bg-red-100 text-red-500 rounded-md transition-colors flex-shrink-0 ml-2"
                      title="Удалить"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Кнопка добавления */}
            <div
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className={`w-full border-2 border-dashed rounded-xl p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                isUploading ? 'bg-gray-50 border-gray-300 cursor-wait' : 'border-blue-200 bg-blue-50/50 hover:bg-blue-50 hover:border-blue-400'
              }`}
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-1"></div>
                  <span className="text-sm font-medium text-blue-700">Загрузка файлов...</span>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-blue-600">
                    {attachments.length === 0 ? <Upload size={20} /> : <Plus size={20} />}
                    <span className="text-sm font-medium">
                      {attachments.length === 0 ? 'Нажмите, чтобы загрузить файлы' : 'Добавить ещё файл'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 mt-0.5">PNG, JPG, MP4 — можно несколько сразу</span>
                </>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,video/*"
              multiple
              className="hidden"
            />
          </div>

          {/* Внешние ссылки */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ссылки
              {links.length > 0 && (
                <span className="ml-2 text-xs text-gray-500 font-normal">— {links.length} шт.</span>
              )}
            </label>

            {/* Список ссылок */}
            {links.length > 0 && (
              <div className="space-y-2 mb-2">
                {links.map((link, index) => (
                  <div key={index} className="w-full border rounded-xl p-2.5 flex items-center justify-between bg-gray-50 border-gray-200">
                    <div className="truncate min-w-0 flex-1 mr-2">
                      <a href={link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800 hover:underline truncate block">
                        {link}
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveLink(index)}
                      className="p-1.5 hover:bg-red-100 text-red-500 rounded-md transition-colors flex-shrink-0"
                      title="Удалить ссылку"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Поле ввода новой ссылки */}
            <div className="flex gap-2">
              <input
                type="url"
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddLink();
                  }
                }}
                placeholder="https://example.com"
                className="flex-1 rounded-lg border-gray-300 border p-2 text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <button
                type="button"
                onClick={handleAddLink}
                disabled={!newLink.trim()}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium transition-colors flex items-center gap-1"
              >
                <Plus size={16} />
                Добавить
              </button>
            </div>
          </div>

          <div className="pt-4 shrink-0">
            <button
              type="submit"
              disabled={(!content.trim() && attachments.length === 0) || isUploading}
              className={`w-full font-medium py-2.5 rounded-lg transition-colors text-white ${
                isSrs
                  ? 'bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300'
                  : type === 'gdz'
                  ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-300'
                  : 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300'
              }`}
            >
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
