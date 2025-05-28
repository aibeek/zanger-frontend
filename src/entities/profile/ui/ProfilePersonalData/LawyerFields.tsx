'use client'

import { useFormContext, Controller } from 'react-hook-form'
import { SearchSelect } from '@/features/auth'
import { Button } from '@/shared/ui-kit'
import { PencilIcon } from '@heroicons/react/20/solid'
import { useRegions } from '@/features/auth'
import { useProfileStatuses } from '../../model'
import s from './ProfilePersonalData.module.scss'
import { useTranslations } from 'next-intl'
import { regionGroupBy, sortRegions } from '@/shared/lib'

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

	const sortedRegions = sortRegions(regions)

	return (
		<>
			<div className={`${s.selectBox} ${s.inputBox}`}>
				<label className={s.label}>{t('profile.personal_data.regionLabel')}</label>
				<div className={s.searchSelect}>
					<Controller
						name="region_id"
						control={control}
						render={({ field }) => {
							const selectedRegion = sortedRegions.find((r) => r.id === field.value)

							return (
								<SearchSelect
									disabled={!editableInputs.region_id}
									className="search-select dashboard-select"
									data={sortedRegions}
									loading={loadingRegions}
									value={selectedRegion || null}
									onChange={(item) => {
										field.onChange(item ? item.id : null)
									}}
									getId={(item) => item.id}
									getLabel={(item) => item.name}
									groupBy={regionGroupBy}
									renderGroupLabel={(label) => <span>{label.slice(3)}</span>}
									placeholder="Выберите населенный пункт"
								/>
							)
						}}
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
						render={({ field }) => {
							const selectedStatuses = statuses.filter((s) =>
								Array.isArray(field.value) ? field.value.includes(s.id) : false,
							)

							return (
								<SearchSelect
									className="search-select dashboard-select"
									data={statuses}
									loading={loadingStatuses}
									value={selectedStatuses.length > 0 ? selectedStatuses : undefined}
									onChange={(selected) => {
										const ids = Array.isArray(selected) ? selected.map((s) => s.id) : []
										field.onChange(ids)
									}}
									getId={(item) => item.id}
									getLabel={(item) => item.name}
									groupBy={(item) => item.name.charAt(0)}
									renderGroupLabel={(groupName) => <span>{groupName}</span>}
									placeholder="Выберите свой статус"
									disabled={!editableInputs.lawyer_type_id}
									multiple={true}
								/>
							)
						}}
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
