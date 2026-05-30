import { useEffect, useState } from 'react';

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        close: () => void;
        expand: () => void;
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          show: () => void;
          hide: () => void;
          setText: (text: string) => void;
          onClick: (fn: () => void) => void;
          offClick: (fn: () => void) => void;
        };
        BackButton: {
          isVisible: boolean;
          show: () => void;
          hide: () => void;
          onClick: (fn: () => void) => void;
          offClick: (fn: () => void) => void;
        };
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
        isExpanded: boolean;
        colorScheme: 'light' | 'dark';
        themeParams: Record<string, string>;
        setHeaderColor?: (color: string) => void;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            photo_url?: string;
          };
        };
      };
    };
  }
}

export function useTelegramApp() {
  const [isTelegram, setIsTelegram] = useState(false);
  const [user, setUser] = useState<{ id: number; first_name: string; username?: string } | null>(null);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      setIsTelegram(true);

      // Устанавливаем цвет хедера
      tg.setHeaderColor?.('#ffffff');

      // Сохраняем данные пользователя
      if (tg.initDataUnsafe?.user) {
        setUser({
          id: tg.initDataUnsafe.user.id,
          first_name: tg.initDataUnsafe.user.first_name,
          username: tg.initDataUnsafe.user.username
        });
      }

      return () => {
        tg.close();
      };
    }
  }, []);

  const haptic = (type: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning') => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    if (type === 'success' || type === 'error' || type === 'warning') {
      tg.HapticFeedback.notificationOccurred(type);
    } else {
      tg.HapticFeedback.impactOccurred(type);
    }
  };

  return { isTelegram, user, haptic };
}
