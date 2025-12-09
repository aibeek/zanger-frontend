'use client'

import { Dropdown, Badge, List } from 'antd'
import { useState } from 'react'
import Image from 'next/image'
import { useTranslations, useLocale } from 'next-intl'

import s from './NotificationsDropdown.module.scss'
import NotificationsIcon from '@/app/assets/icons/notification-icon.svg'

import { useNotificationsStore } from '../../model'
import { AppLink, Button, Loader } from '@/shared/ui-kit'
import { formatPublishedDate } from '@/shared/lib'
import { mapNotification } from '@/shared/lib/helpers/mapNotification'
import { useLoginStore } from '@/features/auth'
import { useNotificationsInfinite } from '../../model/useNotificationsInfinite'

export const NotificationsDropdown = () => {
    const t = useTranslations('notifications')
    const locale = useLocale() as 'ru' | 'kk'
	const { markAsRead } = useNotificationsStore()
	const { personalData } = useLoginStore()
	const { items: paginatedNotifications, isLoadingMore, setSize, isReachingEnd, mutate } = useNotificationsInfinite()
	const [open, setOpen] = useState(false)

	const visibleNotifications = paginatedNotifications
	const data =
		visibleNotifications.length > 0
			? visibleNotifications.map((n) => mapNotification(n, t, personalData.language))
			: []
	const unreadCount = data.filter((n) => !n.is_read).length

	const items = (
		<div className={s.dropdownContent}>
			{isLoadingMore ? (
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
													mutate()
													setOpen(false)
												}}>
												{item.name && <div className={s.subname}>{item.name}</div>}
												{item.cancel_reason && (
													<div className={s.subname}>{item.cancel_reason}</div>
												)}
												<AppLink
													variant="clear"
													size="auto"
													href={item.buttonLink}
													className={s.link}>
													{item.buttonText}
												</AppLink>
											</div>
										)}
                                        <p className={s.date}>{formatPublishedDate(item.created_at, locale)}</p>
									</div>
								</div>
							</List.Item>
						)}
					/>
					<div className={s.btns}>
						{!isReachingEnd && (
							<div className={s.loadMoreWrapper}>
								<Button
									style={{ fontSize: '14px' }}
									variant="primary"
									size="full"
									onClick={() => setSize((prev) => prev + 1)}
									disabled={isLoadingMore}>
									{isLoadingMore ? t('buttons.loading') : t('buttons.load_more')}
								</Button>
							</div>
						)}
					</div>
				</>
			)}
		</div>
	)

	return (
		<Dropdown
			open={open}
			onOpenChange={(state) => setOpen(state)}
			menu={{ items: [] }}
			popupRender={() => items}
			placement="bottomRight"
			trigger={['click']}>
			<Badge
				count={unreadCount}
				size="small"
				style={{ background: 'none', boxShadow: 'none' }}
				>
				<Image
					style={{ cursor: 'pointer', objectFit: 'cover', borderRadius: '0' }}
					src={NotificationsIcon}
					alt={t('alt')}
					width={35}
					height={35}
				/>
			</Badge>
		</Dropdown>
	)
}
