'use client'

import { FC, useState } from 'react'
import { ChatList } from '../ChatList/ui/ChatList'
import { ChatWindow } from '../ChatWindow/ui/ChatWindow'
import { Chat as ChatType, Message } from '../types'
import s from './Chat.module.scss'

// Мок данные для демонстрации
const mockChats: ChatType[] = [
  {
    id: '1',
    client: {
      id: 'client1',
      name: 'Анна Иванова',
      avatar: '/assets/images/kb.jpg',
      role: 'client'
    },
    lawyer: {
      id: 'lawyer1',
      name: 'Иван Петров',
      role: 'lawyer'
    },
    applicationTitle: 'Консультация по трудовому праву',
    unreadCount: 3,
    lastActivity: new Date(2025, 8, 17, 14, 30),
    lastMessage: {
      id: 'msg3',
      chatId: '1',
      senderId: 'client1',
      content: 'Работодатель требует от меня работать сверхурочно без дополнительной оплаты. Правомерно ли это?',
      timestamp: new Date(2025, 8, 17, 14, 30),
      isRead: false,
      type: 'text'
    },
    messages: [
      {
        id: 'msg1',
        chatId: '1',
        senderId: 'client1',
        content: 'Здравствуйте! У меня вопрос по трудовому договору.',
        timestamp: new Date(2025, 8, 17, 10, 15),
        isRead: true,
        type: 'text'
      },
      {
        id: 'msg2',
        chatId: '1',
        senderId: 'lawyer1',
        content: 'Добро пожаловать! Я готов помочь вам с вопросами по трудовому праву. Расскажите подробнее о вашей ситуации.',
        timestamp: new Date(2025, 8, 17, 10, 18),
        isRead: true,
        type: 'text'
      },
      {
        id: 'msg3',
        chatId: '1',
        senderId: 'client1',
        content: 'Работодатель требует от меня работать сверхурочно без дополнительной оплаты. Правомерно ли это?',
        timestamp: new Date(2025, 8, 17, 14, 30),
        isRead: false,
        type: 'text'
      }
    ]
  },
  {
    id: '2',
    client: {
      id: 'client2',
      name: 'Петр Сидоров',
      role: 'client'
    },
    lawyer: {
      id: 'lawyer1',
      name: 'Иван Петров',
      role: 'lawyer'
    },
    applicationTitle: 'Семейные споры - раздел имущества',
    unreadCount: 1,
    lastActivity: new Date(2025, 8, 17, 12, 45),
    lastMessage: {
      id: 'msg4',
      chatId: '2',
      senderId: 'client2',
      content: 'Нужна помощь с разделом имущества при разводе.',
      timestamp: new Date(2025, 8, 17, 12, 45),
      isRead: false,
      type: 'text'
    },
    messages: [
      {
        id: 'msg4',
        chatId: '2',
        senderId: 'client2',
        content: 'Нужна помощь с разделом имущества при разводе.',
        timestamp: new Date(2025, 8, 17, 12, 45),
        isRead: false,
        type: 'text'
      }
    ]
  },
  {
    id: '3',
    client: {
      id: 'client3',
      name: 'Мария Козлова',
      avatar: '/assets/images/rsa.jpeg',
      role: 'client'
    },
    lawyer: {
      id: 'lawyer1',
      name: 'Иван Петров',
      role: 'lawyer'
    },
    applicationTitle: 'Корпоративное право - регистрация ООО',
    unreadCount: 0,
    lastActivity: new Date(2025, 8, 16, 16, 20),
    lastMessage: {
      id: 'msg6',
      chatId: '3',
      senderId: 'lawyer1',
      content: 'Обращайтесь, если возникнут дополнительные вопросы. Удачи с регистрацией!',
      timestamp: new Date(2025, 8, 16, 16, 22),
      isRead: true,
      type: 'text'
    },
    messages: [
      {
        id: 'msg5',
        chatId: '3',
        senderId: 'client3',
        content: 'Спасибо за консультацию по регистрации ООО!',
        timestamp: new Date(2025, 8, 16, 16, 20),
        isRead: true,
        type: 'text'
      },
      {
        id: 'msg6',
        chatId: '3',
        senderId: 'lawyer1',
        content: 'Обращайтесь, если возникнут дополнительные вопросы. Удачи с регистрацией!',
        timestamp: new Date(2025, 8, 16, 16, 22),
        isRead: true,
        type: 'text'
      }
    ]
  }
]

interface ChatPageProps {
  currentUserId?: string
}

export const Chat: FC<ChatPageProps> = ({ currentUserId = 'lawyer1' }) => {
  const [chats, setChats] = useState<ChatType[]>(mockChats)
  const [selectedChatId, setSelectedChatId] = useState<string>()

  const selectedChat = chats.find(chat => chat.id === selectedChatId)

  const handleChatSelect = (chatId: string) => {
    setSelectedChatId(chatId)
    
    // Помечаем сообщения как прочитанные
    setChats(prevChats =>
      prevChats.map(chat =>
        chat.id === chatId
          ? {
              ...chat,
              unreadCount: 0,
              messages: chat.messages.map(msg => ({ ...msg, isRead: true }))
            }
          : chat
      )
    )
  }

  const handleSendMessage = (content: string) => {
    if (!selectedChatId) return

    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      chatId: selectedChatId,
      senderId: currentUserId,
      content,
      timestamp: new Date(),
      isRead: true,
      type: 'text'
    }

    setChats(prevChats =>
      prevChats.map(chat =>
        chat.id === selectedChatId
          ? {
              ...chat,
              messages: [...chat.messages, newMessage],
              lastActivity: newMessage.timestamp,
              lastMessage: newMessage
            }
          : chat
      )
    )
  }

  return (
    <div className={s.chatPage}>
      {selectedChatId ? (
        // Показываем окно чата на всю ширину
        <div className={s.chatWindow}>
          <ChatWindow
            chat={selectedChat}
            currentUserId={currentUserId}
            onSendMessage={handleSendMessage}
            onBack={() => setSelectedChatId(undefined)}
          />
        </div>
      ) : (
        // Показываем список чатов
        <div className={s.chatList}>
          <ChatList
            chats={chats}
            selectedChatId={selectedChatId}
            onChatSelect={handleChatSelect}
          />
        </div>
      )}
    </div>
  )
}