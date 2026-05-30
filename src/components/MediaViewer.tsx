import { X } from 'lucide-react';
import { Attachment } from '../types';

interface MediaViewerProps {
  media: Attachment[];
  startIndex: number;
  onClose: () => void;
}

export function MediaViewer({ media, startIndex, onClose }: MediaViewerProps) {
  const current = media[startIndex];

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-black/95"
      onClick={onClose}
    >
      {/* Top bar */}
      <div className="flex items-center justify-end p-3 sm:p-4 shrink-0 z-20" onClick={(e) => e.stopPropagation()}>
        <button
          className="text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          onClick={onClose}
          aria-label="Закрыть"
        >
          <X size={28} />
        </button>
      </div>

      {/* Content */}
      <div
        className="flex-1 flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {current.type === 'video' ? (
          <video
            src={current.data}
            controls
            autoPlay
            className="max-w-full max-h-full rounded-lg"
          />
        ) : (
          <img
            src={current.data}
            alt={current.name}
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        )}
      </div>
    </div>
  );
}
