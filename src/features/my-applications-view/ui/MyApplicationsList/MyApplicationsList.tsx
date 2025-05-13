'use client'

import { useState } from 'react'
import { ChevronRightIcon } from '@heroicons/react/20/solid'
import { cancelReasons } from '@/shared/lib'
import { DateComponent } from '@/shared/ui-kit/DateComponent'
import { Button, DescriptionText, Modal, useModal, Loader } from '@/shared/ui-kit'

import s from './MyApplicationsList.module.scss'
import { useMyApplicationsStore } from '../../model'
import { MyApplicationsLawyersCards } from '../MyApplicationsLawyersCards'

export const MyApplicationsList = ({ data }: any) => {
	const { open, isOpen, close } = useModal()
	const { cancelTheApplication, isCancellingApplication, setCancellingApplication } = useMyApplicationsStore()

	const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null)

	const handleOpenModal = (id: number) => {
		setSelectedApplicationId(id)
		open()
	}

	const handleClose = () => {
		close()
		setSelectedApplicationId(null)
		setCancellingApplication(false)
	}

	const handleSelectReason = async (cancel_reason: string) => {
		if (selectedApplicationId !== null) {
			setCancellingApplication(true)
			await cancelTheApplication({
				application_id: selectedApplicationId,
				cancel_reason,
			})
			handleClose()
		}
	}

	return (
		<>
			<div className={s.wrapper}>
				<div className={s.inner}>
					<div className={s.items}>
						{data.map((item) => (
							<article
								className={s.item}
								key={item.id}>
								<div className={s.top}>
									<div className={s.topContent}>
										<DateComponent date={item.created_at} />

										<span className={s.status}>{item.status}</span>
									</div>
									{item.tag?.name && <span className={s.tag}>{item.tag.name}</span>}
									<DescriptionText>{item.description}</DescriptionText>
								</div>

								<MyApplicationsLawyersCards responses={item.responses} />

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
				onClose={handleClose}
				title="Причина отзыва заявки">
				<div className={s.reasons}>
					{cancelReasons.map((reason) => (
						<Button
							key={reason.key}
							variant="clear"
							className={s.reasonBtn}
							onClick={() => handleSelectReason(reason.label)}
							disabled={isCancellingApplication}>
							{reason.label}
							{isCancellingApplication ? <Loader /> : <ChevronRightIcon className={s.reasonIcon} />}
						</Button>
					))}
				</div>
			</Modal>
		</>
	)
}
