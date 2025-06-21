'use client'

import { Dropdown, Badge, List } from 'antd'
import s from './NotificationsDropdown.module.scss'
import { useNotifications, useNotificationsStore } from '../../model'
import NotificationsIcon from '@/app/assets/icons/notiifications.svg'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { AppLink } from '@/shared/ui-kit/AppLink'
import { formatPublishedDate } from '@/shared/lib'
import { mapNotification } from '@/shared/lib/helpers/mapNotification'
import { useState } from 'react'
import { Button, Loader } from '@/shared/ui-kit'

export const NotificationsDropdown = () => {
	const t = useTranslations('header')
	const { notifications, markAsRead, markAllAsRead } = useNotificationsStore()
	const { isLoading } = useNotifications()
	const [open, setOpen] = useState(false)
	console.log(notifications)

	const data = notifications.length > 0 ? notifications.map(mapNotification) : []
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
									{item.image && item.type && (
										<div className={s.image}>
											<Image
												src={item.image}
												alt="img"
												width={40}
												height={40}
											/>
										</div>
									)}
									<div className={s.text}>
										<div className={s.name}>{item.title}</div>
										{item.hasButton && (
											<div
												onClick={() => {
													markAsRead(item.id)
													setOpen(false)
												}}>
												{item.name && <div className={s.subname}>{item.name}</div>}
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
					{/* <button
						className={s.clearButton}
						onClick={clearAll}
						aria-label="Очистить уведомления"
						title="Очистить уведомления">
						<Image
							src={ClearIcon}
							alt="Clear"
							width={16}
							height={16}
						/>
					</button> */}
					{unreadCount > 0 && (
						<Button
							variant="primary"
							size={'full'}
							className={s.markAllButton}
							onClick={() => {
								markAllAsRead()
							}}>
							Прочитать все
						</Button>
					)}
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
