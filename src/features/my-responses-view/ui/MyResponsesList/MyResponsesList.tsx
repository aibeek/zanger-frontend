'use client'

import { useTranslations, useLocale } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { Button, DescriptionText } from '@/shared/ui-kit'
import { DateComponent } from '@/shared/ui-kit/DateComponent'

import { Archive, Eye, Phone, Trash2, MessageCircle } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ApplicationDetailsModal } from '@/app/[locale]/(dashboard)/dashboard/applications/components/ApplicationDetailsModal'
import Cookies from 'js-cookie'

import s from './MyResponsesList.module.scss'
import { truncateDescription } from '@/shared/lib'
import { Status, useMyResponsesStore } from '../../model'

export const MyResponsesList = ({ items, loadMore, isLoadingMore, isReachingEnd }) => {
	const { workOut, closeItem, workedOutIds, archiveResponse, archivedIds, deleteResponse, deletedIds } = useMyResponsesStore()
	const t = useTranslations('applications')
	const [selectedApp, setSelectedApp] = useState<any>(null)
	const [archivingId, setArchivingId] = useState<number | null>(null)
	const [deletingId, setDeletingId] = useState<number | null>(null)

	// Функция для обработки нажатия на кнопку "Перейти в чат"
    const router = useRouter()
    const locale = useLocale()
    const role = Cookies.get('role')

	    const handleGoToChat = (application: any, participantId?: number | string, participantName?: string) => {
        const query = new URLSearchParams({
            applicationId: application.id.toString(),
            participantName: participantName || 'Client', 
            participantId: participantId?.toString() || '' 
        })
        router.push(`/${locale}/dashboard/chats?${query.toString()}`)
    }

	const handleArchive = async (id: number) => {
		setArchivingId(id)
		await archiveResponse(id)
		setArchivingId(null)
	}

	const handleDelete = async (id: number) => {
		setDeletingId(id)
		await deleteResponse(id)
		setDeletingId(null)
	}

	const statusMap = items.reduce((acc: any, item: any) => {
		if (Array.isArray(item.status)) {
			acc[item.id] = Object.fromEntries(item.status.map((st: Status) => [st.title, st.is_active]))
		}
		return acc
	}, {})

	const filteredItems = items.filter((item: any) => !workedOutIds.includes(item.id) && !archivedIds.includes(item.id) && !deletedIds.includes(item.id))

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
										<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
											<button
												onClick={() => handleArchive(item.id)}
												disabled={archivingId === item.id}
												style={{
													background: 'transparent',
													border: 'none',
													cursor: archivingId === item.id ? 'not-allowed' : 'pointer',
													padding: '2px',
													display: 'flex',
													alignItems: 'center',
													opacity: archivingId === item.id ? 0.5 : 1,
												}}
												title="В архив"
											>
												<Archive size={16} color="white" />
											</button>
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
					isResponding={false}
                    onChat={role !== 'lawyer' ? ((participantId, participantName) => {
                        handleGoToChat(selectedApp, participantId, participantName)
                    }) : undefined}
				/>
			)}
		</div>
	)
}
