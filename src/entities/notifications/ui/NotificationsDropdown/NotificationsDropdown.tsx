'use client'

import { Dropdown, Badge, List } from 'antd'
import { useState } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

import s from './NotificationsDropdown.module.scss'
import NotificationsIcon from '@/app/assets/icons/notiifications.svg'

import { useNotifications, useNotificationsStore } from '../../model'
import { AppLink, Button, Loader } from '@/shared/ui-kit'
import { formatPublishedDate } from '@/shared/lib'
import { mapNotification } from '@/shared/lib/helpers/mapNotification'
import { useLoginStore } from '@/features/auth'

export const NotificationsDropdown = () => {
	const t = useTranslations('notifications')
	const { notifications, markAsRead, markAllAsRead, clearAll, hiddenIds } = useNotificationsStore()
	const { personalData } = useLoginStore()
	const { isLoading } = useNotifications()
	const [open, setOpen] = useState(false)

	const visibleNotifications = notifications.filter((n) => !hiddenIds.includes(n.id))
	const data =
		visibleNotifications.length > 0
			? visibleNotifications.map((n) => mapNotification(n, t, personalData.language))
			: []
	const unreadCount = data.filter((n) => !n.is_read).length

	const items = (
		<div className={s.dropdownContent}>
			{isLoading ? (
				<Loader />
			) : data.length === 0 ? (
				<p className={s.empty}>{t('empty')}</p>
			) : (
				<>
					<h4 className={s.title}>{t('title')}</h4>
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
					<div className={s.btns}>
						{unreadCount > 0 && (
							<Button
								style={{ fontSize: '14px' }}
								variant="primary"
								size="full"
								className={s.markAllButton}
								onClick={markAllAsRead}>
								{t('markAll')}
							</Button>
						)}
						<Button
							style={{ fontSize: '14px' }}
							variant="danger"
							size="full"
							className={s.clearButton}
							onClick={() => clearAll(t)}
							aria-label={t('clearAll')}
							title={t('clearAll')}>
							{t('clearAll')}
						</Button>
					</div>
				</>
			)}
		</div>
	)

	return (
		<Dropdown
			open={open}
			onOpenChange={(state) => setOpen(state)}
			overlay={items}
			placement="bottomRight"
			trigger={['click']}>
			<Badge
				count={unreadCount}
				size="small">
				<Image
					style={{ cursor: 'pointer', borderRadius: '10px', objectFit: 'cover' }}
					src={NotificationsIcon}
					alt={t('alt')}
					width={24}
					height={24}
				/>
			</Badge>
		</Dropdown>
	)
}
