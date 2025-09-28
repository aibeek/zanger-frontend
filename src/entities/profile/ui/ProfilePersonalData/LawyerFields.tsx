'use client'

import { useFormContext, Controller } from 'react-hook-form'
import { SearchSelect } from '@/features/auth'
import { useProfileStatuses } from '../../model'
import s from './ProfilePersonalData.module.scss'
import { useTranslations } from 'next-intl'
import { PencilIcon } from '@heroicons/react/20/solid'

type Props = {
	t: ReturnType<typeof useTranslations>
	variant?: 'default' | 'clean'
	editableInputs?: any
	setEditableInputs?: any
}

export const LawyerFields = ({ t, variant = 'default', editableInputs, setEditableInputs }: Props) => {
	const { control } = useFormContext()
	const { statuses } = useProfileStatuses()

	if (variant === 'clean') {
		return (
			<div className={s.cleanInputWrapper}>
				<label className={s.cleanLabel}>{t('profile.personal_data.statusLabel')}</label>
				<div className={s.cleanInputBox}>
					<Controller
						name="lawyer_type_ids"
						control={control}
						render={({ field }) => {
							const selectedStatuses = statuses.filter((s) =>
								Array.isArray(field.value) ? field.value.includes(s.id) : false,
							)

							return (
								<SearchSelect
									className={`search-select dashboard-select custom-select ${!editableInputs?.lawyer_type_ids ? 'disabled' : ''}`}
									data={statuses}
									value={selectedStatuses}
									onChange={(selected) => {
										const ids = Array.isArray(selected) ? selected.map((s) => s.id) : []
										field.onChange(ids)
									}}
									getId={(item) => item.id}
									getLabel={(item) => item.name}
									placeholder={t('profile.personal_data.chooseStatus')}
									disabled={!editableInputs?.lawyer_type_ids}
									multiple={true}
								/>
							)
						}}
					/>
					<button
						type="button"
						className={s.cleanEditBtn}
						onClick={() => setEditableInputs?.(prev => ({ ...prev, lawyer_type_ids: !prev.lawyer_type_ids }))}
					>
						<PencilIcon className={s.cleanEditIcon} />
					</button>
				</div>
			</div>
		)
	}

	return (
		<>
			<div className={`${s.selectBox} ${s.inputBox}`}>
				<label className={s.label}>{t('profile.personal_data.statusLabel')}</label>
				<div className={s.searchSelect}>
					<Controller
						name="lawyer_type_ids"
						control={control}
						render={({ field }) => {
							const selectedStatuses = statuses.filter((s) =>
								Array.isArray(field.value) ? field.value.includes(s.id) : false,
							)

							return (
								<SearchSelect
									className={`search-select dashboard-select custom-select`}
									data={statuses}
									value={selectedStatuses}
									onChange={(selected) => {
										const ids = Array.isArray(selected) ? selected.map((s) => s.id) : []
										field.onChange(ids)
									}}
									getId={(item) => item.id}
									getLabel={(item) => item.name}
									placeholder={t('profile.personal_data.chooseStatus')}
									disabled={false}
									multiple={true}
								/>
							)
						}}
					/>
				</div>
			</div>
		</>
	)
}
