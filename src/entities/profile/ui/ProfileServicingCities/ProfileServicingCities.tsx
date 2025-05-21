'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useRef } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button, Checkbox } from '@/shared/ui-kit'
import { useRegions } from '@/features/auth'
import personalDataIcon from '@/app/assets/icons/personal-data.svg'

import s from './ProfileServicingCities.module.scss'
import { ProfileTabWrapper } from '../ProfileTabWrapper'
import { useServicingRegions } from '../../model/useServicingRegions'
import { ServicingCitiesForm, servicingCitiesSchema } from '@/shared/lib'

export const ProfileServicingCities = () => {
	const t = useTranslations()
	const { regions } = useRegions()
	const { updateServicingRegions, servicingCities, fetchServicingRegions, isSubmitting } = useServicingRegions()
	const disclosureBtnRef = useRef<HTMLButtonElement>(null)

	const {
		control,
		handleSubmit,
		setValue,
		formState: { errors },
	} = useForm<ServicingCitiesForm>({
		resolver: zodResolver(servicingCitiesSchema),
		defaultValues: { region_ids: [] },
	})

	useEffect(() => {
		fetchServicingRegions()
	}, [])

	useEffect(() => {
		if (servicingCities?.length) {
			setValue(
				'region_ids',
				servicingCities.map((region) => region.id),
			)
		}
	}, [servicingCities, setValue])

	const onSubmit = async (data: ServicingCitiesForm) => {
		await updateServicingRegions({ region_ids: data.region_ids })
	}

	const cities = regions.filter((r) => r.path === r.name)
	const oblasts = regions.filter((r) => r.path !== r.name)

	return (
		<ProfileTabWrapper
			title={t('profile.servicing_cities.title')}
			imgSrc={personalDataIcon}
			imgAlt="personalData"
			panel_title={t('profile.servicing_cities.panelTitle')}
			panel_descr={t('profile.servicing_cities.panelDescription')}
			ref={disclosureBtnRef}>
			<form onSubmit={handleSubmit(onSubmit)}>
				<Controller
					control={control}
					name="region_ids"
					render={({ field }) => (
						<div className={s.checkboxes}>
							<h4 className={s.groupTitle}>{t('profile.servicing_cities.cities') || 'Города'}</h4>
							{cities.map((region) => (
								<Checkbox
									className={s.checkbox}
									key={region.id}
									label={region.name}
									checked={field.value.includes(region.id)}
									onChange={(checked) => {
										const newValue = checked
											? [...field.value, region.id]
											: field.value.filter((id) => id !== region.id)
										field.onChange(newValue)
									}}
								/>
							))}

							<h4
								style={{ marginTop: '20px' }}
								className={s.groupTitle}>
								{t('profile.servicing_cities.oblasts') || 'Области'}
							</h4>
							{oblasts.map((region) => (
								<Checkbox
									className={s.checkbox}
									key={region.id}
									label={region.name}
									checked={field.value.includes(region.id)}
									onChange={(checked) => {
										const newValue = checked
											? [...field.value, region.id]
											: field.value.filter((id) => id !== region.id)
										field.onChange(newValue)
									}}
								/>
							))}
						</div>
					)}
				/>
				{errors.region_ids && <p className={s.error}>{errors.region_ids.message}</p>}

				<Button
					type="submit"
					variant="primary"
					size="auto"
					style={{ padding: '8px 30px', marginTop: '-22px' }}
					disabled={isSubmitting}
					className={s.submitButton}>
					{isSubmitting
						? t('profile.servicing_cities.saving') ?? 'Сохранение...'
						: t('profile.servicing_cities.save') ?? 'Сохранить'}
				</Button>
			</form>
		</ProfileTabWrapper>
	)
}
