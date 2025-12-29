'use client'

import { FC, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Cookies from 'js-cookie'
import { useLoginStore } from '@/features/auth/login'
import { ChatList } from '../ChatList/ui/ChatList'
import { ChatWindow } from '../ChatWindow/ui/ChatWindow'
import { Chat as ChatType, Message } from '../types'
import s from './Chat.module.scss'
import { httpClientWithAuth } from '@/shared/api/httpClient'
import toast from 'react-hot-toast'
import { API_URL } from '@/shared/config/env'
import { Menu, X, MessageCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface ChatPageProps {
  currentUserId?: string
}

export const Chat: FC<ChatPageProps> = ({ currentUserId }) => {
  const t = useTranslations('chat')
  const { personalData } = useLoginStore()
  // Determine effective User ID (from props or login store)
  const effectiveUserId = personalData?.id?.toString() || Cookies.get('userId') || currentUserId

  const [chats, setChats] = useState<ChatType[]>([])
  const [selectedChatId, setSelectedChatId] = useState<string>()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()

  const selectedChat = chats.find(chat => chat.id === selectedChatId)

  // Fetch Chats from API
  const fetchChats = async () => {
    if (!effectiveUserId) return []
    try {
        const data = await httpClientWithAuth(`${API_URL}/chats`)
        // Map backend data to frontend ChatType
        const mappedChats: ChatType[] = data.map((item: any) => {
            const isMeClient = item.client_id.toString() === effectiveUserId.toString()
            
            // "Swap Strategy": The UI components (ChatList, ChatWindow) hardcode `chat.client` as the person to display.
            // So we put the "Other Person" into the `client` slot of the frontend model.
            // And "Me" into the `lawyer` slot.
            
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

            return {
                id: item.id.toString(),
                // If I am client, I want to see Lawyer. Put Lawyer in 'client' slot.
                // If I am lawyer, I want to see Client. Put Client in 'client' slot.
                client: isMeClient ? realLawyer : realClient, 
                lawyer: isMeClient ? realClient : realLawyer,
                
                applicationTitle: item.application?.short_description || `Заявка #${item.application_id || '?'}`,
                unreadCount: item.unread_count || 0,
                lastActivity: new Date(item.updated_at),
                messages: [], // Messages loaded on select
                lastMessage: item.messages_count > 0 ? {
                    // Placeholder for last message if not loaded fully
                    id: 'last',
                    chatId: item.id.toString(),
                    senderId: 'unknown',
                    content: '...',
                    timestamp: new Date(item.updated_at),
                    isRead: true, 
                    type: 'text'
                } : undefined
            }
        })
        setChats(mappedChats)
        return mappedChats
    } catch (error: any) {
        console.error('Error fetching chats:', error)
        toast.error(`Не удалось загрузить чаты: ${error.message || 'Ошибка сервера'}`)
        return []
    }
  }

  // Load chats on mount
  useEffect(() => {
    fetchChats()
    // Poll every 5s
    const interval = setInterval(fetchChats, 5000)
    return () => clearInterval(interval)
  }, [effectiveUserId])

  // Handle URL params
  useEffect(() => {
    const applicationId = searchParams.get('applicationId')
    const participantId = searchParams.get('participantId')

    if (applicationId && effectiveUserId) {
        const initChat = async () => {
             // 1. Check if we already have it in the list (by checking title/applicationId if possible, or just rely on IDs)
             // However, checking by ID is safer.
             // But we don't have application_id in the Chat interface cleanly to check.
             // So we just call the API "Get or Create" which is safe.
             
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
                     } else {
                         console.error('Chat created but no ID returned', res)
                         toast.error('Ошибка: сервер не вернул ID чата')
                     }
                 } catch (e: any) {
                     console.error('Failed to init chat', e)
                     toast.error(`Ошибка создания чата: ${e.message || 'Неизвестная ошибка'}. Возможно, вы подключены не к тому серверу?`)
                 }
             } else {
                 await fetchChats()
             }
        }
        initChat()
    }
  }, [searchParams, effectiveUserId])

  const handleChatSelect = async (chatId: string) => {
    setSelectedChatId(chatId)
    setIsMobileOpen(false)
    
    // Fetch full details
    try {
        const data = await httpClientWithAuth(`${API_URL}/chats/${chatId}`)
        // data: { chat, messages }
        
        const messages: Message[] = data.messages.map((m: any) => ({
            id: m.id.toString(),
            chatId: chatId,
            senderId: m.sender_id.toString(),
            content: m.content,
            timestamp: new Date(m.created_at),
            isRead: m.is_read,
            type: 'text'
        }))

        setChats(prev => prev.map(c => 
            c.id === chatId 
            ? { 
                ...c, 
                messages: messages, 
                unreadCount: 0,
                lastMessage: messages.length > 0 ? messages[messages.length - 1] : undefined
              } 
            : c
        ))
        
        // Mark read
        httpClientWithAuth(`${API_URL}/chats/${chatId}/read`, { method: 'POST' })
            .catch(e => console.error(e))

    } catch (error) {
        console.error('Error details:', error)
    }
  }

  const handleSendMessage = async (content: string) => {
    if (!selectedChatId) return

    const tempId = `temp_${Date.now()}`
    const newMessage: Message = {
      id: tempId,
      chatId: selectedChatId,
      senderId: effectiveUserId?.toString() || '',
      content,
      timestamp: new Date(),
      isRead: false,
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

    try {
        const res = await httpClientWithAuth(`${API_URL}/chats/${selectedChatId}/messages`, {
            method: 'POST',
            body: JSON.stringify({ content })
        })
        // Update ID
        const savedMsg = res
        setChats(prev => prev.map(c => {
             if (c.id !== selectedChatId) return c
             return {
                 ...c,
                 messages: c.messages.map(m => m.id === tempId ? { 
                     ...m, 
                     id: savedMsg.id.toString(), 
                     senderId: savedMsg.sender_id.toString() 
                 } : m)
             }
        }))
    } catch (error) {
        console.error('Send failed', error)
    }
  }

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
            onChatDelete={async (id) => {
                try {
                    await httpClientWithAuth(`${API_URL}/chats/${id}`, { method: 'DELETE' })
                    setChats(prev => prev.filter(c => c.id !== id))
                    if (selectedChatId === id) setSelectedChatId(undefined)
                    toast.success('Чат удален')
                } catch (e: any) {
                    console.error('Failed to delete chat', e)
                    toast.error('Не удалось удалить чат')
                }
            }}
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
                onBack={() => setIsMobileOpen(true)} // Or clear selection
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