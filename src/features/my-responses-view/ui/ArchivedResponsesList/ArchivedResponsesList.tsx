'use client'

import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/shared/ui-kit'
import { DateComponent } from '@/shared/ui-kit/DateComponent'
import { useState } from 'react'
import { ApplicationDetailsModal } from '@/app/[locale]/(dashboard)/dashboard/applications/components/ApplicationDetailsModal'
import { Trash2 } from 'lucide-react'

import s from '../MyResponsesList/MyResponsesList.module.scss'
import { truncateDescription } from '@/shared/lib'
import { useMyResponsesStore } from '../../model'

export const ArchivedResponsesList = ({ items, loadMore, isLoadingMore, isReachingEnd }: any) => {
	const t = useTranslations('applications')
	const [selectedApp, setSelectedApp] = useState<any>(null)
	const [deletingId, setDeletingId] = useState<number | null>(null)
	const { deleteResponse, deletedIds } = useMyResponsesStore()

	const handleDelete = async (id: number) => {
		setDeletingId(id)
		await deleteResponse(id)
		setDeletingId(null)
	}

	const filteredItems = items.filter((item: any) => !deletedIds.includes(item.id))

	return (
		<div className={s.wrapper}>
            <div className={s.items}>
				<AnimatePresence>
					{filteredItems.map((item: any) => (
						<div key={item.id}>
							<motion.article
								className={s.item}
								style={{ borderColor: '#9CA3AF', opacity: 0.85 }}
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 0.85, y: 0 }}
								exit={{ opacity: 0, y: 10 }}
								transition={{ duration: 0.3 }}>
								
                                <div className={s.cardHeader} style={{ background: '#9CA3AF' }}>
                                    <span className={s.clientName}>{item.order?.user?.name || item.user?.name || 'Клиент'}</span>
									<div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
										<span style={{ fontSize: 12, opacity: 0.9 }}>{t('archived')}</span>
										<button
											onClick={() => handleDelete(item.id)}
											disabled={deletingId === item.id}
											style={{
												background: 'transparent',
												border: 'none',
												cursor: deletingId === item.id ? 'not-allowed' : 'pointer',
												padding: '2px',
												display: 'flex',
												alignItems: 'center',
												opacity: deletingId === item.id ? 0.5 : 1,
											}}
											title="Удалить"
										>
											<Trash2 size={16} color="white" />
										</button>
									</div>
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
                                                style={{ borderColor: '#9CA3AF', color: '#9CA3AF' }}
                                                onClick={() => setSelectedApp({ ...item.order, user: item.order?.user ?? item.user })}
                                            >
                                                {t('details') || 'Подробнее'}
                                            </button>
                                        </div>
                                    </div>
								</div>
							</motion.article>
						</div>
					))}
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
					onRespond={() => {}}
					isResponding={false}
				/>
			)}
		</div>
	)
}
