'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import { useLoginStore } from '@/features/auth/login'
import { Modal, Button } from '@/shared/ui-kit'
import Image from 'next/image'
import { httpClientWithAuth } from '@/shared/api/httpClient'
import { API_URL, VIDEO_API_BASE_URL } from '@/shared/config'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import s from './RightWidgets.module.scss'

interface ActiveStream {
    id: string
    code: string
    topic: string
    type: string
    createdAt: string
    plannedTime?: string
    views?: number,
    previewUrl?: string
}

interface RightWidgetsProps {
    hideActiveStreams?: boolean
}

export const RightWidgets = ({ hideActiveStreams = false }: RightWidgetsProps) => {
    const t = useTranslations()
    const locale = useLocale()
    const pathname = usePathname()
    const router = useRouter()
    const isVCPage = Boolean(pathname && pathname.includes('/dashboard/video-conference'))
    const [mounted, setMounted] = useState(false)
    const [currentDate, setCurrentDate] = useState<number | null>(null)
    const [currentMonth, setCurrentMonth] = useState<string>('')
    const { personalData } = useLoginStore()
    const [isScheduleOpen, setIsScheduleOpen] = useState(false)
    const [scheduleType, setScheduleType] = useState<'consultation' | 'meeting'>('consultation')
    const [topic, setTopic] = useState('')
    const [plannedDate, setPlannedDate] = useState('')
    const [plannedTime, setPlannedTime] = useState('')
    const [scheduling, setScheduling] = useState(false)
    const [scheduledCode, setScheduledCode] = useState<string>('')
    const [scheduledLink, setScheduledLink] = useState<string>('')
    const [scheduledData, setScheduledData] = useState<any | null>(null)
    const [activeStreams, setActiveStreams] = useState<ActiveStream[]>([])
    const [loadingStreams, setLoadingStreams] = useState(false)
    const role = Cookies.get('role')
    const BASE = `${API_URL}/livekit`
    const VIDEO_BASE = `${VIDEO_API_BASE_URL}/java-api`
    
    const monthNames = [
        'january', 'february', 'march', 'april', 'may', 'june',
        'july', 'august', 'september', 'october', 'november', 'december'
    ]
    useEffect(() => { setMounted(true) }, [])
    useEffect(() => {
        if (!mounted) return
        const today = new Date()
        setCurrentDate(today.getDate())
        const currentMonthKey = monthNames[today.getMonth()]
        let m
        try {
            m = t(`months.${currentMonthKey}`)
        } catch {
            const ru = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь']
            const kz = ['Қаңтар','Ақпан','Наурыз','Сәуір','Мамыр','Маусым','Шілде','Тамыз','Қыркүйек','Қазан','Қараша','Желтоқсан']
            m = (locale === 'kz' ? kz : ru)[today.getMonth()]
        }
        setCurrentMonth(m || '')
    }, [mounted, locale, t])

    useEffect(() => {
        const handler = () => setIsScheduleOpen(true)
        window.addEventListener('open-vc-schedule', handler as any)
        return () => window.removeEventListener('open-vc-schedule', handler as any)
    }, [])

    const loadActiveStreams = useCallback(async () => {
        setLoadingStreams(true)
        try {
            const res = await httpClientWithAuth<any>(`${VIDEO_BASE}/stream/active?page=0&size=3`, {
                method: 'GET',
            })
            const items = Array.isArray(res?.content) ? res.content : []
            const mappedStreams: ActiveStream[] = items.map((item: any) => ({
                id: String(item.id || ''),
                code: String(item.code || ''),
                topic: item.topic || '',
                type: String(item.type || ''),
                createdAt: item.createdAt || item.created_at || '',
                plannedTime: item.plannedTime || item.planned_time || '',
                views: item.participantCount || 0,
                previewUrl: item.previewUrl || item.preview_url || item.frameUrl || item.frame_url || undefined,
            }))
            setActiveStreams(mappedStreams)
        } catch (e) {
            console.error('Failed to load active streams:', e)
            setActiveStreams([])
        } finally {
            setLoadingStreams(false)
        }
    }, [VIDEO_BASE])

    // Load active streams when on video conference page
    useEffect(() => {
        if (isVCPage && mounted) {
            loadActiveStreams()
            // Refresh every 30 seconds
            const interval = setInterval(loadActiveStreams, 30000)
            return () => clearInterval(interval)
        }
    }, [isVCPage, mounted, loadActiveStreams])

    // Format view count (placeholder - API doesn't provide this yet)
    const formatViewCount = (count?: number): string => {
        // TODO: Replace with actual view count from API when available
        // For now, show a placeholder
        if (count && count > 0) {
            if (count >= 1000) {
                const thousands = Math.floor(count / 1000)
                return `${thousands} тыс.`
            }
            return String(count)
        }
        // Show placeholder when no data available
        return '—'
    }

    // Format duration from createdAt timestamp
    const formatDuration = (createdAt: string): string => {
        if (!createdAt) return '0 мин'
        try {
            const startTime = new Date(createdAt).getTime()
            const now = Date.now()
            const diffMs = now - startTime
            const diffMinutes = Math.floor(diffMs / 60000)
            
            if (diffMinutes < 1) return 'только что'
            if (diffMinutes < 60) return `${diffMinutes} мин`
            
            const hours = Math.floor(diffMinutes / 60)
            if (hours === 1) return '1 час'
            return `${hours} ч`
        } catch {
            return '0 мин'
        }
    }

    const handleStreamClick = (streamId: string) => {
        const languageMatch = pathname.match(/^\/(\w{2})\//)
        const language = (languageMatch?.[1] || 'ru') as string
        router.push(`/${language}/dashboard/video-conference/${streamId}`)
    }


    const onCopy = async (text: string) => {
        try { await navigator.clipboard.writeText(text) } catch {}
    }

    const onSchedule = async () => {
        const uid = (personalData as any)?.id
        if (!uid) return
        if (!plannedDate || !plannedTime) return
        setScheduling(true)
        try {
            const payload = {
                user_id: uid,
                type: scheduleType,
                topic,
                planned_date: plannedDate,
                planned_time_value: plannedTime,
            }
            const d = await httpClientWithAuth<any>(`${BASE}/schedule`, { method: 'POST', body: JSON.stringify(payload) })
            setScheduledData(d)
            if (d.code) setScheduledCode(d.code)
            if (d.conference_id) setScheduledLink(`https://zanger-app.kz/ru/dashboard/video-conference/${encodeURIComponent(d.conference_id)}`)
            try {
                const item = {
                    conference_id: String(d.conference_id || ''),
                    code: String(d.code || ''),
                    token: String(d.token || ''),
                    url: String(d.url || ''),
                    identity: String(d.identity || ''),
                    canPublish: Boolean(d.canPublish),
                    planned_time: String(d.planned_time || `${plannedDate} ${plannedTime}:00`),
                    link: `https://zanger-app.kz/ru/dashboard/video-conference/${encodeURIComponent(d.conference_id || '')}`,
                    topic,
                    type: scheduleType,
                    user_name: (personalData as any)?.name || '',
                }
                const key = 'vc_scheduled'
                const prev = JSON.parse(localStorage.getItem(key) || '[]')
                localStorage.setItem(key, JSON.stringify([item, ...prev]))
                // Dispatch event to reload conferences list
                window.dispatchEvent(new CustomEvent('vc-conference-scheduled'))
                // Close the modal and reset form
                setIsScheduleOpen(false)
                setTopic('')
                setPlannedDate('')
                setPlannedTime('')
                setScheduledCode('')
                setScheduledLink('')
                setScheduledData(null)
            } catch {}
        } catch {} finally { setScheduling(false) }
    }

    const displayCode = useMemo(() => {
        if (!scheduledCode) return ''
        const compact = String(scheduledCode).replace(/\s+/g, '')
        const parts = compact.match(/.{1,3}/g)
        return parts ? parts.join(' ') : scheduledCode
    }, [scheduledCode])

    return (
        <div className={s.rightWidgets}>
            {/* Calendar Widget */}
            <div className={s.widget}>
                <div className={s.widgetHeader}>
                    <h3 className={s.widgetTitle} suppressHydrationWarning>{currentMonth}</h3>
                    <div className={s.calendarNav}>
                        <button className={s.calendarNavBtn}>‹</button>
                        <button className={s.calendarNavBtn}>›</button>
                    </div>
                </div>
                <div className={s.calendar}>
                    <div className={s.calendarWeekdays}>
                        {[t('dashboard.calendar.mon'), t('dashboard.calendar.tue'), t('dashboard.calendar.wed'), t('dashboard.calendar.thu'), t('dashboard.calendar.fri'), t('dashboard.calendar.sat'), t('dashboard.calendar.sun')].map(day => (
                            <div key={day} className={s.weekday}>{day}</div>
                        ))}
                    </div>
                    <div className={s.calendarDays} suppressHydrationWarning>
                        {Array.from({ length: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() }, (_, i) => i + 1).map(day => (
                            <button 
                                key={day} 
                                className={`${s.calendarDay} ${day === currentDate ? s.calendarDayActive : ''}`}
                            >
                                {day}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Lawyer Guide Widget */}
            {role === 'lawyer' && (
                <div className={s.lawyerGuideWidget}>
                    <div className={s.lawyerGuideHeader}>
                        <div className={s.lawyerGuideIcon}>📋</div>
                        <h3 className={s.lawyerGuideTitle}>Руководство для юристов</h3>
                    </div>
                    <div className={s.lawyerGuide}>
                        <ol className={s.guideList}>
                            <li><strong>Заполните профиль</strong><span>Укажите данные, фото и статус</span></li>
                            <li><strong>Загрузите документы</strong><span>Дождитесь проверки администратором</span></li>
                            <li><strong>Укажите специализации</strong><span>Направления права и регионы</span></li>
                            <li><strong>Оплатите подписку</strong><span>Раздел «Моя подписка»</span></li>
                            <li><strong>Получайте заявки</strong><span>Откройте раздел «Заявки»</span></li>
                        </ol>
                    </div>
                </div>
            )}

            {isVCPage && (
                <div className={s.scheduleAction}>
                    <div className={s.calendarActionBtn} onClick={() => setIsScheduleOpen(true)}>
                        <Image src="/assets/icons/calendar.svg" alt="calendar" width={20} height={20} className={s.calendarIcon} />
                        <span>Запланировать ВКС</span>
                    </div>
                </div>
            )}

            {/* Active Streams Widget */}
            {isVCPage && !hideActiveStreams && (
                <div className={s.widget}>
                    <div className={s.widgetHeader}>
                        <h3 className={s.widgetTitle}>Сейчас в эфире</h3>
                    </div>
                    {loadingStreams ? (
                        <div className={s.streamsLoading}>Загрузка...</div>
                    ) : activeStreams.length === 0 ? (
                        <div className={s.streamsEmpty}>Нет активных эфиров</div>
                    ) : (
                        <div className={s.streamsList}>
                            {activeStreams.map((stream) => (
                                <div 
                                    key={stream.id} 
                                    className={s.streamItem}
                                    onClick={() => handleStreamClick(stream.id)}
                                >
                                    <div className={s.streamThumbnail}>
                                        {stream.previewUrl ? (
                                            <img 
                                                src={stream.previewUrl} 
                                                alt={stream.topic || 'Stream preview'}
                                                className={s.streamPreviewImage}
                                                onError={(e) => {
                                                    // Fallback to placeholder if image fails to load
                                                    const target = e.target as HTMLImageElement
                                                    target.style.display = 'none'
                                                    const placeholder = target.nextElementSibling as HTMLElement
                                                    if (placeholder) placeholder.style.display = 'flex'
                                                }}
                                            />
                                        ) : null}
                                        <div className={s.streamThumbnailPlaceholder} style={{ display: stream.previewUrl ? 'none' : 'flex' }}>
                                            <div className={s.playIcon}></div>
                                        </div>
                                        <div className={s.streamTopicOverlay}>
                                            <span className={s.streamTopicText}>{stream.topic || 'Без названия'}</span>
                                        </div>
                                        <div className={s.streamOverlay}>
                                            <span className={s.streamViews}>
                                                <span className={s.viewIcon}></span>
                                                {formatViewCount(stream.views)}
                                            </span>
                                            <span className={s.streamDuration}>{formatDuration(stream.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Events Widget - Hidden */}
            {/* <div className={s.widget}>
                <div className={s.widgetHeader}>
                    <h3 className={s.widgetTitle}>{t('dashboard.events.title')}</h3>
                </div>
                <div className={s.eventsList}>
                    {events.map((event, index) => (
                        <div key={index} className={s.eventItem}>
                            <div className={s.eventTime}>{event.time}</div>
                            <div className={s.eventTitle}>{event.title}</div>
                        </div>
                    ))}
                </div>
            </div> */}

            {/* AI Assistant Widget - Hidden */}
            {/* <div className={s.widget}>
                <div className={s.assistantHeader}>
                    <div className={s.assistantAvatar}>
                        <span className={s.assistantIcon}>🤖</span>
                    </div>
                    <div className={s.assistantInfo}>
                        <div className={s.assistantName}>{t('dashboard.assistant.name')}</div>
                        <div className={s.assistantStatus}>{t('dashboard.assistant.role')}</div>
                    </div>
                </div>
                <div className={s.assistantMessage}>
                    <div className={s.messageBubble}>
                        {t('dashboard.assistant.greeting')}
                    </div>
                </div>
                <div className={s.assistantActions}>
                    <button className={s.quickAction}>{t('dashboard.assistant.compareAction')}</button>
                    <button className={s.quickAction}>{t('dashboard.assistant.contractAction')}</button>
                </div>
                <div className={s.messageInput}>
                    <input 
                        type="text" 
                        placeholder={t('dashboard.assistant.inputPlaceholder')}
                        className={s.messageField}
                    />
                    <button className={s.sendBtn}>↑</button>
                </div>
            </div> */}

            {isVCPage && (
                <Modal isOpen={isScheduleOpen} onClose={() => setIsScheduleOpen(false)} title="Запланируйте ВКС" closeButton>
                    <div className={s.scheduleForm}>
                        <div className={s.formRow}>
                            <select className={s.input} value={scheduleType} onChange={e => setScheduleType(e.target.value as any)}>
                                <option value="Консультация">Тип конференции: Консультация</option>
                                <option value="Вебинар">Тип конференции: Вебинар</option>
                                <option value="Совещание">Тип конференции: Совещание</option>
                            </select>
                        </div>
                        <div className={s.formRow}>
                            <input className={s.input} placeholder="Тема конференции" value={topic} onChange={e => setTopic(e.target.value)} />
                        </div>
                        <div className={s.formRowTwo}>
                            <input type="date" className={s.input} placeholder="Дата" value={plannedDate} onChange={e => setPlannedDate(e.target.value)} />
                            <input type="time" className={s.input} placeholder="Время" value={plannedTime} onChange={e => setPlannedTime(e.target.value)} />
                        </div>
                        
                    
                    
                        <div className={s.formActions}>
                            <Button variant="secondary" onClick={() => setIsScheduleOpen(false)}>Отменить</Button>
                            <Button variant="primary" disabled={scheduling} onClick={onSchedule}>{scheduling ? '...' : 'Запланировать'}</Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    )
}
