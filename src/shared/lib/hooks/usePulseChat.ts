'use client';

import { useEffect } from 'react';

interface UsePulseChatOptions {
  enabled?: boolean;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

export const usePulseChat = (
  chatId: string, 
  options: UsePulseChatOptions = {}
) => {
  const { enabled = true, onLoad, onError } = options;

  useEffect(() => {
    if (!enabled || !chatId) return;

    // Проверяем, не загружен ли уже скрипт
    const existingScript = document.querySelector(`script[data-live-chat-id="${chatId}"]`);
    if (existingScript) {
      onLoad?.();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.pulse.is/livechat/loader.js';
    script.setAttribute('data-live-chat-id', chatId);
    script.async = true;

    // Обработчики событий
    script.onload = () => {
      onLoad?.();
    };

    script.onerror = () => {
      onError?.(new Error('Failed to load Pulse chat script'));
    };

    document.body.appendChild(script);

    // Cleanup функция
    return () => {
      const scriptToRemove = document.querySelector(`script[data-live-chat-id="${chatId}"]`);
      if (scriptToRemove) {
        document.body.removeChild(scriptToRemove);
      }
    };
  }, [chatId, enabled, onLoad, onError]);
};
