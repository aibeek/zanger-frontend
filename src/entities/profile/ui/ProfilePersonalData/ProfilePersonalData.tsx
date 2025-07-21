'use client'

import { IMaskInput } from 'react-imask'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PencilIcon } from '@heroicons/react/20/solid'

import { useRegions } from '@/features/auth'
import { Button, Input } from '@/shared/ui-kit'
import { SearchSelect, useLoginStore } from '@/features/auth'
import { LawyerProfile, UserProfile } from '@/shared/lib/types'
import personalDataIcon from '@/app/assets/icons/personal-data.svg'
import { useRegionsUtils, ProfilePersonalDataFormValues, profilePersonalDataSchema } from '@/shared/lib'

import s from './ProfilePersonalData.module.scss'
import { ProfileTabWrapper } from '../ProfileTabWrapper'
import { LawyerFields } from './LawyerFields'
import { useEditPersonalDataStore } from '../../model/useEditPersonalData'

type FieldKey = keyof ProfilePersonalDataFormValues

type FieldConfig = {
	field: FieldKey
	label: string
	placeholder: string
	isMasked: boolean
	mask?: string
}

const phoneMask = '+{7} (000) 000-00-00'

export const ProfilePersonalData = ({ role }: { role: string }) => {
	const t = useTranslations()
	const personalData: UserProfile = useLoginStore((state) => state.personalData)
	const { updateProfilePersonalData } = useEditPersonalDataStore()

	const disclosureBtnRef = useRef<HTMLButtonElement>(null)

	const isLawyer = role === 'lawyer'
	const lawyerData = isLawyer ? (personalData as LawyerProfile).lawyer : null
	const { regions } = useRegions()
	const { optionsForSelect, allOptions } = useRegionsUtils(regions, [])

	const methods = useForm<ProfilePersonalDataFormValues>({
		resolver: zodResolver(profilePersonalDataSchema),
		mode: 'onChange',
		defaultValues: {
			name: personalData.name,
			phone: personalData.phone,
			telegram: lawyerData?.telegram ?? '',
			whatsapp: lawyerData?.whatsapp ?? '',
			iin: lawyerData?.iin ?? '',
			region_id: personalData.region.id ?? null,
			lawyer_type_ids: lawyerData?.lawyer_types?.map((type) => type.id) ?? [],
		},
	})

	const {
		register,
		control,
		watch,
		setFocus,
		formState: { errors, dirtyFields },
	} = methods

	const [editableInputs, setEditableInputs] = useState(() => ({
		name: false,
		phone: false,
		telegram: false,
		whatsapp: false,
		iin: false,
		region_id: false,
		lawyer_type_ids: false,
	}))

	useEffect(() => {
		for (const key in editableInputs) {
			if (editableInputs[key as keyof typeof editableInputs]) {
				setFocus(key as keyof ProfilePersonalDataFormValues)
			}
		}
	}, [editableInputs, setFocus])

	const onSave = async (field: keyof ProfilePersonalDataFormValues) => {
		let value = field === 'name' ? methods.getValues('name') : watch(field)
		if (value === 'Не указан') value = null

		try {
			await updateProfilePersonalData({ [field]: value }, role, t)

			setEditableInputs((prev) => ({ ...prev, [field]: false }))
		} catch (e) {
			console.error('Ошибка при сохранении:', e)
		}
	}

	const fields: FieldConfig[] = [
		{
			field: 'name',
			label: t('profile.personal_data.nameLabel'),
			placeholder: t('profile.personal_data.namePlaceholder'),
			isMasked: false,
		},
		{
			field: 'phone',
			label: t('profile.personal_data.phoneLabel'),
			placeholder: t('profile.personal_data.phonePlaceholder'),
			isMasked: true,
			mask: phoneMask,
		},
		{
			field: 'region_id',
			label: t('profile.personal_data.regionLabel'),
			placeholder: t('profile.personal_data.regionPlaceholder'),
			isMasked: false,
		},
		...(isLawyer
			? [
					{
						field: 'telegram' as const,
						label: t('profile.personal_data.telegramLabel'),
						placeholder: t('profile.personal_data.telegramPlaceholder'),
						isMasked: false,
					},
					{
						field: 'whatsapp' as const,
						label: t('profile.personal_data.whatsappLabel'),
						placeholder: t('profile.personal_data.whatsappPlaceholder'),
						isMasked: false,
					},
					{
						field: 'iin' as const,
						label: t('profile.personal_data.iinLabel'),
						placeholder: t('profile.personal_data.iinPlaceholder'),
						isMasked: false,
					},
				]
			: []),
	]

	return (
		<ProfileTabWrapper
			title={t('profile.personal_data.title')}
			imgSrc={personalDataIcon}
			imgAlt="personalData"
			panel_title={t('profile.personal_data.panelTitle')}
			panel_descr={t('profile.personal_data.panelDescription')}
			ref={disclosureBtnRef}>
			<FormProvider {...methods}>
				<form className={s.form}>
					{fields.map(({ field, label, placeholder, mask, isMasked }) => {
						const isEditing = editableInputs[field]
						const hasError = !!errors[field]

						if (field === 'region_id') {
							return (
								<div
									key={field}
									className={s.inputWrapper}>
									<div className={s.inputHeader}>
										<label
											htmlFor={field}
											className={s.label}>
											{label}
										</label>
									</div>
									<div className={s.inputBox}>
										<Controller
											name="region_id"
											control={control}
											render={({ field }) => {
												const selected =
													allOptions.find((r) => String(r.id) === String(field.value)) || null

												return (
													<SearchSelect
														className="search-select dashboard-select custom-select"
														data={optionsForSelect}
														value={selected}
														onChange={(region) => field.onChange(region?.id)}
														getId={(item) => item.id}
														getLabel={(item) =>
															item.path ? `${item.name} (${item.path})` : item.name
														}
														renderGroupLabel={(label) => <span>{label.slice(3)}</span>}
														placeholder={placeholder}
														disabled={!editableInputs.region_id}
														searchData={allOptions}
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
												onClick={() =>
													setEditableInputs((prev) => ({ ...prev, region_id: true }))
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
										{errors.region_id && (
											<p className={s.error}>{t(errors.region_id.message || '')}</p>
										)}
									</div>
								</div>
							)
						}

						return (
							<div
								key={field}
								className={s.inputWrapper}>
								<div className={s.inputHeader}>
									<label
										className={s.label}
										htmlFor={field}>
										{label}
									</label>
								</div>
								<div className={s.inputBox}>
									{isMasked ? (
										<Controller
											name={field}
											control={control}
											render={({ field: { onChange, onBlur, value } }) => (
												<Input
													id={field}
													type="tel"
													placeholder={placeholder}
													disabled={!isEditing}
													hasError={hasError}
													// @ts-expect-error fix it
													as={IMaskInput}
													mask={mask}
													// @ts-expect-error fix it
													value={value}
													onAccept={(val: string) => onChange(val)}
													onBlur={onBlur}
													unmask={true}
													className={s.input}
												/>
											)}
										/>
									) : (
										<Input
											id={field}
											type="text"
											placeholder={placeholder}
											disabled={!isEditing}
											{...register(field)}
											className={`${s.input} ${hasError ? s.inputError : ''}`}
										/>
									)}

									{isEditing ? (
										dirtyFields[field] && (
											<Button
												onClick={() => onSave(field)}
												type="button"
												variant="clear"
												size="sm"
												className={s.saveBtn}>
												{t('profile.personal_data.save')}
											</Button>
										)
									) : (
										<Button
											onClick={() =>
												setEditableInputs((prev) => ({
													...prev,
													[field]: true,
												}))
											}
											type="button"
											variant="clear"
											className={s.editBtn}>
											<PencilIcon
												className={s.editIcon}
												width={16}
												height={16}
												color="rgba(156, 155, 153, 1)"
											/>
										</Button>
									)}
									{hasError && <p className={s.error}>{t(errors[field]?.message || '')}</p>}
								</div>
							</div>
						)
					})}

					{isLawyer && (
						<LawyerFields
							editableInputs={editableInputs}
							setEditableInputs={setEditableInputs}
							onSave={onSave}
							t={t}
						/>
					)}
				</form>
			</FormProvider>
		</ProfileTabWrapper>
	)
}
