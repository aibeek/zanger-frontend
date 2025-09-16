/**
 * Безопасная загрузка Pulse Chat с предотвращением дублирования
 */

// Глобальный флаг для отслеживания состояния загрузки
declare global {
  interface Window {
    __PULSE_CHAT_LOADED__?: boolean;
    __PULSE_CHAT_LOADING__?: boolean;
  }
}

export interface PulseChatLoaderOptions {
  chatId: string;
  onLoad?: () => void;
  onError?: (error: any) => void;
}

export const loadPulseChat = async ({ chatId, onLoad, onError }: PulseChatLoaderOptions): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      // Проверяем, не загружен ли уже Pulse Chat
      if (window.__PULSE_CHAT_LOADED__) {
        onLoad?.();
        resolve();
        return;
      }

      // Проверяем, не в процессе ли загрузки
      if (window.__PULSE_CHAT_LOADING__) {
        // Ждем завершения текущей загрузки
        const checkInterval = setInterval(() => {
          if (window.__PULSE_CHAT_LOADED__) {
            clearInterval(checkInterval);
            onLoad?.();
            resolve();
          }
        }, 100);
        return;
      }

      // Проверяем, не зарегистрирован ли уже веб-компонент
      if (customElements.get('sp-live-chat')) {
        console.warn('Pulse Chat component already registered');
        window.__PULSE_CHAT_LOADED__ = true;
        onLoad?.();
        resolve();
        return;
      }

      // Проверяем, не существует ли уже скрипт
      const existingScript = document.querySelector(`script[data-live-chat-id="${chatId}"]`);
      if (existingScript) {
        console.warn('Pulse Chat script already exists');
        window.__PULSE_CHAT_LOADED__ = true;
        onLoad?.();
        resolve();
        return;
      }

      // Устанавливаем флаг загрузки
      window.__PULSE_CHAT_LOADING__ = true;

      // Создаем и загружаем скрипт
      const script = document.createElement('script');
      script.src = 'https://cdn.pulse.is/livechat/loader.js';
      script.setAttribute('data-live-chat-id', chatId);
      script.async = true;

      script.onload = () => {
        window.__PULSE_CHAT_LOADED__ = true;
        window.__PULSE_CHAT_LOADING__ = false;
        onLoad?.();
        resolve();
      };

      script.onerror = (error) => {
        window.__PULSE_CHAT_LOADING__ = false;
        const errorMessage = `Failed to load Pulse Chat script: ${error}`;
        console.error(errorMessage);
        onError?.(error);
        reject(new Error(errorMessage));
      };

      document.body.appendChild(script);

    } catch (error) {
      window.__PULSE_CHAT_LOADING__ = false;
      console.error('Error loading Pulse Chat:', error);
      onError?.(error);
      reject(error);
    }
  });
};

export const repositionPulseChat = (chatId: string): void => {
  try {
    // Ищем все возможные элементы Pulse чата
    const selectors = [
      `[data-live-chat-id="${chatId}"]`,
      '[id*="pulse"]',
      '.pulse-chat-widget',
      '.pulse-livechat',
      '.livechat-widget',
      'iframe[src*="pulse"]',
      'div[style*="position: fixed"]',
      'sp-live-chat'
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
  } catch (error) {
    console.warn('Error repositioning Pulse chat:', error);
  }
};
