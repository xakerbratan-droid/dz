import { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Attachment } from '../types';
import { getAttachmentDisplayUrl } from '../utils/attachments';

interface MediaViewerProps {
  media: Attachment[];
  startIndex: number;
  onClose: () => void;
}

export function MediaViewer({ media, startIndex, onClose }: MediaViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const current = media[currentIndex];
  const displayUrl = getAttachmentDisplayUrl(current);

  const goPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(i => (i - 1 + media.length) % media.length);
  };

  const goNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(i => (i + 1) % media.length);
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/95" onClick={onClose}>
      {/* Top bar */}
      <div className="flex items-center justify-between p-3 sm:p-4 shrink-0 z-20" onClick={(e) => e.stopPropagation()}>
        <span className="text-white/60 text-sm">{currentIndex + 1} / {media.length}</span>
        <button
          className="text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          onClick={onClose}
          aria-label="Закрыть"
        >
          <X size={28} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4 relative" onClick={(e) => e.stopPropagation()}>
        {media.length > 1 && (
          <button
            onClick={goPrev}
            className="absolute left-2 z-10 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <ChevronLeft size={32} />
          </button>
        )}

        {current.type === 'video' ? (
          <video src={displayUrl} controls autoPlay className="max-w-full max-h-full rounded-lg" />
        ) : (
          <img
            src={displayUrl}
            alt={current.name}
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        )}

        {media.length > 1 && (
          <button
            onClick={goNext}
            className="absolute right-2 z-10 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <ChevronRight size={32} />
          </button>
        )}
      </div>
    </div>
  );
}

