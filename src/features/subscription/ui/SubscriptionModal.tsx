'use client'

import { Modal } from '@/shared/ui-kit'
import { useTranslations } from 'next-intl'
import s from './SubscriptionModal.module.scss'

interface SubscriptionModalProps {
	isOpen: boolean
	onClose: () => void
	endsAt: string
}

export const SubscriptionModal = ({ isOpen, onClose, endsAt }: SubscriptionModalProps) => {
	const t = useTranslations()
	
	const benefits = [
		{
			icon: '📝',
			title: 'Доступ к большему количеству заявок',
			description: 'открывайте полный список обращений от клиентов.'
		},
		{
			icon: '📊',
			title: 'Доступ к аналитике',
			description: 'отслеживайте отклики, статистику и эффективность вашей работы.'
		},
		{
			icon: '🎯',
			title: 'Расширенные фильтры',
			description: 'быстрее находите подходящие запросы по категории, региону, бюджету и срокам.'
		},
		{
			icon: '🔔',
			title: 'Возможность откликаться первыми',
			description: 'заявки поступают к вам без задержек.'
		},
		{
			icon: '💬',
			title: 'Неограниченный чат и видеосвязь',
			description: 'консультируйте клиентов напрямую без ограничений.'
		},
		{
			icon: '⭐',
			title: 'Приоритетное отображение в поиске',
			description: 'ваш профиль будет выше в результатах, что увеличивает шанс получить клиента.'
		}
	]

	const handleExtend = () => {
		// TODO: Добавить логику продления подписки
		console.log('Продлить подписку')
	}

	const handleCancel = () => {
		// TODO: Добавить логику отмены подписки
		console.log('Отменить подписку')
	}

	return (
		<Modal isOpen={isOpen} onClose={onClose} className={s.modal}>
			<div className={s.content}>
				<div className={s.header}>
					<h2>Ваша подписка</h2>
					<div className={s.badge}>
						Активна до {new Date(endsAt).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })}
					</div>
				</div>

				<div className={s.title}>
					<h3>С ПОДПИСКОЙ ZANGER ВЫ ПОЛУЧАЕТЕ</h3>
				</div>

				<div className={s.benefits}>
					<div className={s.column}>
						{benefits.slice(0, 3).map((benefit, index) => (
							<div key={index} className={s.benefit}>
								<div className={s.benefitIcon}>{benefit.icon}</div>
								<div className={s.benefitContent}>
									<h4>{benefit.title}</h4>
									<p>{benefit.description}</p>
								</div>
							</div>
						))}
					</div>
					<div className={s.column}>
						{benefits.slice(3).map((benefit, index) => (
							<div key={index} className={s.benefit}>
								<div className={s.benefitIcon}>{benefit.icon}</div>
								<div className={s.benefitContent}>
									<h4>{benefit.title}</h4>
									<p>{benefit.description}</p>
								</div>
							</div>
						))}
					</div>
				</div>

				<div className={s.actions}>
					<button className={s.extendButton} onClick={handleExtend}>
						Продлить подписку
					</button>
					<button className={s.cancelButton} onClick={handleCancel}>
						Отменить подписку
					</button>
				</div>

				<button className={s.closeButton} onClick={onClose}>×</button>
			</div>
		</Modal>
	)
}
