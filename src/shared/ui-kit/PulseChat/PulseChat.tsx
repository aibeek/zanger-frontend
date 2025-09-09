'use client';

import { useEffect } from 'react';
import { loadPulseChat, repositionPulseChat } from '@/shared/lib';

interface PulseChatProps {
  chatId: string;
  enabled?: boolean;
}

export const PulseChat = ({ chatId, enabled = true }: PulseChatProps) => {
  useEffect(() => {
    if (!enabled || !chatId) return;

    let repositionInterval: NodeJS.Timeout;

    // Используем утилиту для безопасной загрузки
    loadPulseChat({
      chatId,
      onLoad: () => {
        console.log('Pulse Chat loaded successfully');
        
        // Начинаем позиционирование через 1 секунду после загрузки
        setTimeout(() => {
          repositionPulseChat(chatId);
          
          // Продолжаем проверять каждые 500мс в течение 10 секунд
          let attempts = 0;
          repositionInterval = setInterval(() => {
            repositionPulseChat(chatId);
            attempts++;
            if (attempts >= 20) { // 20 * 500ms = 10 секунд
              clearInterval(repositionInterval);
            }
          }, 500);
        }, 1000);
      },
      onError: (error) => {
        console.error('Failed to load Pulse Chat:', error);
      }
    });

    // Cleanup функция
    return () => {
      if (repositionInterval) {
        clearInterval(repositionInterval);
      }
    };
  }, [chatId, enabled]);

  return null; // Компонент ничего не рендерит
};
