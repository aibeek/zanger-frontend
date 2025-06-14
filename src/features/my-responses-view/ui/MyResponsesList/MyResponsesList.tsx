'use client'

import { useTranslations } from 'use-intl'
import { motion, AnimatePresence } from 'framer-motion'

import { Button, DescriptionText, UserBox } from '@/shared/ui-kit'

import s from './MyResponsesList.module.scss'
import { Status, useMyResponsesStore } from '../../model'
import { ReportButton } from '@/features/report/ui/ReportButton'

export const MyResponsesList = ({ items, loadMore, isLoadingMore, isReachingEnd }) => {
	const { workOut, closeItem, workedOutIds } = useMyResponsesStore()
	const t = useTranslations('tabs.responsesList')

	const statusMap = items.reduce((acc: any, item: any) => {
		acc[item.id] = Object.fromEntries(item.status.map((st: Status) => [st.title, st.is_active]))
		return acc
	}, {})

	const filteredItems = items.filter((item: any) => !workedOutIds.includes(item.id))

	return (
		<div className={s.wrapper}>
			<div className={s.inner}>
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
										<div className={s.top}>
											<UserBox data={item} />

											<div className={s.title}>
												<span className={s.specialization}>{item.order.tag.specialization.name}</span>
												<span className={s.tag}>{item.order.tag.name}</span>
											</div>

											<DescriptionText>{item.order.description}</DescriptionText>
										</div>

										<div className={s.middle}>
											<ul className={s.statusList}>
												{item.status.map((st: Status) => {
													const isActive = currentStatusMap[st.title]
													return (
														<li
															key={st.title}
															className={s.statusItemBox}>
															<span className={`${s.dot} ${isActive ? s.active : ''}`}></span>
															<span
																className={s.statusItem}
																style={{ fontWeight: isActive ? '600' : '400' }}>
																{st.title}
															</span>
														</li>
													)
												})}
											</ul>
										</div>

										<div className={s.bottom}>
											<div className={s.btns}>
												{currentStatusMap['Запрос моих контактов'] && !workedOutIds.includes(item.id) && (
													<Button
														style={{ padding: '8px 30px' }}
														onClick={() => workOut(item.id)}>
														{t('workedOut')}
													</Button>
												)}

												{workedOutIds.includes(item.id) && (
													<Button
														style={{ padding: '8px 30px' }}
														onClick={() => closeItem(item.id)}>
														{t('close')}
													</Button>
												)}

												<ReportButton
													userId={item.user.id}
													role="client"
												/>
											</div>
										</div>
									</motion.article>
								</div>
							)
						})}
					</AnimatePresence>

					{!isReachingEnd && (
						<div className={s.loadMoreWrapper}>
							<Button
								variant="primary"
								size={'full'}
								disabled={isLoadingMore}
								onClick={loadMore}>
								{isLoadingMore ? t('loading') : t('load_more')}
							</Button>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
