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
import { ProfileDelete } from '../ProfileDelete/ProfileDelete'
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

export const ProfilePersonalData = ({ role, variant = 'default' }: { role: string; variant?: 'default' | 'clean' }) => {
	const t = useTranslations()
	const personalData: UserProfile = useLoginStore((state) => state.personalData)
	const { updateProfilePersonalData } = useEditPersonalDataStore()

	// Все хуки должны быть объявлены в начале компонента
	const disclosureBtnRef = useRef<HTMLButtonElement>(null)
	const { regions } = useRegions()
	const { optionsForSelect, allOptions } = useRegionsUtils(regions, [])

	const isLawyer = role === 'lawyer'
	const lawyerData = isLawyer ? (personalData as LawyerProfile)?.lawyer : null

	const methods = useForm<ProfilePersonalDataFormValues>({
		resolver: zodResolver(profilePersonalDataSchema),
		mode: 'onChange',
		defaultValues: {
			name: personalData?.name ?? '',
			phone: personalData?.phone ?? '',
			region_id: personalData?.region?.id ?? null,
			lawyer_type_ids: lawyerData?.lawyer_types?.map((type) => type.id) ?? [],
		},
	})

	const {
		register,
		control,
		watch,
		setFocus,
		handleSubmit,
		formState: { errors, dirtyFields },
	} = methods

	const [editableInputs, setEditableInputs] = useState(() => ({
		name: false,
		phone: false,
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

	// Проверяем, загружены ли данные
	if (!personalData) {
		if (variant === 'clean') {
			return (
				<div className={s.cleanWrapper}>
					<div className={s.cleanHeader}>
						<h3 className={s.cleanTitle}>{t('profile.personal_data.panelTitle')}</h3>
						<p className={s.cleanDescr}>{t('profile.personal_data.panelDescription')}</p>
					</div>
					<div>Загрузка...</div>
				</div>
			)
		}
		
		return (
			<ProfileTabWrapper
				title={t('profile.personal_data.title')}
				imgSrc={personalDataIcon}
				imgAlt="Personal Data"
				panel_title={t('profile.personal_data.panelTitle')}
			>
				<div>Загрузка...</div>
			</ProfileTabWrapper>
		)
	}

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
		// Статус будет добавлен через LawyerFields компонент после поля телефона
		{
			field: 'region_id',
			label: t('profile.personal_data.regionLabel'),
			placeholder: t('profile.personal_data.regionPlaceholder'),
			isMasked: false,
		},
	]

	const onSubmitAll = handleSubmit(async (values) => {
		const payload: any = {
			name: values.name || undefined,
			phone: values.phone || undefined,
			region_id: values.region_id ?? undefined,
		}
		if (isLawyer) {
			payload.lawyer_type_ids = values.lawyer_type_ids && values.lawyer_type_ids.length
				? (values.lawyer_type_ids as any)
				: undefined
		}

		await updateProfilePersonalData(payload, role, t)
	})

	if (variant === 'clean') {
		return (
			<div className={s.cleanWrapper}>
				<div className={s.cleanHeader}>
					<h3 className={s.cleanTitle}>{t('profile.personal_data.panelTitle')}</h3>
					<p className={s.cleanDescr}>{t('profile.personal_data.panelDescription')}</p>
				</div>
				
				<FormProvider {...methods}>
					<form className={s.cleanForm} onSubmit={onSubmitAll}>
						{/* Основные поля для всех ролей */}
						{/* ФИО */}
						<div className={s.cleanInputWrapper}>
							<label className={s.cleanLabel} htmlFor="name">
								{t('profile.personal_data.nameLabel')}
							</label>
							<div className={s.cleanInputBox}>
								<Input
									id="name"
									type="text"
									placeholder={t('profile.personal_data.namePlaceholder')}
									disabled={!editableInputs.name}
									{...register('name')}
									className={`${s.cleanInput} ${errors.name ? s.cleanInputError : ''} ${!editableInputs.name ? s.cleanInputReadOnly : ''}`}
									style={{
										flex: '1',
										minWidth: '0',
										width: 'auto'
									}}
								/>
								<button
									type="button"
									className={s.cleanEditBtn}
									onClick={() => setEditableInputs(prev => ({ ...prev, name: !prev.name }))}
								>
									<PencilIcon className={s.cleanEditIcon} />
								</button>
								{errors.name && <p className={s.cleanError}>{t(errors.name?.message || '')}</p>}
							</div>
						</div>

						{/* Номер телефона */}
						<div className={s.cleanInputWrapper}>
							<label className={s.cleanLabel} htmlFor="phone">
								{t('profile.personal_data.phoneLabel')}
							</label>
							<div className={s.cleanInputBox}>
								<Controller
									name="phone"
									control={control}
									render={({ field: { onChange, onBlur, value } }) => (
										<IMaskInput
											id="phone"
											type="tel"
											placeholder={t('profile.personal_data.phonePlaceholder')}
											disabled={!editableInputs.phone}
											mask={phoneMask}
											value={value}
											onAccept={(val: string) => onChange(val)}
											onBlur={onBlur}
											unmask={true}
											className={`${s.cleanInput} ${errors.phone ? s.cleanInputError : ''} ${!editableInputs.phone ? s.cleanInputReadOnly : ''}`}
											style={{
												flex: '1',
												minWidth: '0',
												width: 'auto',
												padding: '12px 16px',
												border: '1px solid #D1D5DB',
												borderRadius: '8px',
												fontSize: '14px',
												background: !editableInputs.phone ? '#F9FAFB' : '#FFFFFF'
											}}
										/>
									)}
								/>
								<button
									type="button"
									className={s.cleanEditBtn}
									onClick={() => setEditableInputs(prev => ({ ...prev, phone: !prev.phone }))}
								>
									<PencilIcon className={s.cleanEditIcon} />
								</button>
								{errors.phone && <p className={s.cleanError}>{t(errors.phone?.message || '')}</p>}
							</div>
						</div>

						{/* Статус (только для юристов) */}
						{isLawyer && (
							<LawyerFields t={t} variant="clean" editableInputs={editableInputs} setEditableInputs={setEditableInputs} />
						)}

						{/* Регион */}
						<div className={s.cleanInputWrapper}>
							<label htmlFor="region_id" className={s.cleanLabel}>
								{t('profile.personal_data.regionLabel')}
							</label>
							<div className={s.cleanInputBox}>
								<Controller
									name="region_id"
									control={control}
									render={({ field }) => {
										const selected =
											allOptions.find((r) => String(r.id) === String(field.value)) || null

										return (
											<SearchSelect
												className={`search-select dashboard-select custom-select ${!editableInputs.region_id ? 'disabled' : ''}`}
												data={optionsForSelect}
												value={selected}
												onChange={(region) => field.onChange(region?.id)}
												getId={(item) => item.id}
												getLabel={(item) =>
													item.path ? `${item.name} (${item.path})` : item.name
												}
												renderGroupLabel={(label) => <span>{label.slice(3)}</span>}
												placeholder={t('profile.personal_data.regionPlaceholder')}
												disabled={!editableInputs.region_id}
												searchData={allOptions}
											/>
										)
									}}
								/>
								<button
									type="button"
									className={s.cleanEditBtn}
									onClick={() => setEditableInputs(prev => ({ ...prev, region_id: !prev.region_id }))}
								>
									<PencilIcon className={s.cleanEditIcon} />
								</button>
								{errors.region_id && (
									<p className={s.cleanError}>{t(errors.region_id.message || '')}</p>
								)}
							</div>
						</div>

						<div className={s.cleanBtns}>
							<Button variant="primary" size="auto" type="submit" className={s.saveBtn}>
								Сохранить изменения
							</Button>
							<ProfileDelete />
						</div>
					</form>
				</FormProvider>
			</div>
		)
	}

	return (
		<ProfileTabWrapper
			title={t('profile.personal_data.title')}
			imgSrc={personalDataIcon}
			imgAlt="personalData"
			panel_title={t('profile.personal_data.panelTitle')}
			ref={disclosureBtnRef}>
			<FormProvider {...methods}>
				<form className={s.form} onSubmit={onSubmitAll}>
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
														disabled={false}
														searchData={allOptions}
													/>
												)
											}}
										/>
										{/* Inline edit/save controls hidden by styles; no per-field actions */}
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
													disabled={false}
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
											disabled={false}
											{...register(field)}
											className={`${s.input} ${hasError ? s.inputError : ''}`}
										/>
									)}
									{/* Per-field edit/save controls removed for simplified UX */}
									{hasError && <p className={s.error}>{t(errors[field]?.message || '')}</p>}
								</div>
							</div>
						)
					})}

					{isLawyer && (
						<LawyerFields t={t} variant="default" />
					)}

					<div className={s.btns}>
						<Button variant="primary" size="auto" type="submit">
							{t('profile.change_password.save')}
						</Button>
						<ProfileDelete />
					</div>
				</form>
			</FormProvider>
		</ProfileTabWrapper>
	)
}
