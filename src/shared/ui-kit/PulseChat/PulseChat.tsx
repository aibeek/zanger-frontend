'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './PulseChat.module.scss';

interface PulseChatProps {
  chatId: string;
  enabled?: boolean;
}

export const PulseChat = ({ chatId, enabled = true }: PulseChatProps) => {
  const [showChat, setShowChat] = useState(false);
  const [chatLoaded, setChatLoaded] = useState(false);

  // Блокируем все оригинальные элементы Pulse
  useEffect(() => {
    if (!enabled) return;

    const blockPulseElements = () => {
      // Скрываем все элементы Pulse, но не удаляем их
      const selectors = [
        '[data-live-chat-id]',
        '[id*="pulse"]',
        '.pulse-chat-widget',
        '.pulse-livechat',
        '.livechat-widget',
        'iframe[src*="pulse"]'
      ];

      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element: Element) => {
          const htmlElement = element as HTMLElement;
          // Проверяем, что это не наш контейнер
          if (!htmlElement.closest(`.${styles.chatContainer}`)) {
            htmlElement.style.display = 'none';
            htmlElement.style.visibility = 'hidden';
            htmlElement.style.opacity = '0';
          }
        });
      });
    };

    // Запускаем блокировку каждые 1000мс
    const interval = setInterval(blockPulseElements, 1000);

    return () => clearInterval(interval);
  }, [enabled]);

  // Загружаем Pulse скрипт только когда нужно показать чат
  useEffect(() => {
    if (!enabled || !showChat || chatLoaded) return;

    const loadPulseScript = () => {
      const script = document.createElement('script');
      script.src = 'https://cdn.pulse.is/livechat/loader.js';
      script.setAttribute('data-live-chat-id', chatId);
      script.async = true;

      script.onload = () => {
        setChatLoaded(true);
        
        // Через небольшую задержку показываем чат
        setTimeout(() => {
          const selectors = [
            `[data-live-chat-id="${chatId}"]`,
            '[id*="pulse"]',
            '.pulse-chat-widget',
            '.pulse-livechat',
            '.livechat-widget',
            'iframe[src*="pulse"]'
          ];

          selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach((element: Element) => {
              const htmlElement = element as HTMLElement;
              if (!htmlElement.closest(`.${styles.chatContainer}`)) {
                htmlElement.style.display = 'block';
                htmlElement.style.visibility = 'visible';
                htmlElement.style.opacity = '1';
                htmlElement.style.position = 'fixed';
                htmlElement.style.bottom = '80px';
                htmlElement.style.left = '20px';
                htmlElement.style.right = 'auto';
                htmlElement.style.zIndex = '9998';
              }
            });
          });
        }, 1000);
      };

      document.body.appendChild(script);
    };

    loadPulseScript();
  }, [chatId, enabled, showChat, chatLoaded]);

  const handleChatToggle = () => {
    if (showChat) {
      // Закрываем чат - удаляем все элементы Pulse
      setShowChat(false);
      setChatLoaded(false);
      
      const scripts = document.querySelectorAll('script[src*="pulse"], script[data-live-chat-id]');
      scripts.forEach(script => script.remove());
      
      const selectors = [
        '[data-live-chat-id]',
        '[id*="pulse"]',
        '.pulse-chat-widget',
        '.pulse-livechat',
        '.livechat-widget',
        'iframe[src*="pulse"]'
      ];

      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element: Element) => {
          const htmlElement = element as HTMLElement;
          if (!htmlElement.closest(`.${styles.chatContainer}`)) {
            htmlElement.remove();
          }
        });
      });
    } else {
      // Открываем чат
      setShowChat(true);
    }
  };

  // Early return after all hooks are called
  if (!enabled) {
    console.log('PulseChat disabled, returning null');
    return null;
  }


  return (
    <div className={styles.chatContainer} suppressHydrationWarning>
      <button
        onClick={handleChatToggle}
        className={styles.chatButton}
        title={showChat ? "Закрыть чат" : "Открыть чат"}
      >
        <Image
          src="/assets/images/aizan.svg"
          alt={showChat ? "Close Chat" : "Open Chat"}
          width={40}
          height={40}
        />
      </button>
    </div>
  );
};
