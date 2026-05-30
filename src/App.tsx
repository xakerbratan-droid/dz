import { useState, useEffect } from 'react';
import { Calendar as CalendarComp } from './components/Calendar';
import { DayView } from './components/DayView';
import { SrsView } from './components/SrsView';
import { ScheduleView } from './components/ScheduleView';
import { SearchView } from './components/SearchView';
import { EntryForm } from './components/EntryForm';
import { CloudSync } from './components/CloudSync';
import { useEntries } from './hooks/useEntries';
import { GraduationCap, ClipboardList, BookOpen, Cloud, Calendar as CalendarIcon, Search as SearchIcon, Moon, Sun, Settings } from 'lucide-react';
import { SettingsModal } from './components/SettingsModal';
import { EntryType, Entry, Attachment } from './types';
import { getAttachments } from './utils/attachments';

interface FormPreset {
  type: EntryType;
  subject: string;
  isEditing?: boolean;
  entryId?: string;
  content?: string;
  attachments?: Attachment[];
  deadline?: string;
  links?: string[];
}

type TabType = 'homework' | 'srs' | 'schedule' | 'search';
type Theme = 'light' | 'dark';

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<TabType>('homework');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSyncOpen, setIsSyncOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [formPreset, setFormPreset] = useState<FormPreset | undefined>(undefined);
  const { entries, addEntry, deleteEntry, updateEntry, replaceAllEntries, mergeEntries, isLoaded } = useEntries();

  // Тема (сохраняется в localStorage)
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme') as Theme | null;
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  // Обработка кнопки "назад"
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state?.searchView) {
        setActiveTab('search');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (!isLoaded) {
    return (
      <div className={`flex items-center justify-center h-screen ${theme === 'dark' ? 'bg-[#0F0F0F]' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleAddSubmit = (data: any) => {
    if (formPreset?.isEditing && formPreset.entryId) {
      updateEntry(formPreset.entryId, { ...data, attachment: undefined });
    } else {
      addEntry(data);
    }
    setIsFormOpen(false);
    setFormPreset(undefined);
  };

  const handleEditClick = (entry: Entry) => {
    setFormPreset({
      type: entry.type,
      subject: entry.subject,
      isEditing: true,
      entryId: entry.id,
      content: entry.content,
      attachments: getAttachments(entry),
      deadline: entry.deadline,
      links: entry.links
    });
    setIsFormOpen(true);
  };

  const handleAddClick = (preset?: { type: 'dz' | 'gdz'; subject: string }) => {
    if (preset) {
      setFormPreset(preset);
    } else {
      setFormPreset(activeTab === 'srs' ? { type: 'srs', subject: 'Математика' } : undefined);
    }
    setIsFormOpen(true);
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'homework', label: 'ДЗ / ГДЗ', icon: <BookOpen size={16} /> },
    { id: 'srs', label: 'СРС', icon: <ClipboardList size={16} /> },
    { id: 'schedule', label: 'Расписание', icon: <CalendarIcon size={16} /> },
    { id: 'search', label: 'Поиск', icon: <SearchIcon size={16} /> },
  ];

  return (
    <div className={`flex flex-col h-screen font-sans overflow-hidden notranslate ${theme === 'dark' ? 'bg-[#0F0F0F] text-[#F5F5F5]' : 'bg-white text-gray-900'}`} translate="no" lang="ru">
      {/* Header */}
      <header className={`border-b shrink-0 shadow-sm z-10 ${theme === 'dark' ? 'bg-[#1A1A1A] border-[#333333]' : 'bg-white border-gray-200'}`}>
        <div className="py-3 px-4 flex items-center justify-between mb-3">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-2 group"
            title="Настройки"
          >
            <div className="bg-blue-600 p-1.5 rounded-lg group-hover:bg-blue-700 transition-colors relative">
              <GraduationCap className="text-white" size={24} />
              <Settings
                size={12}
                className="text-white absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-0.5"
              />
            </div>
            <h1 className="text-xl font-bold tracking-tight">ДЗ и ГДЗ</h1>
          </button>
          <div className="flex items-center gap-2">
            {/* Переключатель темы */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-700 text-yellow-400' : 'hover:bg-gray-100 text-gray-600'}`}
              title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {/* Резервная копия */}
            <button
              onClick={() => setIsSyncOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${theme === 'dark' ? 'bg-[#242424] text-[#A3A3A3] hover:bg-[#2C2C2C]' : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600'}`}
              title="Резервная копия"
            >
              <Cloud size={18} />
              <span className="hidden sm:inline">Резервная копия</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 px-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : theme === 'dark' 
                    ? 'bg-[#242424] text-[#A3A3A3] hover:bg-[#2C2C2C]' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {activeTab === 'homework' && (
          <CalendarComp
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            entries={entries}
          />
        )}

        {activeTab === 'homework' && (
          <DayView
            date={selectedDate}
            entries={entries}
            onDelete={deleteEntry}
            onEdit={handleEditClick}
            onAddClick={handleAddClick}
          />
        )}

        {activeTab === 'srs' && (
          <SrsView
            entries={entries}
            onDelete={deleteEntry}
            onEdit={handleEditClick}
            onAddClick={handleAddClick}
          />
        )}

        {activeTab === 'schedule' && (
          <ScheduleView today={selectedDate} />
        )}

        {activeTab === 'search' && (
          <SearchView 
            entries={entries} 
            onNavigate={(tab) => {
              setActiveTab(tab);
            }}
          />
        )}
      </main>

      {/* Entry Form Modal */}
      {isFormOpen && (
        <EntryForm
          initialDate={selectedDate}
          initialType={formPreset?.type}
          initialSubject={formPreset?.subject}
          initialContent={formPreset?.content}
          initialAttachments={formPreset?.attachments}
          initialDeadline={formPreset?.deadline}
          initialLinks={formPreset?.links}
          isEditing={formPreset?.isEditing}
          initialTab={activeTab}
          onSubmit={handleAddSubmit}
          onClose={() => { setIsFormOpen(false); setFormPreset(undefined); }}
        />
      )}

      {/* Cloud Sync Modal */}
      {isSyncOpen && (
        <CloudSync
          entries={entries}
          onImport={mergeEntries}
          onClose={() => setIsSyncOpen(false)}
        />
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          onClose={() => {
            setIsSettingsOpen(false);
            // Обновляем список предметов в SubjectPicker после закрытия
            window.dispatchEvent(new CustomEvent('subjects-changed'));
          }}
        />
      )}
    </div>
  );
}

export default App;
