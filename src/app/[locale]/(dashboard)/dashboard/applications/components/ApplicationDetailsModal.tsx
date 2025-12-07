'use client'

import { useTranslations } from 'next-intl'
import s from './ApplicationDetailsModal.module.scss'
import { DateComponent } from '@/shared/ui-kit/DateComponent'

interface ApplicationDetailsModalProps {
	application: any
	onClose: () => void
	onRespond: (id: number) => void
	isResponding?: boolean
}

export const ApplicationDetailsModal = ({ 
	application, 
	onClose, 
	onRespond,
	isResponding = false 
}: ApplicationDetailsModalProps) => {
	const t = useTranslations('applications')

	if (!application) return null

	return (
		<div className={s.overlay} onClick={onClose}>
			<div className={s.modal} onClick={e => e.stopPropagation()}>
				<button className={s.closeBtn} onClick={onClose}>×</button>
				
				<h2 className={s.title}>
					{application.tag?.name || t('serviceType.other')}
				</h2>
				
				<div className={s.description}>
					{application.description}
				</div>
				
                <div className={s.metaInfo}>
                    <div className={s.metaRow}>
                        <span className={s.metaLabel}>Клиент:</span>
                        <span>{application.user?.name || 'Клиент'}</span>
                    </div>
                    <div className={s.metaRow}>
                        <span className={s.metaLabel}>{t('region')}:</span>
                        <span>{application.region?.name || 'Не указан'}</span>
                    </div>
                    <div className={s.metaRow}>
                        <span className={s.metaLabel}>Телефон:</span>
                        <span>{application.phone || 'Не указан'}</span>
                    </div>
                    <div className={s.metaRow}>
                        <span className={s.metaLabel}>Язык обращения:</span>
                        <span>{application.appeal_language ? (application.appeal_language === 'kz' ? 'Қазақша' : application.appeal_language === 'ru' ? 'Русский' : 'Қазақша/русский') : 'Не указан'}</span>
                    </div>
                    <div className={s.metaRow}>
                        <span className={s.metaLabel}>{t('date')}:</span>
                        <span>
                            <DateComponent date={application.created_at} />
                        </span>
                    </div>
                </div>
                
                <div className={s.actions}>
                    
                    <button 
                        className={s.respondBtn}
                        onClick={() => onRespond(application.id)}
                        disabled={isResponding}
                    >
						{isResponding ? 'Обработка...' : 'В "Мои заявки"'}
					</button>
				</div>
			</div>
		</div>
	)
}
