/**
 * Pulse Chat Integration для Next.js
 * 
 * Этот компонент обеспечивает интеграцию онлайн-чата Pulse в приложение Next.js.
 * 
 * Особенности:
 * - Автоматическая загрузка скрипта Pulse
 * - Предотвращение дублирования скриптов
 * - Правильная очистка при размонтировании
 * - TypeScript поддержка
 * - SSR совместимость
 * 
 * @example
 * ```tsx
 * import { PulseChat } from '@/widgets/PulseChat'
 * 
 * // Использование с ID по умолчанию
 * <PulseChat />
 * 
 * // Использование с кастомным ID
 * <PulseChat chatId="your-custom-chat-id" />
 * ```
 */

export interface PulseChatConfig {
  /** ID чата Pulse (можно найти в админ-панели) */
  chatId: string
  /** Отключить автозагрузку скрипта */
  disabled?: boolean
  /** Callback при успешной загрузке */
  onLoad?: () => void
  /** Callback при ошибке загрузки */
  onError?: (error: Error) => void
}

declare global {
  interface Window {
    PulseLiveChat?: {
      show?: () => void
      hide?: () => void
      toggle?: () => void
    }
  }
}
