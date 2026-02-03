'use client'

import { FC, useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { ChatWindowProps, MessageStatus } from '../../types'
import s from './ChatWindow.module.scss'
import { Check, CheckCheck, Clock, Loader2 } from 'lucide-react'

export const ChatWindow: FC<ChatWindowProps> = ({ 
  chat, 
  currentUserId, 
  onSendMessage, 
  onLoadMore,
  isLoadingMore,
  hasMore,
  onBack 
}) => {
  const [message, setMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const prevScrollHeightRef = useRef<number>(0)
  const isInitialLoadRef = useRef(true)

  // Scroll to bottom on new messages (only if near bottom)
  useEffect(() => {
    if (!chat?.messages || !messagesContainerRef.current) return

    const container = messagesContainerRef.current
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100

    if (isInitialLoadRef.current) {
      // Initial load - scroll to bottom
      scrollToBottom()
      isInitialLoadRef.current = false
    } else if (isNearBottom) {
      // New message and user is near bottom - scroll to see it
      scrollToBottom()
    }
  }, [chat?.messages?.length])

  // Preserve scroll position when loading older messages
  useEffect(() => {
    if (!messagesContainerRef.current || isLoadingMore) return

    const container = messagesContainerRef.current
    if (prevScrollHeightRef.current > 0) {
      // After loading older messages, maintain scroll position
      const newScrollHeight = container.scrollHeight
      const scrollDiff = newScrollHeight - prevScrollHeightRef.current
      container.scrollTop = scrollDiff
      prevScrollHeightRef.current = 0
    }
  }, [chat?.messages, isLoadingMore])

  // Reset initial load flag when chat changes
  useEffect(() => {
    isInitialLoadRef.current = true
  }, [chat?.id])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Handle scroll for infinite scroll
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current || !hasMore || isLoadingMore || !onLoadMore) return

    const container = messagesContainerRef.current
    
    // Load more when scrolled near top (within 100px)
    if (container.scrollTop < 100) {
      prevScrollHeightRef.current = container.scrollHeight
      onLoadMore()
    }
  }, [hasMore, isLoadingMore, onLoadMore])

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

  // Render message status icon
  const renderStatusIcon = (status: MessageStatus, isRead: boolean) => {
    if (isRead || status === 'read') {
      return <CheckCheck size={14} className={s.statusRead} />
    }
    if (status === 'delivered') {
      return <CheckCheck size={14} className={s.statusDelivered} />
    }
    if (status === 'sent') {
      return <Check size={14} className={s.statusSent} />
    }
    return <Clock size={14} className={s.statusPending} />
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
      {/* Header */}
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

      {/* Messages area with infinite scroll */}
      <div 
        className={s.messagesArea} 
        ref={messagesContainerRef}
        onScroll={handleScroll}
      >
        {/* Loading indicator for older messages */}
        {isLoadingMore && (
          <div className={s.loadingMore}>
            <Loader2 size={20} className={s.spinner} />
            <span>Загрузка...</span>
          </div>
        )}

        {/* Load more button (alternative to scroll) */}
        {hasMore && !isLoadingMore && onLoadMore && (
          <div className={s.loadMoreContainer}>
            <button 
              className={s.loadMoreButton}
              onClick={onLoadMore}
            >
              Загрузить предыдущие сообщения
            </button>
          </div>
        )}

        {messageGroups.length === 0 ? (
          <div className={s.noMessages}>
            <p>Нет сообщений</p>
            <span>Напишите первое сообщение, чтобы начать диалог</span>
          </div>
        ) : (
          messageGroups.map((group, groupIndex) => (
            <div key={groupIndex} className={s.messageGroup}>
              <div className={s.dateSeparator}>
                <span>{group.date}</span>
              </div>
              
              {group.messages.map((msg) => {
                const isSent = msg.senderId === currentUserId
                return (
                  <div
                    key={msg.id}
                    className={`${s.message} ${isSent ? s.sent : s.received}`}
                  >
                    <div className={s.messageContent}>
                      <div className={s.bubble}>
                        {msg.content}
                      </div>
                      <div className={s.messageFooter}>
                        <span className={s.timestamp}>
                          {formatTime(msg.timestamp)}
                        </span>
                        {isSent && (
                          <span className={s.status}>
                            {renderStatusIcon(msg.status, msg.isRead)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
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
