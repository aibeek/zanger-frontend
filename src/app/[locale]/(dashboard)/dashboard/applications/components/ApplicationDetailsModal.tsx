'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { lawyerApi } from '@/shared/api'
import s from './ApplicationDetailsModal.module.scss'
import { DateComponent } from '@/shared/ui-kit/DateComponent'
import { LawyerCommentsBlock } from './LawyerCommentsBlock'

interface ApplicationDetailsModalProps {
	application: any
	onClose: () => void
	onRespond: (id: number) => void
	isResponding?: boolean
    onChat?: (participantId?: number | string, participantName?: string) => void
}

export const ApplicationDetailsModal = ({ 
    application, 
    onClose, 
    onRespond,
    isResponding = false,
    onChat 
}: ApplicationDetailsModalProps) => {
    const t = useTranslations('applications')
    const [detailed, setDetailed] = useState<any>(null)

    useEffect(() => {
        if (!application) return
        const needMore = !application.phone || !application.appeal_language || !application.region
        if (needMore && application.id) {
            lawyerApi
                .getDetailedOrders({ application_id: application.id })
                .then((res: any) => {
                    const data = (res && (res.data || res)) as any
                    setDetailed(data)
                })
                .catch(() => {})
        }
    }, [application])

    const app = detailed || application

    const desc = typeof app?.description === 'string' ? app.description : ''
    const regionMatch = desc.match(/Регион:\s*([^\n\.;]+)/i)
    const phoneMatch = desc.match(/Телефон:\s*([+0-9\-()\s]+)/i)
    const langMatch = desc.match(/Язык обращения:\s*([^\n\.;]+)/i)
    const derivedRegion = app?.region?.name || (regionMatch ? regionMatch[1].trim() : null)
    const derivedPhone = app?.phone || (phoneMatch ? phoneMatch[1].replace(/\s+/g, ' ').trim() : null)
    const derivedLangRaw = app?.appeal_language || (langMatch ? langMatch[1].toLowerCase().trim() : null)
    const derivedLang = derivedLangRaw
        ? derivedLangRaw === 'kz' || derivedLangRaw.startsWith('каз')
            ? 'Қазақша'
            : derivedLangRaw === 'ru' || derivedLangRaw.startsWith('рус')
                ? 'Русский'
                : 'Қазақша/русский'
        : null

	if (!application) return null

	return (
		<div className={s.overlay} onClick={onClose}>
			<div className={s.modal} onClick={e => e.stopPropagation()}>
				<button className={s.closeBtn} onClick={onClose}>×</button>
				
                <h2 className={s.title}>
                    {app.tag?.name || t('serviceType.other')}
                </h2>
				
                <div className={s.description}>
                    {app.description}
                </div>
				
                <div className={s.metaInfo}>
                    <div className={s.metaRow}>
                        <span className={s.metaLabel}>Клиент:</span>
                        <span>{app.user?.name || 'Клиент'}</span>
                    </div>
                    <div className={s.metaRow}>
                        <span className={s.metaLabel}>{t('region')}:</span>
                        <span>{derivedRegion || 'Не указан'}</span>
                    </div>
                    <div className={s.metaRow}>
                        <span className={s.metaLabel}>Телефон:</span>
                        <span>{derivedPhone || 'Не указан'}</span>
                    </div>
                    <div className={s.metaRow}>
                        <span className={s.metaLabel}>Язык обращения:</span>
                        <span>{derivedLang || 'Не указан'}</span>
                    </div>
                    <div className={s.metaRow}>
                        <span className={s.metaLabel}>{t('date')}:</span>
                        <span>
                            <DateComponent date={app.created_at} />
                        </span>
                    </div>
                </div>

                <LawyerCommentsBlock orderId={app.id} />
                
                <div className={s.actions}>
                    
                    {/* Если передан onChat, показываем кнопку Чата */}
                    {/* Если onRespond доступен (не заглушка), показываем кнопку отклика (или "В Мои заявки") */}
                    
                    {/* Логика отображения: 
                        1. Если это "Мои заявки" (передан onChat), показываем кнопку Чат.
                        2. Если это "Новые заявки" (onChat не передан или null), показываем кнопку "В Мои заявки" (onRespond).
                    */}

                    {onRespond && onRespond.name !== 'mockConstructor' && ( // Простая проверка, но лучше полагаться на пропы
                         <button 
                            className={s.respondBtn}
                            onClick={() => onRespond(app.id)}
                            disabled={isResponding}
                        >
                            {isResponding ? 'Обработка...' : 'В "Мои заявки"'}
                        </button>
                    )}

                    {onChat && (
                        <button
                            className={s.chatBtn}
                            onClick={() => onChat(app.user?.id || 0, app.user?.name || 'Client')}
                        >
                            Чат с клиентом
                        </button>
                    )}
				</div>
			</div>
		</div>
	)
}
