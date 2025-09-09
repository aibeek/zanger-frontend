/**
 * Пример компонента для управления чатами
 * 
 * Этот компонент демонстрирует, как можно управлять
 * как существующим ChatBot, так и новым Pulse Chat
 */

'use client'
import { useState } from 'react'
import { Button } from '@/shared/ui-kit'
import { usePulseChat } from '@/widgets/PulseChat'

interface ChatControllerProps {
  className?: string
}

export const ChatController = ({ className }: ChatControllerProps) => {
  const [chatBotOpen, setChatBotOpen] = useState(false)
  const pulseChat = usePulseChat()

  return (
    <div className={className}>
      <h3>Управление чатами</h3>
      
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {/* Управление существующим ChatBot */}
        <Button
          onClick={() => setChatBotOpen(!chatBotOpen)}
          variant="border"
          size="sm"
        >
          {chatBotOpen ? 'Закрыть' : 'Открыть'} ChatBot
        </Button>

        {/* Управление Pulse Chat */}
        <Button
          onClick={pulseChat.show}
          variant="primary"
          size="sm"
          disabled={!pulseChat.isAvailable}
        >
          Показать Pulse Chat
        </Button>

        <Button
          onClick={pulseChat.hide}
          variant="border"
          size="sm"
          disabled={!pulseChat.isAvailable}
        >
          Скрыть Pulse Chat
        </Button>

        <Button
          onClick={pulseChat.toggle}
          variant="border"
          size="sm"
          disabled={!pulseChat.isAvailable}
        >
          Переключить Pulse Chat
        </Button>
      </div>

      <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
        Pulse Chat API: {pulseChat.isAvailable ? '✅ Доступен' : '❌ Недоступен'}
      </div>
    </div>
  )
}
