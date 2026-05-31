import { useState, useEffect } from 'react';
import { Entry } from '../types';
import { getAttachments, getAttachmentDisplayUrl } from '../utils/attachments';
import { MediaViewer } from './MediaViewer';
import { Image, Film, ChevronDown, ChevronUp } from 'lucide-react';

interface AttachmentsGalleryProps {
  entry: Entry;
  alt?: string;
}

export function AttachmentsGallery({ entry, alt = 'Вложение' }: AttachmentsGalleryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const attachments = getAttachments(entry);
  const hasLegacyImage = entry.imageUrl && attachments.length === 0;

  const allMedia = hasLegacyImage
    ? [{ url: entry.imageUrl!, type: 'image' as const, name: 'Изображение' }]
    : attachments;

  if (allMedia.length === 0) return null;

  const imageCount = allMedia.filter(a => a.type === 'image').length;
  const videoCount = allMedia.filter(a => a.type === 'video').length;

  const parts: string[] = [];
  if (imageCount > 0) parts.push(`${imageCount} фото`);
  if (videoCount > 0) parts.push(`${videoCount} видео`);
  const label = parts.join(', ');

  useEffect(() => {
    if (viewerIndex === null) return;
    history.pushState({ mediaViewer: true }, '');
    const handlePopState = () => setViewerIndex(null);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [viewerIndex]);

  const openViewer = (index: number) => setViewerIndex(index);

  const closeViewer = () => {
    if (viewerIndex !== null) history.back();
    else setViewerIndex(null);
  };

  return (
    <>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
        className={`mt-3 w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
          isExpanded
            ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400'
            : 'bg-gray-50 dark:bg-[#1A1A1A] border-gray-200 dark:border-[#333333] text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#242424]'
        }`}
      >
        <span className="flex items-center gap-2">
          {videoCount > 0 && imageCount === 0 ? <Film size={16} /> : <Image size={16} />}
          {label}
        </span>
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {isExpanded && (
        <div className="mt-2">
          {allMedia.length === 1 ? (
            <div
              className="rounded-lg overflow-hidden border border-gray-100 bg-black/5 flex justify-center cursor-pointer"
              onClick={(e) => { e.stopPropagation(); openViewer(0); }}
            >
              {allMedia[0].type === 'video' ? (
                <video src={getAttachmentDisplayUrl(allMedia[0])} className="w-full h-auto max-h-96 object-contain pointer-events-none" />
              ) : (
                <img
                  src={getAttachmentDisplayUrl(allMedia[0])}
                  alt={alt}
                  className="w-full h-auto object-contain max-h-96"
                  loading="lazy"
                />
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {allMedia.map((att, idx) => {
                const displayUrl = getAttachmentDisplayUrl(att);
                return (
                  <div
                    key={idx}
                    className="rounded-lg overflow-hidden border border-gray-100 bg-black/5 flex justify-center aspect-square cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); openViewer(idx); }}
                  >
                    {att.type === 'video' ? (
                      <video src={displayUrl} className="w-full h-full object-cover pointer-events-none" />
                    ) : (
                      <img
                        src={displayUrl}
                        alt={`${alt} ${idx + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {viewerIndex !== null && (
        <MediaViewer media={allMedia} startIndex={viewerIndex} onClose={closeViewer} />
      )}
    </>
  );
}
