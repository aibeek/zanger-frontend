'use client'

import { FC, useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Cookies from 'js-cookie'
import { useLoginStore } from '@/features/auth/login'
import { ChatList } from '../ChatList/ui/ChatList'
import { ChatWindow } from '../ChatWindow/ui/ChatWindow'
import { Chat as ChatType, Message, MessageSentEvent, MessageReadEvent } from '../types'
import s from './Chat.module.scss'
import { httpClientWithAuth } from '@/shared/api/httpClient'
import toast from 'react-hot-toast'
import { API_URL } from '@/shared/config/env'
import { Menu, X, MessageCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { getEcho, disconnectEcho } from '@/shared/lib/echo'
import type { Channel } from 'laravel-echo'

interface ChatPageProps {
  currentUserId?: string
}

// Polling interval as fallback (30 seconds instead of 5)
const FALLBACK_POLLING_INTERVAL = 30000

export const Chat: FC<ChatPageProps> = ({ currentUserId }) => {
  const t = useTranslations('chat')
  const { personalData } = useLoginStore()
  const effectiveUserId = personalData?.id?.toString() || Cookies.get('userId') || currentUserId

  const [chats, setChats] = useState<ChatType[]>([])
  const [selectedChatId, setSelectedChatId] = useState<string>()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [useWebSocket, setUseWebSocket] = useState(false)
  const searchParams = useSearchParams()

  // Refs for WebSocket channel subscriptions
  const chatChannelsRef = useRef<Map<string, Channel>>(new Map())
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const selectedChat = chats.find(chat => chat.id === selectedChatId)

  // Map backend message to frontend Message type
  const mapMessage = useCallback((m: any, chatId: string): Message => ({
    id: m.id.toString(),
    chatId: chatId,
    senderId: m.sender_id.toString(),
    content: m.content,
    timestamp: new Date(m.created_at),
    isRead: m.is_read,
    status: m.status || 'sent',
    type: 'text'
  }), [])

  // Map backend chat to frontend ChatType
  const mapChat = useCallback((item: any): ChatType => {
    const isMeClient = item.client_id.toString() === effectiveUserId?.toString()
    
    const realClient = {
      id: item.client_id.toString(),
      name: item.client?.name || 'Client',
      role: 'client' as const,
      avatar: item.client?.avatar,
    }
    const realLawyer = {
      id: item.lawyer_id.toString(),
      name: item.lawyer?.name || 'Lawyer',
      role: 'lawyer' as const,
      avatar: item.lawyer?.avatar,
    }

    const lastMessage = item.last_message ? mapMessage(item.last_message, item.id.toString()) : undefined

    return {
      id: item.id.toString(),
      client: isMeClient ? realLawyer : realClient,
      lawyer: isMeClient ? realClient : realLawyer,
      applicationTitle: item.application?.short_description || `Заявка #${item.application_id || '?'}`,
      unreadCount: item.unread_count || 0,
      lastActivity: new Date(item.updated_at),
      messages: [],
      lastMessage,
      hasMore: false,
      oldestId: undefined,
      newestId: undefined,
    }
  }, [effectiveUserId, mapMessage])

  // Fetch chats list
  const fetchChats = useCallback(async () => {
    if (!effectiveUserId) return []
    try {
      const data = await httpClientWithAuth(`${API_URL}/chats`) as any[]
      const mappedChats: ChatType[] = data.map(mapChat)
      
      // Preserve messages from existing chats
      setChats(prev => {
        return mappedChats.map(newChat => {
          const existingChat = prev.find(c => c.id === newChat.id)
          if (existingChat && existingChat.messages.length > 0) {
            return {
              ...newChat,
              messages: existingChat.messages,
              hasMore: existingChat.hasMore,
              oldestId: existingChat.oldestId,
              newestId: existingChat.newestId,
            }
          }
          return newChat
        })
      })
      
      return mappedChats
    } catch (error: any) {
      console.error('Error fetching chats:', error)
      toast.error(`Не удалось загрузить чаты: ${error.message || 'Ошибка сервера'}`)
      return []
    }
  }, [effectiveUserId, mapChat])

  // Handle incoming WebSocket message
  const handleNewMessage = useCallback((event: MessageSentEvent) => {
    const chatId = event.chat_id.toString()
    
    const newMessage: Message = {
      id: event.id.toString(),
      chatId,
      senderId: event.sender_id.toString(),
      content: event.content,
      timestamp: new Date(event.created_at),
      isRead: event.is_read,
      status: event.status,
      type: 'text'
    }

    setChats(prev => prev.map(chat => {
      if (chat.id === chatId) {
        // Check if message already exists (prevent duplicates)
        if (chat.messages.some(m => m.id === newMessage.id)) {
          return chat
        }
        return {
          ...chat,
          messages: [...chat.messages, newMessage],
          lastMessage: newMessage,
          lastActivity: newMessage.timestamp,
          unreadCount: chat.id === selectedChatId ? chat.unreadCount : chat.unreadCount + 1,
          newestId: newMessage.id,
        }
      }
      return chat
    }))
  }, [selectedChatId])

  // Handle message read event
  const handleMessageRead = useCallback((event: MessageReadEvent) => {
    const chatId = event.chat_id.toString()
    const messageIds = event.message_ids.map(id => id.toString())

    setChats(prev => prev.map(chat => {
      if (chat.id === chatId) {
        return {
          ...chat,
          messages: chat.messages.map(msg => {
            if (messageIds.includes(msg.id)) {
              return { ...msg, isRead: true, status: 'read' as const }
            }
            return msg
          })
        }
      }
      return chat
    }))
  }, [])

  // Subscribe to chat channel
  const subscribeToChat = useCallback((chatId: string) => {
    const echo = getEcho()
    if (!echo) return

    // Unsubscribe if already subscribed
    const existingChannel = chatChannelsRef.current.get(chatId)
    if (existingChannel) {
      return // Already subscribed
    }

    try {
      const channel = echo.private(`chat.${chatId}`)
        .listen('.message.sent', (event: MessageSentEvent) => {
          console.log('[WebSocket] Message received:', event)
          handleNewMessage(event)
        })
        .listen('.message.read', (event: MessageReadEvent) => {
          console.log('[WebSocket] Message read:', event)
          handleMessageRead(event)
        })

      chatChannelsRef.current.set(chatId, channel)
      console.log(`[WebSocket] Subscribed to chat.${chatId}`)
    } catch (error) {
      console.error(`[WebSocket] Failed to subscribe to chat.${chatId}:`, error)
    }
  }, [handleNewMessage, handleMessageRead])

  // Unsubscribe from chat channel
  const unsubscribeFromChat = useCallback((chatId: string) => {
    const echo = getEcho()
    if (!echo) return

    const channel = chatChannelsRef.current.get(chatId)
    if (channel) {
      echo.leave(`chat.${chatId}`)
      chatChannelsRef.current.delete(chatId)
      console.log(`[WebSocket] Unsubscribed from chat.${chatId}`)
    }
  }, [])

  // Initialize WebSocket or fallback to polling
  useEffect(() => {
    const echo = getEcho()
    
    if (echo) {
      setUseWebSocket(true)
      console.log('[Chat] Using WebSocket for real-time updates')
    } else {
      setUseWebSocket(false)
      console.log('[Chat] WebSocket not available, using polling fallback')
      
      // Start polling as fallback
      fetchChats()
      pollingIntervalRef.current = setInterval(fetchChats, FALLBACK_POLLING_INTERVAL)
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
      // Cleanup all WebSocket subscriptions
      chatChannelsRef.current.forEach((_, chatId) => {
        unsubscribeFromChat(chatId)
      })
    }
  }, [fetchChats, unsubscribeFromChat])

  // Initial load and subscribe to all chats
  useEffect(() => {
    const initChats = async () => {
      const loadedChats = await fetchChats()
      
      // Subscribe to all chats if WebSocket is available
      if (useWebSocket) {
        loadedChats.forEach(chat => {
          subscribeToChat(chat.id)
        })
      }
    }
    
    initChats()
  }, [fetchChats, useWebSocket, subscribeToChat])

  // Handle URL params for opening specific chat
  useEffect(() => {
    const applicationId = searchParams.get('applicationId')
    const participantId = searchParams.get('participantId')

    if (applicationId && effectiveUserId) {
      const initChat = async () => {
        if (participantId) {
          try {
            const res = await httpClientWithAuth<any>(`${API_URL}/chats`, {
              method: 'POST',
              body: JSON.stringify({
                application_id: applicationId,
                participant_id: participantId
              })
            })
            
            if (res && res.id) {
              await fetchChats()
              setSelectedChatId(res.id.toString())
              
              // Subscribe to the new chat
              if (useWebSocket) {
                subscribeToChat(res.id.toString())
              }
            } else {
              console.error('Chat created but no ID returned', res)
              toast.error('Ошибка: сервер не вернул ID чата')
            }
          } catch (e: any) {
            console.error('Failed to init chat', e)
            toast.error(`Ошибка создания чата: ${e.message || 'Неизвестная ошибка'}`)
          }
        } else {
          await fetchChats()
        }
      }
      initChat()
    }
  }, [searchParams, effectiveUserId, fetchChats, useWebSocket, subscribeToChat])

  // Handle chat selection
  const handleChatSelect = useCallback(async (chatId: string) => {
    setSelectedChatId(chatId)
    setIsMobileOpen(false)
    
    try {
      const data = await httpClientWithAuth(`${API_URL}/chats/${chatId}`) as any
      
      const messages: Message[] = data.messages.map((m: any) => mapMessage(m, chatId))

      setChats(prev => prev.map(c => 
        c.id === chatId 
        ? { 
            ...c, 
            messages,
            unreadCount: 0,
            lastMessage: messages.length > 0 ? messages[messages.length - 1] : undefined,
            hasMore: data.has_more,
            oldestId: data.oldest_id?.toString(),
            newestId: data.newest_id?.toString(),
          } 
        : c
      ))
      
      // Mark messages as read
      httpClientWithAuth(`${API_URL}/chats/${chatId}/read`, { method: 'POST' })
        .catch(e => console.error('Failed to mark as read:', e))

    } catch (error) {
      console.error('Error loading chat:', error)
      toast.error('Не удалось загрузить сообщения')
    }
  }, [mapMessage])

  // Load more messages (pagination)
  const handleLoadMore = useCallback(async () => {
    if (!selectedChatId || !selectedChat?.hasMore || isLoadingMore) return

    setIsLoadingMore(true)
    
    try {
      const oldestId = selectedChat.oldestId
      const url = `${API_URL}/chats/${selectedChatId}?before_id=${oldestId}&limit=30`
      const data = await httpClientWithAuth(url) as any
      
      const olderMessages: Message[] = data.messages.map((m: any) => mapMessage(m, selectedChatId))

      setChats(prev => prev.map(c => {
        if (c.id === selectedChatId) {
          // Prepend older messages
          const existingIds = new Set(c.messages.map(m => m.id))
          const newMessages = olderMessages.filter(m => !existingIds.has(m.id))
          
          return {
            ...c,
            messages: [...newMessages, ...c.messages],
            hasMore: data.has_more,
            oldestId: data.oldest_id?.toString(),
          }
        }
        return c
      }))
    } catch (error) {
      console.error('Error loading more messages:', error)
      toast.error('Не удалось загрузить историю')
    } finally {
      setIsLoadingMore(false)
    }
  }, [selectedChatId, selectedChat, isLoadingMore, mapMessage])

  // Send message
  const handleSendMessage = useCallback(async (content: string) => {
    if (!selectedChatId) return

    const tempId = `temp_${Date.now()}`
    const newMessage: Message = {
      id: tempId,
      chatId: selectedChatId,
      senderId: effectiveUserId?.toString() || '',
      content,
      timestamp: new Date(),
      isRead: false,
      status: 'sent',
      type: 'text'
    }

    // Optimistic update
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

    try {
      const res = await httpClientWithAuth(`${API_URL}/chats/${selectedChatId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content })
      }) as any

      // Update with real message data
      setChats(prev => prev.map(c => {
        if (c.id !== selectedChatId) return c
        return {
          ...c,
          messages: c.messages.map(m => m.id === tempId ? {
            ...m,
            id: res.id.toString(),
            senderId: res.sender_id.toString(),
            status: res.status || 'sent',
          } : m),
          newestId: res.id.toString(),
        }
      }))
    } catch (error: any) {
      console.error('Send failed', error)
      toast.error('Не удалось отправить сообщение')
      
      // Remove failed message
      setChats(prev => prev.map(c => {
        if (c.id !== selectedChatId) return c
        return {
          ...c,
          messages: c.messages.filter(m => m.id !== tempId)
        }
      }))
    }
  }, [selectedChatId, effectiveUserId])

  // Delete chat
  const handleChatDelete = useCallback(async (id: string) => {
    try {
      await httpClientWithAuth(`${API_URL}/chats/${id}`, { method: 'DELETE' })
      
      // Unsubscribe from WebSocket
      unsubscribeFromChat(id)
      
      setChats(prev => prev.filter(c => c.id !== id))
      if (selectedChatId === id) {
        setSelectedChatId(undefined)
      }
      toast.success('Чат удален')
    } catch (e: any) {
      console.error('Failed to delete chat', e)
      toast.error('Не удалось удалить чат')
    }
  }, [selectedChatId, unsubscribeFromChat])

  return (
    <div className={s.container}>
      <div className={`${s.sidebar} ${isMobileOpen ? s.open : ''}`}>
        <div className={s.header}>
          <h2>{t('title') || 'Сообщения'}</h2>
          <button 
            className={s.closeBtn}
            onClick={() => setIsMobileOpen(false)}
          >
            <X size={24} />
          </button>
        </div>
        
        <ChatList
          chats={chats}
          selectedChatId={selectedChatId}
          onChatSelect={handleChatSelect}
          onChatDelete={handleChatDelete}
        />
      </div>

      <div className={s.main}>
        <div className={s.mobileHeader}>
          <button onClick={() => setIsMobileOpen(true)}>
            <Menu size={24} />
          </button>
          <h2>{selectedChat ? selectedChat.client.name : (t('title') || 'Сообщения')}</h2>
        </div>

        {selectedChatId ? (
          <div className={s.chatWindow}>
            <ChatWindow
              chat={selectedChat}
              currentUserId={effectiveUserId?.toString() || ''}
              onSendMessage={handleSendMessage}
              onLoadMore={handleLoadMore}
              isLoadingMore={isLoadingMore}
              hasMore={selectedChat?.hasMore}
              onBack={() => setIsMobileOpen(true)}
            />
          </div>
        ) : (
          <div className={s.emptyState}>
            <MessageCircle size={48} />
            <p>{t('selectChat') || 'Выберите чат'}</p>
          </div>
        )}
      </div>
    </div>
  )
}
