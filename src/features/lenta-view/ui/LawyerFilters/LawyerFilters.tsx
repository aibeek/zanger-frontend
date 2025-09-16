'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/shared/ui-kit'
import s from './LawyerFilters.module.scss'

interface LawyerFiltersProps {
	onFilter: (filters: {
		region?: string
		serviceType?: string
		date?: string
	}) => void
}

export const LawyerFilters = ({ onFilter }: LawyerFiltersProps) => {
	const t = useTranslations('applications')
	const [region, setRegion] = useState('')
	const [serviceType, setServiceType] = useState('')
	const [date, setDate] = useState('')

	const handleSearch = () => {
		onFilter({
			region: region || undefined,
			serviceType: serviceType || undefined,
			date: date || undefined
		})
	}

	const regions = [
		'almaty', 'nur-sultan', 'shymkent', 'aktobe', 'taraz', 'pavlodar',
		'ust-kamenogorsk', 'semey', 'aktau', 'kostanay', 'kyzylorda', 
		'petropavlovsk', 'oral', 'temirtau', 'atyrau'
	]

	const serviceTypes = [
		'officeRent', 'apartmentRent', 'landRent', 'businessContract',
		'propertyContract', 'carContract', 'workContract', 'serviceContract',
		'partnershipContract', 'consultingContract'
	]

	const dateOptions = [
		{ value: 'today', label: 'Сегодня' },
		{ value: 'week', label: 'За неделю' },
		{ value: 'month', label: 'За месяц' },
		{ value: 'all', label: 'Все время' }
	]

	return (
		<div className={s.filters}>
			<div className={s.filterRow}>
				<div className={s.filterGroup}>
					<select 
						className={s.dropdown}
						value={region}
						onChange={(e) => setRegion(e.target.value)}
					>
						<option value="">{t('selectRegion')}</option>
						{regions.map(regionKey => (
							<option key={regionKey} value={regionKey}>
								{t(`regions.${regionKey}`)}
							</option>
						))}
					</select>
				</div>

				<div className={s.filterGroup}>
					<select 
						className={s.dropdown}
						value={serviceType}
						onChange={(e) => setServiceType(e.target.value)}
					>
						<option value="">{t('selectServiceType')}</option>
						{serviceTypes.map(typeKey => (
							<option key={typeKey} value={typeKey}>
								{t(`serviceTypes.${typeKey}`)}
							</option>
						))}
					</select>
				</div>

				<div className={s.filterGroup}>
					<select 
						className={s.dropdown}
						value={date}
						onChange={(e) => setDate(e.target.value)}
					>
						<option value="">{t('selectDate')}</option>
						{dateOptions.map(option => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
				</div>

				<Button 
					className={s.searchButton}
					variant="primary"
					onClick={handleSearch}
				>
					{t('searchButton')}
				</Button>
			</div>
		</div>
	)
}
