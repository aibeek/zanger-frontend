'use client'

import { useState } from 'react'
import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/20/solid'
import { Textarea } from '@headlessui/react'
import { Button, Loader } from '@/shared/ui-kit'
import { useTranslations } from 'next-intl'

import s from './CompleteApplicationForm.module.scss'

interface CompleteApplicationFormProps {
	applicationId: number
	onComplete: (applicationId: number, reason: string) => Promise<void>
	onCancel: () => void
	isLoading: boolean
}

export const CompleteApplicationForm = ({ 
	applicationId, 
	onComplete, 
	onCancel, 
	isLoading 
}: CompleteApplicationFormProps) => {
	const [showTextarea, setShowTextarea] = useState(false)
	const [customReason, setCustomReason] = useState('')

	const t = useTranslations('myApplications')

	const cancelReasons = [
		{ key: 'resolve', label: t('cancelReasons.resolve') },
		{ key: 'non_actual', label: t('cancelReasons.non_actual') },
		{ key: 'didnt_help', label: t('cancelReasons.didnt_help') },
		{ key: 'other', label: t('cancelReasons.other') },
	]

	const handleSelectReason = async (reasonKey: string) => {
		if (reasonKey === 'other') {
			setShowTextarea(true)
			return
		}

		const reasonText = t(`cancelReasons.${reasonKey}`)
		await onComplete(applicationId, reasonText)
	}

	const handleSubmitCustomReason = async () => {
		if (!customReason.trim()) return
		await onComplete(applicationId, customReason.trim())
	}

	const handleBack = () => {
		if (showTextarea) {
			setShowTextarea(false)
			setCustomReason('')
		} else {
			onCancel()
		}
	}

	return (
		<div className={s.wrapper}>
			<div className={s.header}>
				<Button
					variant="clear"
					className={s.backButton}
					onClick={handleBack}
					disabled={isLoading}>
					<ChevronLeftIcon className={s.backIcon} />
					{showTextarea ? 'К выбору причин' : 'Назад к заявкам'}
				</Button>
				<h2 className={s.title}>
					{showTextarea ? 'Укажите причину завершения' : 'Выберите причину завершения заявки'}
				</h2>
			</div>

			{!showTextarea ? (
				<div className={s.reasons}>
					{cancelReasons.map((reason) => (
						<Button
							key={reason.key}
							variant="clear"
							className={s.reasonBtn}
							onClick={() => handleSelectReason(reason.key)}
							disabled={isLoading}>
							<span className={s.reasonText}>{reason.label}</span>
							{isLoading && reason.key !== 'other' ? (
								<Loader />
							) : (
								<ChevronRightIcon className={s.reasonIcon} />
							)}
						</Button>
					))}
				</div>
			) : (
				<div className={s.customReason}>
					<label className={s.customReasonLabel} htmlFor="customReasonTextarea">
						{t('customReason.label', { defaultValue: 'Укажите свою причину' })}
					</label>
					<Textarea
						id="customReasonTextarea"
						placeholder={t('customReason.placeholder')}
						className={s.textarea}
						value={customReason}
						onChange={(e) => setCustomReason(e.target.value)}
						disabled={isLoading}
					/>
					<div className={s.customReasonButtons}>
						<Button
							className={s.submitButton}
							variant="primary"
							size="md"
							onClick={handleSubmitCustomReason}
							disabled={isLoading || !customReason.trim()}>
							{isLoading ? t('customReason.canceling') : t('customReason.confirm')}
						</Button>
					</div>
				</div>
			)}
		</div>
	)
}
