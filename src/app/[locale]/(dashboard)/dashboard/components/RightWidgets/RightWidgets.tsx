'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useLoginStore } from '@/features/auth/login'
import { Modal, Button } from '@/shared/ui-kit'
import Image from 'next/image'
import { httpClientWithAuth } from '@/shared/api/httpClient'
import s from './RightWidgets.module.scss'

export const RightWidgets = () => {
    const t = useTranslations()
    const locale = useLocale()
    const today = new Date()
    const currentDate = today.getDate()
    const { personalData } = useLoginStore()
    const [isScheduleOpen, setIsScheduleOpen] = useState(false)
    const [scheduleType, setScheduleType] = useState<'Консультация' | 'Вебинар' | 'Совещание'>('Консультация')
    const [topic, setTopic] = useState('')
    const [plannedDate, setPlannedDate] = useState('')
    const [plannedTime, setPlannedTime] = useState('')
    const [scheduling, setScheduling] = useState(false)
    const [scheduledCode, setScheduledCode] = useState<string>('')
    const [scheduledLink, setScheduledLink] = useState<string>('')
    const BASE = 'https://api.zanger-app.kz/api/livekit'
    
    const monthNames = [
        'january', 'february', 'march', 'april', 'may', 'june',
        'july', 'august', 'september', 'october', 'november', 'december'
    ]
    const currentMonthKey = monthNames[today.getMonth()]
    let currentMonth
    try {
        currentMonth = t(`months.${currentMonthKey}`)
    } catch {
        const ru = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь']
        const kz = ['Қаңтар','Ақпан','Наурыз','Сәуір','Мамыр','Маусым','Шілде','Тамыз','Қыркүйек','Қазан','Қараша','Желтоқсан']
        currentMonth = (locale === 'kz' ? kz : ru)[today.getMonth()]
    }

    const events = [
        { time: '16:00', title: t('dashboard.events.clientMeeting') },
        { time: '18:30', title: t('dashboard.events.consultation') }
    ]

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
                planned_time: `${plannedDate} ${plannedTime}:00`,
            }
            const d = await httpClientWithAuth<any>(`${BASE}/schedule`, { method: 'POST', body: JSON.stringify(payload) })
            if (d.code) setScheduledCode(d.code)
            if (d.code) setScheduledLink(`https://app.zanger-app.kz/video/${encodeURIComponent(d.code)}`)
        } catch {} finally { setScheduling(false) }
    }

    return (
        <div className={s.rightWidgets}>
            {/* Calendar Widget */}
            <div className={s.widget}>
                <div className={s.widgetHeader}>
                    <h3 className={s.widgetTitle}>{currentMonth}</h3>
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
                    <div className={s.calendarDays}>
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
            <div className={s.scheduleAction}>
                <div className={s.calendarActionBtn} onClick={() => setIsScheduleOpen(true)}>
                    <Image src="/assets/icons/calendar.svg" alt="calendar" width={20} height={20} className={s.calendarIcon} />
                    <span>Запланировать ВКС</span>
                </div>
            </div>

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

            <Modal isOpen={isScheduleOpen} onClose={() => setIsScheduleOpen(false)} title="Запланируйте ВКС">
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
                    <div className={s.formRowLabel}>Код конференции:</div>
                    <div className={s.formRowTwo}>
                        <input className={s.input} readOnly value={scheduledCode} />
                        <button className={s.copyBtn} onClick={() => onCopy(scheduledCode)} aria-label="Копировать"></button>
                    </div>
                    <div className={s.formRowLabel}>Ссылка:</div>
                    <div className={s.formRowTwo}>
                        <input className={s.input} readOnly value={scheduledLink} />
                        <button className={s.copyBtn} onClick={() => onCopy(scheduledLink)} aria-label="Копировать"></button>
                    </div>
                    <div className={s.formActions}>
                        <Button variant="secondary" onClick={() => setIsScheduleOpen(false)}>Отменить</Button>
                        <Button variant="primary" disabled={scheduling} onClick={onSchedule}>{scheduling ? '...' : 'Запланировать'}</Button>
                    </div>
                </div>
            </Modal>
            <Modal isOpen={isScheduleOpen} onClose={() => setIsScheduleOpen(false)} title="Запланируйте ВКС">
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
                    <div className={s.formRowLabel}>Код конференции:</div>
                    <div className={s.formRowTwo}>
                        <input className={s.input} readOnly value={scheduledCode} />
                        <Button variant="secondary" onClick={() => onCopy(scheduledCode)}>Копировать</Button>
                    </div>
                    <div className={s.formRowLabel}>Ссылка:</div>
                    <div className={s.formRowTwo}>
                        <input className={s.input} readOnly value={scheduledLink} />
                        <Button variant="secondary" onClick={() => onCopy(scheduledLink)}>Копировать</Button>
                    </div>
                    <div className={s.formActions}>
                        <Button variant="secondary" onClick={() => setIsScheduleOpen(false)}>Отменить</Button>
                        <Button variant="primary" disabled={scheduling} onClick={onSchedule}>{scheduling ? '...' : 'Запланировать'}</Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
