'use client'

import { useFormContext, Controller } from 'react-hook-form'
import { SearchSelect } from '@/features/auth'
import { Button } from '@/shared/ui-kit'
import { PencilIcon } from '@heroicons/react/20/solid'
import { useProfileStatuses } from '../../model'
import s from './ProfilePersonalData.module.scss'
import { useTranslations } from 'next-intl'

type Props = {
	editableInputs: Record<string, boolean>
	setEditableInputs: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
	onSave: (field: any) => void
	t: ReturnType<typeof useTranslations>
}

export const LawyerFields = ({ editableInputs, setEditableInputs, onSave, t }: Props) => {
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
									disabled={!editableInputs.lawyer_type_ids}
									multiple={true}
								/>
							)
						}}
					/>
					{editableInputs.lawyer_type_ids ? (
						<Button
							onClick={() => onSave('lawyer_type_ids')}
							type="button"
							variant="clear"
							size="sm"
							className={s.saveBtn}>
							{t('profile.personal_data.save')}
						</Button>
					) : (
						<Button
							onClick={() =>
								setEditableInputs((prev) => ({
									...prev,
									lawyer_type_ids: true,
								}))
							}
							type="button"
							variant="clear"
							className={s.editBtn}>
							<PencilIcon
								className={s.editIcon}
								width={16}
								height={16}
								color="rgba(156,155,153,1)"
							/>
						</Button>
					)}
				</div>
			</div>
		</>
	)
}
