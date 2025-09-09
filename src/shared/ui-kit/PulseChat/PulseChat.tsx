'use client';

import { useEffect } from 'react';

interface PulseChatProps {
  chatId: string;
  enabled?: boolean;
}

export const PulseChat = ({ chatId, enabled = true }: PulseChatProps) => {
  useEffect(() => {
    if (!enabled || !chatId) return;

    // Проверяем, не загружен ли уже скрипт
    if (document.querySelector(`script[data-live-chat-id="${chatId}"]`)) {
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.pulse.is/livechat/loader.js';
    script.setAttribute('data-live-chat-id', chatId);
    script.async = true;

    document.body.appendChild(script);

    // Функция для принудительного позиционирования чата
    const repositionChat = () => {
      // Ищем все возможные элементы Pulse чата
      const selectors = [
        `[data-live-chat-id="${chatId}"]`,
        '[id*="pulse"]',
        '.pulse-chat-widget',
        '.pulse-livechat',
        '.livechat-widget',
        'iframe[src*="pulse"]',
        'div[style*="position: fixed"]'
      ];

      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element: Element) => {
          const htmlElement = element as HTMLElement;
          if (htmlElement.style) {
            htmlElement.style.position = 'fixed';
            htmlElement.style.bottom = '20px';
            htmlElement.style.right = '20px';
            htmlElement.style.left = 'auto';
            htmlElement.style.zIndex = '9999';
          }
        });
      });
    };

    // Ждем загрузки скрипта и периодически проверяем появление виджета
    script.onload = () => {
      // Начинаем проверку через 1 секунду после загрузки
      setTimeout(() => {
        repositionChat();
        
        // Продолжаем проверять каждые 500мс в течение 10 секунд
        let attempts = 0;
        const interval = setInterval(() => {
          repositionChat();
          attempts++;
          if (attempts >= 20) { // 20 * 500ms = 10 секунд
            clearInterval(interval);
          }
        }, 500);
      }, 1000);
    };

    // Cleanup функция для удаления скрипта при размонтировании
    return () => {
      const existingScript = document.querySelector(`script[data-live-chat-id="${chatId}"]`);
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, [chatId, enabled]);

  return null; // Компонент ничего не рендерит
};
