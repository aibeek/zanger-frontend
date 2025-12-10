'use client'

import { useState, useEffect, useRef, type ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import s from './page.module.scss'
import { httpClientWithAuth } from '@/shared/api/httpClient'
import { API_URL } from '@/shared/config'
import Cookies from 'js-cookie'
import { useLoginStore } from '@/features/auth/login'
 

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
    const messagesContainerRef = useRef<HTMLDivElement>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const [menuOpenId, setMenuOpenId] = useState<number | null>(null)
    const [showArchivedModal, setShowArchivedModal] = useState(false)
    const [showDeletedModal, setShowDeletedModal] = useState(false)
    const [archivedConversations, setArchivedConversations] = useState<Conversation[]>([])
    const [deletedConversations, setDeletedConversations] = useState<Conversation[]>([])
    const [confirmState, setConfirmState] = useState<{ type: 'rename' | 'archive' | 'delete' | null, id: number | null }>(() => ({ type: null, id: null }))
    const [renameInput, setRenameInput] = useState('')
    const { personalData } = useLoginStore()
    const isAuthenticated = !!personalData
    const [showBanner, setShowBanner] = useState(true)

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
            const data = await httpClientWithAuth<Conversation[]>(`${API_URL}/conversations?status=active`, {
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

    const fetchByStatus = async (status: 'archived' | 'deleted') => {
        try {
            const data = await httpClientWithAuth<Conversation[]>(`${API_URL}/conversations?status=${status}`, {
                headers: getHeaders()
            })
            if (status === 'archived') setArchivedConversations(data)
            else setDeletedConversations(data)
        } catch (error) {
            console.error('Failed to fetch by status', error)
        }
    }

    const renameConversation = async (id: number, title: string) => {
        if (!title.trim()) return
        try {
            await httpClientWithAuth(`${API_URL}/conversations/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ title }),
                headers: getHeaders()
            })
            fetchConversations()
        } catch (error) {
            console.error('Failed to rename conversation', error)
        }
    }

    const shareConversation = async (id: number) => {
        try {
            const data = await httpClientWithAuth<{ share_token: string }>(`${API_URL}/conversations/${id}/share`, {
                method: 'POST',
                headers: getHeaders()
            })
            const url = `${API_URL}/conversations/share/${data.share_token}`
            await navigator.clipboard.writeText(url)
            alert('Ссылка скопирована')
        } catch (error) {
            console.error('Failed to share conversation', error)
        }
    }

    const archiveConversation = async (id: number) => {
        try {
            await httpClientWithAuth(`${API_URL}/conversations/${id}/archive`, {
                method: 'POST',
                headers: getHeaders()
            })
            fetchConversations()
        } catch (error) {
            console.error('Failed to archive conversation', error)
        }
    }

    const deleteConversation = async (id: number) => {
        try {
            await httpClientWithAuth(`${API_URL}/conversations/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            })
            fetchConversations()
        } catch (error) {
            console.error('Failed to delete conversation', error)
        }
    }

    const unarchiveConversation = async (id: number) => {
        try {
            await httpClientWithAuth(`${API_URL}/conversations/${id}/unarchive`, {
                method: 'POST',
                headers: getHeaders()
            })
            fetchByStatus('archived')
            fetchConversations()
        } catch (error) {
            console.error('Failed to unarchive conversation', error)
        }
    }

    const restoreConversation = async (id: number) => {
        try {
            await httpClientWithAuth(`${API_URL}/conversations/${id}/restore`, {
                method: 'POST',
                headers: getHeaders()
            })
            fetchByStatus('deleted')
            fetchConversations()
        } catch (error) {
            console.error('Failed to restore conversation', error)
        }
    }

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return

        setSending(true)
        const content = inputValue
        setInputValue('')

        let chatId = currentChatId

        if (!chatId) {
            const newChat = await createConversation()
            if (newChat) {
                chatId = newChat.id
                setCurrentChatId(chatId)
                setMessages([{ id: Date.now(), role: 'user', content, created_at: new Date().toISOString() }])
            } else {
                setSending(false)
                return
            }
        } else {
            setMessages(prev => [...prev, { id: Date.now(), role: 'user', content, created_at: new Date().toISOString() }])
        }

        try {
            const response = await httpClientWithAuth<Message>(`${API_URL}/conversations/${chatId}/messages`, {
                method: 'POST',
                body: JSON.stringify({ content }),
                headers: getHeaders()
            })
            setMessages(prev => [...prev, response])
            fetchConversations()
            fetchMessages(chatId)

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
        const onDocClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement
            if (target.closest(`.${s.dropdown}`)) return
            setMenuOpenId(null)
        }
        document.addEventListener('click', onDocClick)
        return () => document.removeEventListener('click', onDocClick)
    }, [])

    useEffect(() => {
        const el = messagesContainerRef.current
        if (el) {
            el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
        }
    }, [messages])

    return (
        <div className={s.profileContent}>
            <div className={s.profileSettings}>
                <div className={s.chatArea}>
                    <div className={s.chatHeader}>
                        <div className={s.headerActions}>
                            <button className={s.headerBtn} onClick={() => { setShowArchivedModal(true); fetchByStatus('archived') }}>Архивированные</button>
                            <button className={s.headerBtn} onClick={() => { setShowDeletedModal(true); fetchByStatus('deleted') }}>Удаленные</button>
                        </div>
                    </div>
                    {showBanner && (
                        <div className={s.infoBanner}>
                            <div className={s.bannerIcon}>ℹ️</div>
                            <div className={s.bannerContent}>
                                <h4 className={s.bannerTitle}>Информация</h4>
                                <p className={s.bannerDescription}>Внимание.  При взаимодействии с данным сервисом используется система, работающая на основе искусственного интеллекта.</p>
                                <p className={s.bannerDescription}>В соответствии с Закон Республики Казахстан «Об искусственном интеллекте» пользователю предоставляется вся необходимая информация о том, что используется ИИ.</p>
                                <p className={s.bannerDescription}>При этом персональные данные не используются / не обрабатываются (или: используются только в объёме, заранее согласованном с пользователем, и в соответствии с законодательством о защите данных).</p>
                                <p className={s.bannerDescription}>Если вы не даёте согласия — вы вправе отказаться от использования ИИ-функций.</p>
                            </div>
                            <button className={s.bannerCloseBtn} onClick={() => setShowBanner(false)} aria-label="Скрыть">Скрыть</button>
                        </div>
                    )}
                    <div className={s.messages} ref={messagesContainerRef}>
                        {!currentChatId && messages.length === 0 ? (
                            <div className={s.emptyState}>
                                <h3>ИИ-Консультант</h3>
                                <p>Задайте свой вопрос по законодательству РК</p>
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div key={msg.id} className={`${s.message} ${s[msg.role]}`}>
                                    <MessageContent content={msg.content} />
                                </div>
                            ))
                        )}
                        {loading && <div className={s.message + ' ' + s.system}>Загрузка истории...</div>}
                        {sending && (
                            <div className={s.message + ' ' + s.assistant}>
                                <div className={s.typingIndicator}>
                                    <span className={s.typingDot}></span>
                                    <span className={s.typingDot}></span>
                                    <span className={s.typingDot}></span>
                                </div>
                            </div>
                        )}
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

                <div className={s.sidebar}>
                    <div className={s.sidebarHeader}>
                        <div>Ваши чаты</div>
                    </div>
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
                                <span className={s.historyTitle}>{chat.title || 'Новый чат'}</span>
                                <span className={s.dropdown} onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === chat.id ? null : chat.id) }}>
                                    <button className={s.kebabBtn}>⋯</button>
                                    {menuOpenId === chat.id && (
                                        <div className={s.dropdownMenu}>
                                            <div className={s.dropdownItem} onClick={(e) => { e.stopPropagation(); setMenuOpenId(null); setConfirmState({ type: 'rename', id: chat.id }); setRenameInput(chat.title || '') }}>Переименовать</div>
                                            <div className={s.dropdownItem} onClick={(e) => { e.stopPropagation(); setMenuOpenId(null); shareConversation(chat.id) }}>Поделиться</div>
                                            <div className={s.dropdownItem} onClick={(e) => { e.stopPropagation(); setMenuOpenId(null); setConfirmState({ type: 'archive', id: chat.id }) }}>Архивировать</div>
                                            <div className={`${s.dropdownItem} ${s.dropdownItemDanger}`} onClick={(e) => { e.stopPropagation(); setMenuOpenId(null); setConfirmState({ type: 'delete', id: chat.id }) }}>Удалить</div>
                                        </div>
                                    )}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {showArchivedModal && (
                <div className={s.modalOverlay} onClick={() => setShowArchivedModal(false)}>
                    <div className={s.modal} onClick={(e) => e.stopPropagation()}>
                        <h3>Архивированные</h3>
                        {archivedConversations.length === 0 ? (
                            <div className={s.emptyState}>Пусто</div>
                        ) : (
                            <div className={s.historyList}>
                                {archivedConversations.map((c) => (
                                    <div key={c.id} className={s.historyItem}>
                                        <span className={s.historyTitle}>{c.title || 'Без названия'}</span>
                                        <span className={s.dropdown}>
                                            <button className={s.kebabBtn} onClick={() => unarchiveConversation(c.id)}>Разархивировать</button>
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
            {showDeletedModal && (
                <div className={s.modalOverlay} onClick={() => setShowDeletedModal(false)}>
                    <div className={s.modal} onClick={(e) => e.stopPropagation()}>
                        <h3>Удаленные</h3>
                        {deletedConversations.length === 0 ? (
                            <div className={s.emptyState}>Пусто</div>
                        ) : (
                            <div className={s.historyList}>
                                {deletedConversations.map((c) => (
                                    <div key={c.id} className={s.historyItem}>
                                        <span className={s.historyTitle}>{c.title || 'Без названия'}</span>
                                        <span className={s.dropdown}>
                                            <button className={s.kebabBtn} onClick={() => restoreConversation(c.id)}>Восстановить</button>
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {confirmState.type && confirmState.id && (
                <div className={s.modalOverlay} onClick={() => setConfirmState({ type: null, id: null })}>
                    <div className={s.modal} onClick={(e) => e.stopPropagation()}>
                        {confirmState.type === 'rename' ? (
                            <>
                                <div className={s.confirmModalTitle}>Переименовать чат</div>
                                <input value={renameInput} onChange={e => setRenameInput(e.target.value)} className={s.input} />
                                <div className={s.confirmModalActions}>
                                    <button className={s.confirmBtn} onClick={() => setConfirmState({ type: null, id: null })}>Отмена</button>
                                    <button className={`${s.confirmBtn} ${s.confirmBtnPrimary}`} onClick={() => { if (confirmState.id) renameConversation(confirmState.id, renameInput); setConfirmState({ type: null, id: null }) }}>Сохранить</button>
                                </div>
                            </>
                        ) : confirmState.type === 'archive' ? (
                            <>
                                <div className={s.confirmModalTitle}>Вы хотите архивировать чат?</div>
                                <div className={s.confirmModalActions}>
                                    <button className={s.confirmBtn} onClick={() => setConfirmState({ type: null, id: null })}>Отмена</button>
                                    <button className={`${s.confirmBtn} ${s.confirmBtnPrimary}`} onClick={() => { if (confirmState.id) archiveConversation(confirmState.id); setConfirmState({ type: null, id: null }) }}>Архивировать</button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className={s.confirmModalTitle}>Вы хотите удалить чат?</div>
                                <div className={s.confirmModalActions}>
                                    <button className={s.confirmBtn} onClick={() => setConfirmState({ type: null, id: null })}>Отмена</button>
                                    <button className={`${s.confirmBtn} ${s.confirmBtnDanger}`} onClick={() => { if (confirmState.id) deleteConversation(confirmState.id); setConfirmState({ type: null, id: null }) }}>Удалить</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
    const renderStrong = (text: string) => {
        const parts = text.split(/\*\*(.*?)\*\*/)
        const nodes: (string | ReactNode)[] = []
        for (let i = 0; i < parts.length; i++) {
            if (i % 2 === 1) nodes.push(<strong key={i}>{parts[i]}</strong>)
            else if (parts[i]) nodes.push(parts[i])
        }
        return nodes
    }

    const MessageContent = ({ content }: { content: string }) => {
        const trimmed = content.trim()
        const lines = trimmed.split(/\n/)
        const orderedRegex = /^\s*\d+[\.)]?\s+(.*)$/
        const unorderedRegex = /^\s*[-•]\s+(.*)$/

        const nodes: ReactNode[] = []
        let i = 0

        const pushParagraph = (text: string) => {
            if (!text) return
            const paragraphs = text.split(/\n\n+/)
            paragraphs.forEach((p, idx) => nodes.push(<p key={`p-${nodes.length}-${idx}`}>{renderStrong(p)}</p>))
        }

        while (i < lines.length) {
            // skip extra blank lines
            if (!lines[i].trim()) { i++; continue }

            // detect list block
            const isOrdered = orderedRegex.test(lines[i])
            const isUnordered = unorderedRegex.test(lines[i])

            if (isOrdered || isUnordered) {
                const items: string[] = []
                const start = i
                while (i < lines.length) {
                    const mOrd = lines[i].match(orderedRegex)
                    const mUnord = lines[i].match(unorderedRegex)
                    if (mOrd && isOrdered) { items.push(mOrd[1]); i++; continue }
                    if (mUnord && isUnordered) { items.push(mUnord[1]); i++; continue }
                    break
                }
                nodes.push(
                    (isOrdered ? (
                        <ol key={`ol-${start}`}>
                            {items.map((li, idx) => (<li key={idx}>{renderStrong(li)}</li>))}
                        </ol>
                    ) : (
                        <ul key={`ul-${start}`}>
                            {items.map((li, idx) => (<li key={idx}>{renderStrong(li)}</li>))}
                        </ul>
                    ))
                )
                continue
            }

            // accumulate paragraph until a blank line or a list starts
            const buf: string[] = []
            while (i < lines.length) {
                if (!lines[i].trim()) { i++; break }
                if (orderedRegex.test(lines[i]) || unorderedRegex.test(lines[i])) break
                buf.push(lines[i])
                i++
            }
            pushParagraph(buf.join('\n'))
        }

        return <div className={s.messageContent}>{nodes}</div>
    }
