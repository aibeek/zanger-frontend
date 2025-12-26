'use client'

import { useState, useEffect, useRef, type ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import s from './page.module.scss'
import { httpClientWithAuth } from '@/shared/api/httpClient'
import { API_URL } from '@/shared/config'
import Cookies from 'js-cookie'
import { useLoginStore } from '@/features/auth/login'
import { Modal, Button } from '@/shared/ui-kit'
import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
 
 

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
    const [elapsedTime, setElapsedTime] = useState(0)
    const [responseTime, setResponseTime] = useState<number | null>(null)
    const messagesContainerRef = useRef<HTMLDivElement>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const [menuOpenId, setMenuOpenId] = useState<number | null>(null)
    const [showArchivedModal, setShowArchivedModal] = useState(false)
    const [showDeletedModal, setShowDeletedModal] = useState(false)
    const [archivedConversations, setArchivedConversations] = useState<Conversation[]>([])
    const [deletedConversations, setDeletedConversations] = useState<Conversation[]>([])
    const [confirmState, setConfirmState] = useState<{ type: 'rename' | 'archive' | 'delete' | null, id: number | null }>(() => ({ type: null, id: null }))
    const [renameInput, setRenameInput] = useState('')
    const { personalData } = useLoginStore()
    const isAuthenticated = !!personalData
    const locale = useLocale()
    const router = useRouter()
    // const [showBanner, setShowBanner] = useState(true)

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
        setElapsedTime(0)
        setResponseTime(null)
        
        // Start timer
        const startTime = Date.now()
        timerRef.current = setInterval(() => {
            setElapsedTime(Math.floor((Date.now() - startTime) / 1000))
        }, 1000)
        
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
            
            // Stop timer and save response time
            if (timerRef.current) {
                clearInterval(timerRef.current)
                timerRef.current = null
            }
            const finalTime = Math.floor((Date.now() - startTime) / 1000)
            setResponseTime(finalTime)
            
            // Add response time message
            const responseTimeMsg: Message = {
                id: Date.now() + 1,
                role: 'system',
                content: `*Ответ получен за ${finalTime}с*`,
                created_at: new Date().toISOString()
            }
            
            setMessages(prev => [...prev, response, responseTimeMsg])
            fetchConversations()
            fetchMessages(chatId)

        } catch (error) {
            console.error('Failed to send message', error)
            // Stop timer on error too
            if (timerRef.current) {
                clearInterval(timerRef.current)
                timerRef.current = null
            }
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

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current)
            }
        }
    }, [])

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
                    {/* Уведомление об ИИ скрыто */}
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
                                <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
                                    Обработка запроса... {elapsedTime}с
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
    const SITE_NAME_MAP: Record<string, string> = {
        'adilet.zan.kz': 'Adilet',
        'online.zakon.kz': 'Zakon.kz',
        'gov.kz': 'GOV.KZ',
        'zan.gov.kz': 'Zan.gov.kz'
    }

    const renderStrong = (text: string) => {
        const parts = text.split(/\*\*(.*?)\*\*/)
        const nodes: (string | ReactNode)[] = []
        for (let i = 0; i < parts.length; i++) {
            if (i % 2 === 1) {
                // Внутри ** - жирный текст
                nodes.push(<strong key={`str-${i}`}>{parts[i]}</strong>)
            } else if (parts[i]) {
                // Обычный текст - НЕ жирный
                nodes.push(parts[i])
            }
        }
        return nodes
    }

    const renderInline = (text: string) => {
        const nodes: (string | ReactNode)[] = []
        const mdLinkRe = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g
        let lastIndex = 0

        for (const match of text.matchAll(mdLinkRe)) {
            const full = match[0]
            const label = match[1]
            const url = match[2]
            const start = match.index ?? 0
            if (start > lastIndex) {
                const before = text.slice(lastIndex, start)
                nodes.push(...renderStrong(before))
            }
            const cleanLabel = label.replace(/^\s*\*\*/, '').replace(/\*\*\s*$/, '')
            nodes.push(
                <a key={`lnk-${start}`} href={url} target="_blank" rel="noopener noreferrer">
                    {cleanLabel}
                </a>
            )
            lastIndex = start + full.length
        }

        const tail = text.slice(lastIndex)
        const urlRe = /(https?:\/\/[^\s]+)/g
        let offset = 0
        for (const m of tail.matchAll(urlRe)) {
            const st = m.index ?? 0
            const url = m[1]
            if (st > offset) {
                const before = tail.slice(offset, st)
                nodes.push(...renderStrong(before))
            }
            let hostName = url
            try { hostName = new URL(url).hostname } catch {}
            const siteName = SITE_NAME_MAP[hostName] || hostName.replace(/^www\./, '').split('.')[0].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
            nodes.push(
                <a key={`url-${lastIndex + st}`} href={url} target="_blank" rel="noopener noreferrer">
                    {siteName}
                </a>
            )
            offset = st + m[0].length
        }
        const rest = tail.slice(offset)
        if (rest) nodes.push(...renderStrong(rest))
        return nodes
    }

    const MessageContent = ({ content }: { content: string }) => {
        const trimmed = content.trim().replace(/\r/g, '')
        const lines = trimmed.split(/\n/)

        const nodes: ReactNode[] = []
        let i = 0

        while (i < lines.length) {
            // skip extra blank lines
            if (!lines[i].trim()) { i++; continue }

            // horizontal rule (--- or ***)
            if (/^\s*[-*]{3,}\s*$/.test(lines[i])) {
                nodes.push(<hr key={`hr-${i}`} className={s.hr} />)
                i++
                continue
            }

            // heading with ### or ** at start and end
            const headingHashMatch = lines[i].match(/^\s*(#{1,6})\s+(.+)$/)
            const headingBoldMatch = lines[i].match(/^\s*\*\*(.+?)\*\*\s*$/)
            
            if (headingHashMatch) {
                const level = Math.min(headingHashMatch[1].length, 6)
                const text = headingHashMatch[2].trim()
                const content = renderInline(text)
                
                switch (level) {
                    case 1: nodes.push(<h1 key={`h-${i}`}>{content}</h1>); break
                    case 2: nodes.push(<h2 key={`h-${i}`}>{content}</h2>); break
                    case 3: nodes.push(<h3 key={`h-${i}`}>{content}</h3>); break
                    case 4: nodes.push(<h4 key={`h-${i}`}>{content}</h4>); break
                    case 5: nodes.push(<h5 key={`h-${i}`}>{content}</h5>); break
                    case 6: nodes.push(<h6 key={`h-${i}`}>{content}</h6>); break
                }
                i++
                continue
            }

            if (headingBoldMatch) {
                const text = headingBoldMatch[1].trim()
                nodes.push(<h3 key={`h-bold-${i}`}>{renderInline(text)}</h3>)
                i++
                continue
            }

            // detect list block
            const orderedRegex = /^\s*\d+[\.)]?\s+(.*)$/
            const unorderedRegex = /^\s*[-•]\s+(.*)$/

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
                            {items.map((li, idx) => (<li key={idx}>{renderInline(li)}</li>))}
                        </ol>
                    ) : (
                        <ul key={`ul-${start}`}>
                            {items.map((li, idx) => (<li key={idx}>{renderInline(li)}</li>))}
                        </ul>
                    ))
                )
                continue
            }

            // accumulate single paragraph until blank line or special element
            const paragraphLines: string[] = []
            while (i < lines.length) {
                if (!lines[i].trim()) break // blank line ends paragraph
                if (/^\s*[-*]{3,}\s*$/.test(lines[i])) break // horizontal rule
                if (/^\s*(#{1,6})\s+/.test(lines[i])) break // heading with ###
                if (/^\s*\*\*(.+?)\*\*\s*$/.test(lines[i])) break // heading with **
                if (orderedRegex.test(lines[i]) || unorderedRegex.test(lines[i])) break // list
                paragraphLines.push(lines[i])
                i++
            }
            
            if (paragraphLines.length > 0) {
                const paragraphText = paragraphLines.join('\n')
                nodes.push(<p key={`p-${i}`}>{renderInline(paragraphText)}</p>)
            }
        }

        return <div className={s.messageContent}>{nodes}</div>
    }
