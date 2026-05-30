import { useRef, useState, useEffect } from 'react';
import { Download, Upload, CheckCircle, AlertTriangle, X, Cloud, RefreshCw } from 'lucide-react';
import { Entry } from '../types';
import { ScheduleItem } from './ScheduleView';
import { loadSchedule, saveSchedule } from '../hooks/scheduleStore';
import { supabase } from '../lib/supabase';

interface CloudSyncProps {
  entries: Entry[];
  onImport: (entries: Entry[]) => Promise<{ added: number; skipped: number }>;
  onClose: () => void;
}

type Status = 'idle' | 'success' | 'error';

interface ExportData {
  version: number;
  exportedAt: string;
  entries: Entry[];
  schedule: ScheduleItem[];
}

export function CloudSync({ entries, onImport, onClose }: CloudSyncProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<Status>('idle');
  const [exportStatus, setExportStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const [scheduleCount, setScheduleCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    loadSchedule().then(s => setScheduleCount(s.length));
  }, []);

  const handleExport = async () => {
    try {
      const schedule = await loadSchedule() as ScheduleItem[];
      const data: ExportData = {
        version: 2,
        exportedAt: new Date().toISOString(),
        entries,
        schedule,
      };
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const date = new Date().toLocaleDateString('ru-RU').replace(/\./g, '-');
      a.href = url;
      a.download = `дз-гдз-${date}.json`;
      a.click();
      URL.revokeObjectURL(url);

      setExportStatus('success');
      setMessage(`Сохранено: ${entries.length} записей, ${schedule.length} пар`);
      setTimeout(() => setExportStatus('idle'), 3000);
    } catch {
      setExportStatus('error');
      setMessage('Ошибка при экспорте');
      setTimeout(() => setExportStatus('idle'), 3000);
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        setImportStatus('idle');
        const parsed = JSON.parse(event.target?.result as string);

        let importedEntries: Entry[] | null = null;
        let importedSchedule: ScheduleItem[] | null = null;

        if (Array.isArray(parsed)) {
          importedEntries = parsed;
        } else if (typeof parsed === 'object' && parsed !== null) {
          if (Array.isArray(parsed.entries)) importedEntries = parsed.entries;
          if (Array.isArray(parsed.schedule)) importedSchedule = parsed.schedule;
        }

        if (!importedEntries && !importedSchedule) {
          throw new Error('Неверный формат файла');
        }

        // Валидация записей
        if (importedEntries) {
          const valid = importedEntries.every(
            (e) => typeof e.id === 'string' && typeof e.date === 'string' && typeof e.type === 'string'
          );
          if (!valid) throw new Error('Файл содержит некорректные данные');
        }

        // Валидация расписания
        if (importedSchedule) {
          const validSchedule = importedSchedule.every(
            (s) => typeof s.id === 'string' && typeof s.dayOfWeek === 'number' && typeof s.subject === 'string'
          );
          if (!validSchedule) importedSchedule = null;
        }

        // Объединяем записи (добавляем только новые)
        if (importedEntries && importedEntries.length > 0) {
          const result = await onImport(importedEntries);

          const parts: string[] = [];
          if (result.added > 0) parts.push(`добавлено ${result.added}`);
          if (result.skipped > 0) parts.push(`уже есть ${result.skipped}`);

          setMessage(`Загружено: ${parts.join(', ')}`);
        }

        // Сохраняем расписание (заменяем, т.к. это расписание)
        if (importedSchedule && importedSchedule.length > 0) {
          await saveSchedule(importedSchedule);
          setScheduleCount(importedSchedule.length);
        }

        const totalParts: string[] = [];
        if (importedEntries) totalParts.push(`${importedEntries.length} записей`);
        if (importedSchedule) totalParts.push(`${importedSchedule.length} пар`);

        setImportStatus('success');
        setTimeout(() => {
          setImportStatus('idle');
          if (importedSchedule) {
            window.location.reload();
          }
        }, 1500);
      } catch (err: any) {
        setImportStatus('error');
        setMessage(err.message || 'Ошибка при чтении файла');
        setTimeout(() => setImportStatus('idle'), 3000);
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  // Ручная синхронизация — перезагрузка данных из Supabase
  const handleRefresh = async () => {
    setIsSyncing(true);
    try {
      // Перезагружаем страницу для получения свежих данных
      window.location.reload();
    } catch {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
              <Cloud className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Резервная копия</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">{entries.length} записей · {scheduleCount} пар в расписании</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500 dark:text-gray-400">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-3">
          {/* Sync refresh */}
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <RefreshCw className="text-purple-600" size={16} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Обновить данные</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Получить последние записи с сервера
                </p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isSyncing}
              className="w-full py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
            >
              {isSyncing ? (
                <><RefreshCw size={16} className="animate-spin" /> Загрузка...</>
              ) : (
                <><RefreshCw size={16} /> Обновить</>
              )}
            </button>
          </div>

          {/* Export */}
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Download className="text-green-600" size={16} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Скачать данные</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Сохранит ДЗ, ГДЗ, СРС, расписание и вложения в один файл.
                </p>
              </div>
            </div>
            <button
              onClick={handleExport}
              className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                exportStatus === 'success'
                  ? 'bg-green-600 text-white'
                  : exportStatus === 'error'
                  ? 'bg-red-600 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {exportStatus === 'success' ? (
                <><CheckCircle size={16} /> Сохранено</>
              ) : exportStatus === 'error' ? (
                <><AlertTriangle size={16} /> Ошибка</>
              ) : (
                <><Download size={16} /> Скачать файл</>
              )}
            </button>
            {exportStatus === 'success' && message && (
              <p className="text-xs text-green-700 text-center mt-2">{message}</p>
            )}
          </div>

          {/* Import */}
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Upload className="text-blue-600" size={16} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Загрузить данные</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Добавит новые записи из файла. <span className="text-green-600 font-medium">Существующие не удаляются.</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                importStatus === 'success'
                  ? 'bg-green-600 text-white'
                  : importStatus === 'error'
                  ? 'bg-red-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {importStatus === 'success' ? (
                <><CheckCircle size={16} /> {message}</>
              ) : importStatus === 'error' ? (
                <><AlertTriangle size={16} /> {message}</>
              ) : (
                <><Upload size={16} /> Загрузить файл</>
              )}
            </button>
            {importStatus === 'success' && message && (
              <p className="text-xs text-green-700 text-center mt-2">{message}</p>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImportFile}
            />
          </div>

          {/* Tip */}
          <p className="text-xs text-gray-400 text-center px-2">
            Данные синхронизируются автоматически. Используйте файлы для резервного копирования.
          </p>
        </div>
      </div>
    </div>
  );
}
