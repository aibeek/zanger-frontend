'use client'

import { FC, useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { ChatWindowProps } from '../../types'
import s from './ChatWindow.module.scss'

export const ChatWindow: FC<ChatWindowProps> = ({ chat, currentUserId, onSendMessage, onBack }) => {
  const [message, setMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollToBottom()
  }, [chat?.messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = () => {
    if (message.trim() && onSendMessage) {
      onSendMessage(message.trim())
      setMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('ru', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const formatDate = (date: Date) => {
    const today = new Date()
    const messageDate = new Date(date)
    
    if (messageDate.toDateString() === today.toDateString()) {
      return 'Сегодня'
    }
    
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Вчера'
    }
    
    return new Intl.DateTimeFormat('ru', {
      day: '2-digit',
      month: 'long'
    }).format(messageDate)
  }

  const groupMessagesByDate = () => {
    if (!chat?.messages) return []
    
    const groups: { date: string; messages: typeof chat.messages }[] = []
    let currentDate = ''
    let currentGroup: typeof chat.messages = []
    
    chat.messages.forEach((msg) => {
      const msgDate = formatDate(msg.timestamp)
      
      if (msgDate !== currentDate) {
        if (currentGroup.length > 0) {
          groups.push({ date: currentDate, messages: currentGroup })
        }
        currentDate = msgDate
        currentGroup = [msg]
      } else {
        currentGroup.push(msg)
      }
    })
    
    if (currentGroup.length > 0) {
      groups.push({ date: currentDate, messages: currentGroup })
    }
    
    return groups
  }

  if (!chat) {
    return (
      <div className={s.emptyState}>
        <div className={s.emptyContent}>
          <div className={s.emptyIcon}>💬</div>
          <h3>Выберите чат</h3>
          <p>Выберите собеседника из списка, чтобы начать общение</p>
        </div>
      </div>
    )
  }

  const messageGroups = groupMessagesByDate()

  return (
    <div className={s.chatWindow}>
      {/* Шапка чата */}
      <div className={s.header}>
        {onBack && (
          <button className={s.backButton} onClick={onBack}>
            ←
          </button>
        )}
        <div className={s.clientInfo}>
          <div className={s.avatar}>
            {chat.client.avatar ? (
              <Image
                src={chat.client.avatar}
                alt={chat.client.name}
                width={40}
                height={40}
                className={s.avatarImage}
              />
            ) : (
              <div className={s.avatarPlaceholder}>
                {chat.client.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className={s.details}>
            <h3 className={s.clientName}>{chat.client.name}</h3>
            <p className={s.applicationTitle}>{chat.applicationTitle}</p>
          </div>
        </div>
        <div className={s.lastActivity}>
          Последняя активность: {formatTime(chat.lastActivity)}
        </div>
      </div>

      {/* Область сообщений */}
      <div className={s.messagesArea}>
        {messageGroups.map((group, groupIndex) => (
          <div key={groupIndex} className={s.messageGroup}>
            <div className={s.dateSeparator}>
              <span>{group.date}</span>
            </div>
            
            {group.messages.map((msg) => (
              <div
                key={msg.id}
                className={`${s.message} ${
                  msg.senderId === currentUserId ? s.sent : s.received
                }`}
              >
                <div className={s.messageContent}>
                  <div className={s.bubble}>
                    {msg.content}
                  </div>
                  <div className={s.timestamp}>
                    {formatTime(msg.timestamp)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Поле ввода */}
      <div className={s.inputArea}>
        <div className={s.inputContainer}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Задать вопрос..."
            className={s.messageInput}
            rows={1}
          />
          <div className={s.inputActions}>

            <button
              onClick={handleSendMessage}
              disabled={!message.trim()}
              className={s.sendButton}
            >
              Отправить
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}