'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './PulseChat.module.scss';

interface PulseChatProps {
  chatId: string;
  enabled?: boolean;
}

export const PulseChat = ({ chatId, enabled = false }: PulseChatProps) => {
  const [showChat, setShowChat] = useState(true); // Чат раскрыт по умолчанию
  const [chatLoaded, setChatLoaded] = useState(false);

  // Загружаем Pulse скрипт при монтировании компонента
  useEffect(() => {
    if (!enabled || chatLoaded) return;

    console.log('PulseChat: Loading script for chatId:', chatId);

    const loadPulseScript = () => {
      const script = document.createElement('script');
      script.src = 'https://cdn.pulse.is/livechat/loader.js';
      script.setAttribute('data-live-chat-id', chatId);
      script.async = true;

      script.onload = () => {
        console.log('PulseChat: Script loaded successfully');
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
            console.log(`PulseChat: Found ${elements.length} elements for selector: ${selector}`);
            elements.forEach((element: Element) => {
              const htmlElement = element as HTMLElement;
              if (!htmlElement.closest(`.${styles.chatContainer}`)) {
                htmlElement.style.display = showChat ? 'block' : 'none';
                htmlElement.style.visibility = showChat ? 'visible' : 'hidden';
                htmlElement.style.opacity = showChat ? '1' : '0';
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

      script.onerror = () => {
        console.error('PulseChat: Failed to load script');
      };

      document.body.appendChild(script);
    };

    loadPulseScript();
  }, [chatId, enabled, chatLoaded, showChat]);

  // Управление видимостью чата
  useEffect(() => {
    if (!enabled || !chatLoaded) return;

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
          htmlElement.style.display = showChat ? 'block' : 'none';
          htmlElement.style.visibility = showChat ? 'visible' : 'hidden';
          htmlElement.style.opacity = showChat ? '1' : '0';
        }
      });
    });
  }, [chatId, enabled, chatLoaded, showChat]);

  const handleChatToggle = () => {
    setShowChat(!showChat);
  };

  // Early return after all hooks are called
  if (!enabled) {
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
