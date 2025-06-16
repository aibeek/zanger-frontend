'use client'

import { Dropdown, Badge, List, Spin } from 'antd'
import s from './NotificationsDropdown.module.scss'
import { useNotifications, useNotificationsStore } from '../../model'
import NotificationsIcon from '@/app/assets/icons/notiifications.svg'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { AppLink } from '@/shared/ui-kit/AppLink'
import { formatPublishedDate } from '@/shared/lib'
import { mapNotification } from '@/shared/lib/helpers/mapNotification'
import { useState } from 'react'
import { Loader } from '@/shared/ui-kit'


export const NotificationsDropdown = () => {
	const t = useTranslations('header')
	const { notifications, markAsRead } = useNotificationsStore()
	const { isLoading } = useNotifications()
	const [open, setOpen] = useState(false)

	const data = notifications.length > 0
	? notifications.map(mapNotification)
	: []
		const unreadCount = data.filter((n: any) => !n.is_read).length

	const items = (
		<div className={s.dropdownContent}>
			{isLoading ? (
				<Loader />
			) : data.length === 0 ? (
				<p className={s.empty}>Нет уведомлений</p>
			) : (
				<>
					<h4 className={s.title}>Ваши уведомления</h4>
					<List
						className={s.list}
						dataSource={data}
						renderItem={(item) => (
							<List.Item className={`${s.item} ${!item.is_read ? s.unread : ''}`}>
								<div className={s.content}>
								{/* {
									item.image && (
										<div className={s.image}>
										<Image
											src={item.image}
											alt="notification"
											width={40}
											height={40}
										/>
									</div>
									)
								} */}
									<div className={s.text}>
										<div className={s.name}>{item.title}</div>
										{item.hasButton && (
														<div
															onClick={() => {
																markAsRead(item.id)
																setOpen(false)
															}}>
															<AppLink
																variant="clear"
																size="auto"
																href={item.buttonLink}
																className={s.link}>
																{item.buttonText}
															</AppLink>
														</div>
													)}
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
		open={open}
		onOpenChange={setOpen}
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
