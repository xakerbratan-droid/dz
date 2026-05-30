import { ExternalLink } from 'lucide-react';

interface EntryLinksProps {
  links?: string[];
}

export function EntryLinks({ links }: EntryLinksProps) {
  if (!links || links.length === 0) return null;

  return (
    <div className="mt-3 space-y-2">
      {links.map((link, index) => (
        <a
          key={index}
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 p-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:border-blue-300 dark:hover:border-blue-700 transition-colors group"
        >
          <ExternalLink size={16} className="flex-shrink-0" />
          <span className="text-sm font-medium truncate group-hover:underline">
            {link}
          </span>
        </a>
      ))}
    </div>
  );
}
