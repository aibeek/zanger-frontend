'use client'

import { useRef } from 'react'
import { useTranslations } from 'use-intl'
import { motion, AnimatePresence } from 'framer-motion'

import { useInfiniteScroll } from '@/shared/lib'
import { Button, DescriptionText, ListLoader, UserBox } from '@/shared/ui-kit'

import s from './MyResponsesList.module.scss'
import { Status, useMyResponsesStore } from '../../model'

export const MyResponsesList = ({ items, loadMore, isLoadingMore, isReachingEnd }) => {
	const { workOut, closeItem, workedOutIds } = useMyResponsesStore()
	const t = useTranslations('tabs.responsesList')
	const loadMoreRef = useRef(null)

	useInfiniteScroll({ loadMore, isLoadingMore, isReachingEnd, loadMoreRef })

	const statusMap = items.reduce((acc, item) => {
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

												<Button
													onClick={() => alert('Пожаловаться на клиента')}
													className={s.reportBtn}
													variant={'clear'}
													size={'auto'}>
													{t('reportClient')}
												</Button>
											</div>
										</div>
									</motion.article>
								</div>
							)
						})}
					</AnimatePresence>

					<ListLoader
						ref={loadMoreRef}
						isLoadingMore={isLoadingMore}
					/>
				</div>
			</div>
		</div>
	)
}
