'use client'

import { useState } from 'react'
import { ChevronRightIcon } from '@heroicons/react/20/solid'

import { Button, cancelReasons, Modal, useModal } from '@/shared'
import { formatPublishedDate } from '@/shared/lib/helpers/formatPublishedDate'

import s from './MyApplicationsList.module.scss'
import { useMyApplicationsStore } from '../../model'
import { MyApplicationsLawyersCards } from '../MyApplicationsLawyersCards'

export const MyApplicationsList = () => {
	const { open, isOpen, close } = useModal()
	const { myApplications, cancelTheApplication } = useMyApplicationsStore()
	const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null)

	const handleOpenModal = (id: number) => {
		setSelectedApplicationId(id)
		open()
	}

	const handleSelectReason = (cancel_reason: string) => {
		if (selectedApplicationId !== null) {
			cancelTheApplication({
				application_id: selectedApplicationId,
				cancel_reason,
			})
			close()
		}
	}

	return (
		<>
			<div className={s.wrapper}>
				<div className={s.inner}>
					<div className={s.items}>
						{myApplications.map((item) => (
							<article
								className={s.item}
								key={item.id}>
								<div className={s.top}>
									<div className={s.topContent}>
										<p className={s.date}>{formatPublishedDate(item.created_at)}</p>
										<span className={s.status}>{item.status}</span>
									</div>
									<h5 className={s.title}>title</h5>
									{item.tag?.name && <span className={s.tag}>{item.tag.name}</span>}
									<p className={s.descr}>{item.description}</p>
								</div>

								<MyApplicationsLawyersCards />

								<div className={s.bottom}>
									{item.status !== 'Отменена' && (
										<Button
											className={s.btn}
											size={'full'}
											variant={'clear'}
											onClick={() => handleOpenModal(item.id)}>
											Отменить заявку
										</Button>
									)}
								</div>
							</article>
						))}
					</div>
				</div>
			</div>
			<Modal
				className={s.modal}
				isOpen={isOpen}
				onClose={close}
				title="Причина отзыва заявки">
				<div className={s.reasons}>
					{cancelReasons.map((reason) => (
						<Button
							key={reason.key}
							variant="clear"
							className={s.reasonBtn}
							onClick={() => handleSelectReason(reason.label)}>
							{reason.label}
							<ChevronRightIcon className={s.reasonIcon} />
						</Button>
					))}
				</div>
			</Modal>
		</>
	)
}
