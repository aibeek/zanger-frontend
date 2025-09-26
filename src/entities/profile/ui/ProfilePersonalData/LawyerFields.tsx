'use client'

import { useFormContext, Controller } from 'react-hook-form'
import { SearchSelect } from '@/features/auth'
import { useProfileStatuses } from '../../model'
import s from './ProfilePersonalData.module.scss'
import { useTranslations } from 'next-intl'

type Props = {
	t: ReturnType<typeof useTranslations>
}

export const LawyerFields = ({ t }: Props) => {
	const { control } = useFormContext()
	const { statuses } = useProfileStatuses()

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
