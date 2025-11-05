'use client'

import { useTranslations, useLocale } from 'next-intl'
import s from './RightWidgets.module.scss'

export const RightWidgets = () => {
    const t = useTranslations()
    const locale = useLocale()
    const today = new Date()
    const currentDate = today.getDate()
    
    // Получаем название месяца из переводов
    const monthNames = [
        'january', 'february', 'march', 'april', 'may', 'june',
        'july', 'august', 'september', 'october', 'november', 'december'
    ]
    const currentMonthKey = monthNames[today.getMonth()]
    
    // Попробуем получить перевод месяца
    let currentMonth
    try {
        currentMonth = t(`months.${currentMonthKey}`)
    } catch (error) {
        console.error('Translation error for month:', currentMonthKey, error)
        // Fallback к системному имени месяца
        currentMonth = today.toLocaleString(locale === 'kz' ? 'kk-KZ' : 'ru-RU', { month: 'long' })
    }
    
    console.log('Current locale:', locale)
    console.log('Current month key:', currentMonthKey)
    console.log('Translated month:', currentMonth)

    const events = [
        { time: '16:00', title: t('dashboard.events.clientMeeting') },
        { time: '18:30', title: t('dashboard.events.consultation') }
    ]

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
        </div>
    )
}
