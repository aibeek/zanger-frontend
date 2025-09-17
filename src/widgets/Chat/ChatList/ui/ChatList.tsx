'use client'

import { FC } from 'react'
import Image from 'next/image'
import { ChatListProps } from '../../types'
import s from './ChatList.module.scss'

export const ChatList: FC<ChatListProps> = ({ chats, selectedChatId, onChatSelect }) => {
  const formatDate = (date: Date) => {
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      return new Intl.DateTimeFormat('ru', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }).format(date)
    } else if (diffInHours < 24) {
      return `${diffInHours}ч назад`
    } else {
      return new Intl.DateTimeFormat('ru', { 
        day: '2-digit', 
        month: '2-digit' 
      }).format(date)
    }
  }

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <div className={s.chatList}>
      <div className={s.list}>
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`${s.chatItem} ${selectedChatId === chat.id ? s.active : ''}`}
            onClick={(e) => {
              e.preventDefault()
              onChatSelect(chat.id)
            }}
          >
            <div className={s.avatar}>
              {chat.client.avatar ? (
                <Image
                  src={chat.client.avatar}
                  alt={chat.client.name}
                  width={48}
                  height={48}
                  className={s.avatarImage}
                />
              ) : (
                <div className={s.avatarPlaceholder}>
                  {chat.client.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className={s.content}>
              <div className={s.header}>
                <h3 className={s.clientName}>{chat.client.name}</h3>
                <span className={s.timestamp}>
                  {formatDate(chat.lastActivity)}
                </span>
              </div>
              
              <div className={s.applicationTitle}>
                {truncateText(chat.applicationTitle, 40)}
              </div>
              
              <div className={s.lastMessage}>
                {chat.lastMessage ? truncateText(chat.lastMessage.content) : 'Нет сообщений'}
              </div>
            </div>

            {chat.unreadCount > 0 && (
              <div className={s.unreadBadge}>
                {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}