'use client'

import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { Button, DescriptionText } from '@/shared/ui-kit'
import { DateComponent } from '@/shared/ui-kit/DateComponent'

import { Eye, Phone } from 'lucide-react'
import { useState } from 'react'
import { ApplicationDetailsModal } from '@/app/[locale]/(dashboard)/dashboard/applications/components/ApplicationDetailsModal'

import s from './MyResponsesList.module.scss'
import { truncateDescription } from '@/shared/lib'
import { Status, useMyResponsesStore } from '../../model'

export const MyResponsesList = ({ items, loadMore, isLoadingMore, isReachingEnd }) => {
	const { workOut, closeItem, workedOutIds } = useMyResponsesStore()
	const t = useTranslations('applications')
	const [selectedApp, setSelectedApp] = useState<any>(null)

	// Функция для обработки нажатия на кнопку "Перейти в чат"
	const handleGoToChat = (orderId: number) => {
		console.log('🚀 handleGoToChat called for order:', orderId)
		toast('Функционал чата находится в разработке', {
			icon: '🚧',
			duration: 3000,
		})
	}

	const statusMap = items.reduce((acc: any, item: any) => {
		acc[item.id] = Object.fromEntries(item.status.map((st: Status) => [st.title, st.is_active]))
		return acc
	}, {})

	const filteredItems = items.filter((item: any) => !workedOutIds.includes(item.id))

	return (
		<div className={s.wrapper}>
            <div className={s.items}>
				<AnimatePresence>
					{filteredItems.map((item: any) => {
						const currentStatusMap = statusMap[item.id]

						return (
							<div key={item.id}>
								<motion.article
									className={s.item}
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: 10 }}
									transition={{ duration: 0.3 }}>
									
                                    <div className={s.cardHeader}>
                                        <span className={s.clientName}>{item.order?.user?.name || item.user?.name || 'Клиент'}</span>
										{/* <div className={s.cardStats}>
											<div className={s.statItem}>
												<Eye size={16} />
												<span>{Math.floor(Math.random() * 50) + 1}</span>
											</div>
											<div className={s.statItem}>
												<Phone size={16} />
												<span>{Math.floor(Math.random() * 10)}</span>
											</div>
										</div> */}
									</div>
									
									<div className={s.cardContent}>
                                        <h3 className={s.title}>
                                            {item.order?.tag?.name || t('service.other')}
                                        </h3>
                                        <div className={s.briefArea}>
                                            {item.order?.short_description && item.order.short_description.trim().length > 0 && (
                                                <p className={s.brief}>
                                                    {truncateDescription(item.order.short_description)}
                                                </p>
                                            )}
                                        </div>
                                        
                                        <div className={s.cardMeta}>
                                            <div className={s.metaRow}>
                                                <strong>{t('region')}:</strong>
                                                <span>{item.order?.region?.name || 'Не указан'}</span>
                                            </div>
                                            <div className={`${s.metaRow} ${s.metaRowAction}`}>
                                                <div className={s.metaLeft}>
                                                    <strong>{t('date')}:</strong>
                                                    <span>
                                                        <DateComponent date={item.order?.created_at} />
                                                    </span>
                                                </div>
                                                <button
                                                    className={s.detailsBtn}
                                                    onClick={() => setSelectedApp({ ...item.order, user: item.order?.user ?? item.user })}
                                                >
                                                    {t('details') || 'Подробнее'}
                                                </button>
                                            </div>
                                        </div>
                                        
                                        
									</div>
								</motion.article>
							</div>
						)
					})}
				</AnimatePresence>

            </div>

            {!isReachingEnd && (
                <div className={s.loadMoreWrapper}>
                    <Button
                        variant="primary"
                        disabled={isLoadingMore}
                        onClick={loadMore}>
                        {isLoadingMore ? 'Загрузка...' : 'Показать еще'}
                    </Button>
                </div>
            )}

			{selectedApp && (
				<ApplicationDetailsModal
					application={selectedApp}
					onClose={() => setSelectedApp(null)}
					onRespond={() => {}} // В моих заявках кнопка "В мои заявки" не нужна или должна быть скрыта
					isResponding={false}
				/>
			)}
		</div>
	)
}
