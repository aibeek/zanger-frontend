'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import s from './page.module.scss'
import { httpClientWithAuth } from '@/shared/api/httpClient'
import { API_URL } from '@/shared/config'
import Cookies from 'js-cookie'
import { useLoginStore } from '@/features/auth/login'
import { RightWidgets } from '../components/RightWidgets'

interface Message {
    id: number
    role: 'user' | 'assistant' | 'system'
    content: string
    created_at: string
}

interface Conversation {
    id: number
    title: string
    updated_at: string
}

export default function AiConsultantPage() {
    const t = useTranslations('lending.modulesSection.modules')
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [currentChatId, setCurrentChatId] = useState<number | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [inputValue, setInputValue] = useState('')
    const [loading, setLoading] = useState(false)
    const [sending, setSending] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const { isAuthenticated } = useLoginStore()

    // Guest Token Logic
    useEffect(() => {
        let guestToken = Cookies.get('guest_token')
        if (!guestToken && !isAuthenticated) {
            guestToken = Math.random().toString(36).substring(2) + Date.now().toString(36)
            Cookies.set('guest_token', guestToken, { expires: 365 })
        }
    }, [isAuthenticated])

    const getHeaders = () => {
        const headers: Record<string, string> = {}
        const guestToken = Cookies.get('guest_token')
        if (guestToken) {
            headers['X-Guest-Token'] = guestToken
        }
        return headers
    }

    const fetchConversations = async () => {
        try {
            const data = await httpClientWithAuth<Conversation[]>(`${API_URL}/conversations`, {
                headers: getHeaders()
            })
            setConversations(data)
        } catch (error) {
            console.error('Failed to fetch conversations', error)
        }
    }

    const fetchMessages = async (id: number) => {
        setLoading(true)
        try {
            const data = await httpClientWithAuth<Message[]>(`${API_URL}/conversations/${id}`, {
                 headers: getHeaders()
            })
            setMessages(data)
            setCurrentChatId(id)
        } catch (error) {
            console.error('Failed to fetch messages', error)
        } finally {
            setLoading(false)
        }
    }

    const createConversation = async (content?: string) => {
        try {
            const data = await httpClientWithAuth<Conversation>(`${API_URL}/conversations`, {
                method: 'POST',
                body: JSON.stringify({ content }),
                headers: getHeaders()
            })
            setConversations(prev => [data, ...prev])
            return data
        } catch (error) {
            console.error('Failed to create conversation', error)
            return null
        }
    }

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return

        setSending(true)
        const content = inputValue
        setInputValue('')

        let chatId = currentChatId

        if (!chatId) {
            // Create new chat first
            const newChat = await createConversation(content)
            if (newChat) {
                chatId = newChat.id
                setCurrentChatId(chatId)
                // Optimistically add message
                setMessages([{ id: Date.now(), role: 'user', content, created_at: new Date().toISOString() }])
            } else {
                setSending(false)
                return
            }
        } else {
            // Optimistically add message
            setMessages(prev => [...prev, { id: Date.now(), role: 'user', content, created_at: new Date().toISOString() }])
        }

        try {
            const response = await httpClientWithAuth<Message>(`${API_URL}/conversations/${chatId}/messages`, {
                method: 'POST',
                body: JSON.stringify({ content }),
                headers: getHeaders()
            })
            setMessages(prev => [...prev.filter(m => m.id !== response.id), response]) // Replace optimistic if IDs collide or just append
            
            // Refresh list to update titles/sorting
            fetchConversations()
            
            // If we just created the chat, we need to fetch the assistant response which came from sendMessage endpoint
            // Wait, my backend logic: sendMessage returns the AI message.
            // But I also need to display the user message I sent.
            // The backend saves the user message too.
            // If I optimistically added the user message, I should append the AI message.
            setMessages(prev => [...prev, response])

        } catch (error) {
            console.error('Failed to send message', error)
        } finally {
            setSending(false)
        }
    }

    useEffect(() => {
        fetchConversations()
    }, [])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    return (
        <div className={s.profileContent}>
            <div className={s.profileSettings}>
                <div className={s.sidebar}>
                    <button className={s.newChatBtn} onClick={() => {
                        setCurrentChatId(null)
                        setMessages([])
                    }}>
                        + Новый чат
                    </button>
                    <div className={s.historyList}>
                        {conversations.map(chat => (
                            <div 
                                key={chat.id} 
                                className={`${s.historyItem} ${currentChatId === chat.id ? s.active : ''}`}
                                onClick={() => fetchMessages(chat.id)}
                            >
                                {chat.title || 'Новый чат'}
                            </div>
                        ))}
                    </div>
                </div>

                <div className={s.chatArea}>
                    <div className={s.messages}>
                        {!currentChatId && messages.length === 0 ? (
                            <div className={s.emptyState}>
                                <h3>ИИ-Консультант</h3>
                                <p>Задайте свой вопрос по законодательству РК</p>
                            </div>
                        ) : (
                            messages.map((msg, idx) => (
                                <div key={idx} className={`${s.message} ${s[msg.role]}`}>
                                    {msg.content}
                                </div>
                            ))
                        )}
                        {loading && <div className={s.message + ' ' + s.system}>Загрузка истории...</div>}
                        {sending && <div className={s.message + ' ' + s.assistant}>Печатает...</div>}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className={s.inputArea}>
                        <textarea 
                            className={s.input}
                            placeholder="Введите ваш вопрос..."
                            value={inputValue}
                            onChange={e => setInputValue(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault()
                                    handleSendMessage()
                                }
                            }}
                        />
                        <button 
                            className={s.sendBtn} 
                            onClick={handleSendMessage}
                            disabled={sending || !inputValue.trim()}
                        >
                            Отправить
                        </button>
                    </div>
                </div>
            </div>
            <RightWidgets />
        </div>
    )
}
