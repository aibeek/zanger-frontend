'use client'

import { Dropdown, Badge, List, Spin } from 'antd'
import s from './NotificationsDropdown.module.scss'
import { useNotifications, useNotificationsStore } from '../../model'
import NotificationsIcon from '@/app/assets/icons/notiifications.svg'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { AppLink } from '@/shared/ui-kit/AppLink'
import { formatPublishedDate } from '@/shared/lib'

export const mockNotifications = [
	{
		id: 1,
		title: 'Ваша заявка одобрена!',
		created_at: '2025-06-01T12:30:00Z',
		is_read: false,
		image: 'https://api.lawyerplace.kulenkov-group.kz/storage/docs/lawyer-documents/avatar.jpg',
		hasButton: true,
		buttonText: 'Посмотреть',
		buttonLink: '/dashboard/requests/1',
	},
	{
		id: 2,
		title: 'Новый отклик на вакансию',
		created_at: '2025-06-01T11:10:00Z',
		is_read: false,
		image: 'https://api.lawyerplace.kulenkov-group.kz/storage/docs/lawyer-documents/avatar.jpg',
		hasButton: true,
		buttonText: 'Открыть',
		buttonLink: '/dashboard/vacancies/2',
	},
	{
		id: 3,
		title: 'Напоминание о заполнении профиля',
		created_at: '2025-05-31T09:00:00Z',
		is_read: true,
		image: 'https://api.lawyerplace.kulenkov-group.kz/storage/docs/lawyer-documents/avatar.jpg',
		hasButton: false,
	},
	{
		id: 4,
		title: 'Вы успешно прошли модерацию',
		created_at: '2025-05-30T16:45:00Z',
		is_read: true,
		image: 'https://api.lawyerplace.kulenkov-group.kz/storage/docs/lawyer-documents/avatar.jpg',
		hasButton: true,
		buttonText: 'Перейти в профиль',
		buttonLink: '/dashboard/profile',
	},
	{
		id: 5,
		title: 'Новое сообщение от клиента',
		created_at: '2025-05-30T14:20:00Z',
		is_read: false,
		image: 'https://api.lawyerplace.kulenkov-group.kz/storage/docs/lawyer-documents/avatar.jpg',
		hasButton: true,
		buttonText: 'Читать',
		buttonLink: '/dashboard/messages/5',
	},
	{
		id: 6,
		title: 'Подписка скоро заканчивается',
		created_at: '2025-05-29T10:00:00Z',
		is_read: true,
		image: 'https://api.lawyerplace.kulenkov-group.kz/storage/docs/lawyer-documents/avatar.jpg',
		hasButton: true,
		buttonText: 'Продлить',
		buttonLink: '/subscription',
	},
	{
		id: 7,
		title: 'Вы получили бонус за активность',
		created_at: '2025-05-28T17:15:00Z',
		is_read: false,
		image: 'https://api.lawyerplace.kulenkov-group.kz/storage/docs/lawyer-documents/avatar.jpg',
		hasButton: false,
	},
	{
		id: 8,
		title: 'Обновления в условиях сервиса',
		created_at: '2025-05-27T08:30:00Z',
		is_read: true,
		image: 'https://api.lawyerplace.kulenkov-group.kz/storage/docs/lawyer-documents/avatar.jpg',
		hasButton: true,
		buttonText: 'Подробнее',
		buttonLink: '/legal/terms',
	},
	{
		id: 9,
		title: 'Новый отзыв о вашей работе',
		created_at: '2025-05-26T12:00:00Z',
		is_read: false,
		image: 'https://api.lawyerplace.kulenkov-group.kz/storage/docs/lawyer-documents/avatar.jpg',
		hasButton: true,
		buttonText: 'Прочитать',
		buttonLink: '/dashboard/reviews',
	},
	{
		id: 10,
		title: 'Технические работы 3 июня',
		created_at: '2025-05-25T19:00:00Z',
		is_read: true,
		image: 'https://api.lawyerplace.kulenkov-group.kz/storage/docs/lawyer-documents/avatar.jpg',
		hasButton: false,
	},
]
export const NotificationsDropdown = () => {
	const t = useTranslations('header')
	const { notifications, markAsRead } = useNotificationsStore()
	const { isLoading } = useNotifications()

	// Используй mockNotifications вместо notifications если нет API
	const data = notifications.length > 0 ? notifications : mockNotifications
	const unreadCount = data.filter((n) => !n.is_read).length

	const items = (
		<div className={s.dropdownContent}>
			{isLoading ? (
				<Spin size="small" />
			) : data.length === 0 ? (
				<p className={s.empty}>Нет уведомлений</p>
			) : (
				<>
					<h4 className={s.title}>Ваши уведомления</h4>
					<List
						className={s.list}
						dataSource={data}
						renderItem={(item) => (
							// @ts-expect-error fix it
							<List.Item className={`${s.item} ${!item.is_read ? s.unread : ''}`}>
								<div className={s.content}>
									<div className={s.image}>
										<Image
											// @ts-expect-error fix it
											src={item.image}
											alt="notification"
											width={40}
											height={40}
										/>
									</div>
									<div className={s.text}>
										{/*   @ts-expect-error fix it */}
										<div className={s.name}>{item.title}</div>
										{/*   @ts-expect-error fix it */}
										{item.hasButton && (
											<AppLink
												variant="clear"
												size="auto"
												// href={item.buttonLink}
												href={'#'}
												className={s.link}>
												{/*  @ts-expect-error fix it */}
												{item.buttonText}
											</AppLink>
										)}
										{/*  @ts-expect-error fix it */}
										<p className={s.date}>{formatPublishedDate(item.created_at)}</p>
									</div>
								</div>
							</List.Item>
						)}
					/>
				</>
			)}
		</div>
	)

	return (
		<Dropdown
			overlay={items}
			placement="bottomRight"
			trigger={['click']}>
			<Badge
				count={unreadCount}
				size="small">
				<Image
					style={{ cursor: 'pointer', borderRadius: '10px', objectFit: 'cover' }}
					src={NotificationsIcon}
					alt={t('notificationsAlt')}
					width={24}
					height={24}
				/>
			</Badge>
		</Dropdown>
	)
}
