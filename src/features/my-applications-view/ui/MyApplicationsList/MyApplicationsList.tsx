'use client'

import { useRef, useState } from 'react'
import { ChevronRightIcon } from '@heroicons/react/20/solid'
import { useInfiniteScroll } from '@/shared/lib'
import { DateComponent } from '@/shared/ui-kit/DateComponent'
import { Textarea } from '@headlessui/react'
import { Button, DescriptionText, Modal, useModal, Loader, ListLoader } from '@/shared/ui-kit'
import { useTranslations } from 'next-intl'

import s from './MyApplicationsList.module.scss'
import { useMyApplicationsStore } from '../../model'
import { MyApplicationsLawyersCards } from '../MyApplicationsLawyersCards'

export const MyApplicationsList = ({ items, loadMore, isLoadingMore, isReachingEnd, mutate }) => {
	const { open, isOpen, close } = useModal()
	const { cancelTheApplication, isCancellingApplication, setCancellingApplication } = useMyApplicationsStore()
	const [showTextarea, setShowTextarea] = useState(false)
	const [customReason, setCustomReason] = useState('')
	const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null)

	const t = useTranslations('myApplications')
	const loadMoreRef = useRef(null)
	useInfiniteScroll({ loadMore, isLoadingMore, isReachingEnd, loadMoreRef })

	const cancelReasons = [
		{ key: 'resolve', label: t('cancelReasons.resolve') },
		{ key: 'non_actual', label: t('cancelReasons.non_actual') },
		{ key: 'didnt_help', label: t('cancelReasons.didnt_help') },
		{ key: 'other', label: t('cancelReasons.other') },
	]

	const handleOpenModal = (id: number) => {
		setSelectedApplicationId(id)
		open()
	}

	const handleClose = () => {
		close()
		setSelectedApplicationId(null)
		setCancellingApplication(false)
		setShowTextarea(false)
		setCustomReason('')
	}

	const handleSelectReason = async (cancel_reason: string) => {
		if (cancel_reason === t('cancelReasons.other')) {
			setShowTextarea(true)
			return
		}

		if (selectedApplicationId !== null) {
			setCancellingApplication(true)
			await cancelTheApplication({ application_id: selectedApplicationId, cancel_reason }, mutate, t)
			handleClose()
		}
	}

	const handleSubmitCustomReason = async () => {
		if (!customReason) return

		setCancellingApplication(true)
		await cancelTheApplication({ application_id: selectedApplicationId, cancel_reason: customReason }, mutate, t)
		handleClose()
	}

	return (
		<>
			<div className={s.wrapper}>
				<div className={s.inner}>
					<div className={s.items}>
						{items.map((item) => (
							<article className={s.item} key={item.id}>
								<div className={s.top}>
									<div className={s.title}>{item.title}</div>
									<div className={s.description}>{item.description}</div>
									<div className={s.dataRow}>
										<span className={s.deadline}>{t('deadline')}: {item.deadline}</span>
										<span className={s.publishDate}>{t('publishDate')}: <DateComponent date={item.created_at} /></span>
									</div>
								</div>
								<div className={s.buttonsRow}>
									<Button className={s.editBtn} variant="primary" size="full">{t('editButton')}</Button>
									<Button className={s.completeBtn} variant="danger" size="full" onClick={() => handleOpenModal(item.id)}>{t('completeButton')}</Button>
								</div>
							</article>
						))}

						<ListLoader
							ref={loadMoreRef}
							isLoadingMore={isLoadingMore}
						/>
					</div>
				</div>
			</div>

			<Modal
				className={s.modal}
				isOpen={isOpen}
				onClose={handleClose}
				title={t('modal.title')}>
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

				{showTextarea && (
					<div className={s.customReason}>
						<Textarea
							placeholder={t('customReason.placeholder')}
							className={s.textarea}
							value={customReason}
							onChange={(e) => setCustomReason(e.target.value)}
						/>
						<Button
							className={s.submitCustomReason}
							variant="primary"
							size="md"
							onClick={handleSubmitCustomReason}
							disabled={isCancellingApplication || !customReason.trim()}>
							{isCancellingApplication ? t('customReason.canceling') : t('customReason.confirm')}
						</Button>
					</div>
				)}
			</Modal>
		</>
	)
}
