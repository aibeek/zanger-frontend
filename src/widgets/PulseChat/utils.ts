/**
 * Утилиты для управления Pulse Chat
 * 
 * Эти функции позволяют программно управлять виджетом Pulse Chat
 * после его инициализации.
 */

/**
 * Показать виджет Pulse Chat
 */
export const showPulseChat = (): void => {
  if (typeof window !== 'undefined' && window.PulseLiveChat?.show) {
    window.PulseLiveChat.show()
  } else {
    console.warn('Pulse Chat API не доступен. Убедитесь, что скрипт загружен.')
  }
}

/**
 * Скрыть виджет Pulse Chat
 */
export const hidePulseChat = (): void => {
  if (typeof window !== 'undefined' && window.PulseLiveChat?.hide) {
    window.PulseLiveChat.hide()
  } else {
    console.warn('Pulse Chat API не доступен. Убедитесь, что скрипт загружен.')
  }
}

/**
 * Переключить видимость виджета Pulse Chat
 */
export const togglePulseChat = (): void => {
  if (typeof window !== 'undefined' && window.PulseLiveChat?.toggle) {
    window.PulseLiveChat.toggle()
  } else {
    console.warn('Pulse Chat API не доступен. Убедитесь, что скрипт загружен.')
  }
}

/**
 * Проверить, доступен ли Pulse Chat API
 */
export const isPulseChatAvailable = (): boolean => {
  return typeof window !== 'undefined' && !!window.PulseLiveChat
}

/**
 * Hook для управления Pulse Chat в React компонентах
 */
export const usePulseChat = () => {
  return {
    show: showPulseChat,
    hide: hidePulseChat,
    toggle: togglePulseChat,
    isAvailable: isPulseChatAvailable(),
  }
}
