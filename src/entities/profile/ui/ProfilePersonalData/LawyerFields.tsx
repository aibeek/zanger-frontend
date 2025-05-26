'use client'

import { useFormContext, Controller } from 'react-hook-form'
import { SearchSelect } from '@/features/auth'
import { Button } from '@/shared/ui-kit'
import { PencilIcon } from '@heroicons/react/20/solid'
import { useRegions } from '@/features/auth'
import { useProfileStatuses } from '../../model'
import s from './ProfilePersonalData.module.scss'
import { useTranslations } from 'next-intl'

type Props = {
	editableInputs: Record<string, boolean>
	setEditableInputs: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
	dirtyFields: Partial<Record<string, boolean>>
	onSave: (field: any) => void
	t: ReturnType<typeof useTranslations>
}

export const LawyerFields = ({ editableInputs, setEditableInputs, dirtyFields, onSave, t }: Props) => {
	const {
		control,
		formState: { errors },
	} = useFormContext()

	const { regions, loadingRegions } = useRegions()
	const { statuses, loading: loadingStatuses } = useProfileStatuses()

	const filteredRegions = regions.filter((region) => region.type.name !== 'Область')

	return (
		<>
			<div className={`${s.selectBox} ${s.inputBox}`}>
				<label className={s.label}>{t('profile.personal_data.regionLabel')}</label>
				<div className={s.searchSelect}>
					<Controller
						name="region_id"
						control={control}
						render={({ field }) => (
							<SearchSelect
								className="search-select dashboard-select"
								data={filteredRegions}
								loading={loadingRegions}
								value={filteredRegions.find((r) => r.id === field.value)}
								onChange={(r) => field.onChange(r?.id)}
								getId={(item) => item.id}
								getLabel={(item) => item.name}
								groupBy={(item) => {
									if (item.type.name === 'Город' && item.path !== item.name) return item.path
									if (item.type.name === 'Город' && item.path === item.name) return 'Города'
									return null
								}}
								renderGroupLabel={(name) => <span>{name}</span>}
								placeholder="Выберите регион или город"
								disabled={!editableInputs.region_id}
							/>
						)}
					/>
					{editableInputs.region_id ? (
						dirtyFields.region_id && (
							<Button
								onClick={() => onSave('region_id')}
								type="button"
								variant="clear"
								size="sm"
								className={s.saveBtn}>
								{t('profile.personal_data.save')}
							</Button>
						)
					) : (
						<Button
							onClick={() => setEditableInputs((prev) => ({ ...prev, region_id: true }))}
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

			<div className={`${s.selectBox} ${s.inputBox}`}>
				<label className={s.label}>{t('profile.personal_data.statusLabel')}</label>
				<div className={s.searchSelect}>
					<Controller
						name="lawyer_type_id"
						control={control}
						render={({ field }) => (
							<SearchSelect
								className="search-select dashboard-select"
								data={statuses}
								loading={loadingStatuses}
								value={statuses.find((s) => s.id === field.value)}
								onChange={(s) => field.onChange(s?.id ?? null)}
								getId={(item) => item.id}
								getLabel={(item) => item.name}
								groupBy={(item) => item.name.charAt(0)}
								renderGroupLabel={(groupName) => <span>{groupName}</span>}
								placeholder="Выберите свой статус"
								disabled={!editableInputs.lawyer_type_id}
							/>
						)}
					/>
					{editableInputs.lawyer_type_id ? (
						dirtyFields.lawyer_type_id && (
							<Button
								onClick={() => onSave('lawyer_type_id')}
								type="button"
								variant="clear"
								size="sm"
								className={s.saveBtn}>
								{t('profile.personal_data.save')}
							</Button>
						)
					) : (
						<Button
							onClick={() => setEditableInputs((prev) => ({ ...prev, lawyer_type_id: true }))}
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
