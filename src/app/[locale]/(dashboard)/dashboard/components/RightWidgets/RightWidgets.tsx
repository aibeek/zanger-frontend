'use client'

import { useState, useMemo, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import { useLoginStore } from '@/features/auth/login'
import { Modal, Button } from '@/shared/ui-kit'
import Image from 'next/image'
import { httpClientWithAuth } from '@/shared/api/httpClient'
import { API_URL } from '@/shared/config'
import s from './RightWidgets.module.scss'

export const RightWidgets = () => {
    const t = useTranslations()
    const locale = useLocale()
    const pathname = usePathname()
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
    const BASE = `${API_URL}/livekit`
    
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
                        {Array.from({ length: 30 }, (_, i) => i + 1).map(day => (
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
            {isVCPage && (
                <div className={s.scheduleAction}>
                    <div className={s.calendarActionBtn} onClick={() => setIsScheduleOpen(true)}>
                        <Image src="/assets/icons/calendar.svg" alt="calendar" width={20} height={20} className={s.calendarIcon} />
                        <span>Запланировать ВКС</span>
                    </div>
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
