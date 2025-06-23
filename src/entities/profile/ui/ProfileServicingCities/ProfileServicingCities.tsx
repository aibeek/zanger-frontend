'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useRef } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/shared/ui-kit'
import MapLocationIcon from '@/app/assets/icons/location-blue.svg'

import { SearchSelect, useRegions } from '@/features/auth'

import s from './ProfileServicingCities.module.scss'
import { ProfileTabWrapper } from '../ProfileTabWrapper'
import { useServicingRegions } from '../../model/useServicingRegions'
import { ServicingCitiesForm, servicingCitiesSchema, useRegionsUtils } from '@/shared/lib'

export const ProfileServicingCities = () => {
	const t = useTranslations()
	const { regions } = useRegions()
	const disclosureBtnRef = useRef<HTMLButtonElement>(null)
	const { servicingCities, isLoaded, load, updateServicingRegions, isSubmitting } = useServicingRegions()

	const { allOptions, optionsForSelect } = useRegionsUtils(regions, servicingCities)

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
		load()
	}, [load])

	useEffect(() => {
		if (isLoaded && servicingCities.length) {
			setValue(
				'region_ids',
				servicingCities.map((r) => r.id),
			)
		}
	}, [isLoaded, servicingCities, setValue])

	const onSubmit = async (data: ServicingCitiesForm) => {
		await updateServicingRegions({ region_ids: data.region_ids }, t)
	}

	return (
		<ProfileTabWrapper
			title={t('profile.servicing_cities.title')}
			imgSrc={MapLocationIcon}
			imgAlt="personalData"
			panel_title={t('profile.servicing_cities.panelTitle')}
			panel_descr={t('profile.servicing_cities.panelDescription')}
			ref={disclosureBtnRef}>
			<form onSubmit={handleSubmit(onSubmit)}>
				<div className={`${s.selectBox} ${s.inputBox}`}>
					<label className={s.label}>{t('profile.servicing_cities.regionLabel')}</label>
					<Controller
						control={control}
						name="region_ids"
						render={({ field }) => {
							const selected = allOptions.filter((r) => field.value.includes(r.id))

							return (
								<SearchSelect
									className="search-select"
									data={optionsForSelect}
									value={selected}
									onChange={(selectedItems) => {
										const ids = Array.isArray(selectedItems) ? selectedItems.map((item) => item.id) : []
										field.onChange(ids)
									}}
									getId={(item) => item.id}
									getLabel={(item) => (item.path ? `${item.name} (${item.path})` : item.name)}
									renderGroupLabel={(label) => <span>{label.slice(3)}</span>}
									multiple
									placeholder={t('profile.servicing_cities.placeholder')}
									searchData={allOptions}
								/>
							)
						}}
					/>
				</div>

				{errors.region_ids && <p className={s.error}>{errors.region_ids.message}</p>}

				<Button
					type="submit"
					variant="primary"
					size="auto"
					style={{ padding: '8px 30px', marginTop: '10px' }}
					disabled={isSubmitting}
					className={s.submitButton}>
					{isSubmitting ? t('profile.servicing_cities.saving') : t('profile.servicing_cities.save')}
				</Button>
			</form>
		</ProfileTabWrapper>
	)
}
