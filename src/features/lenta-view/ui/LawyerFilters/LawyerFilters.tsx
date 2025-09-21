'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/shared/ui-kit'
import s from './LawyerFilters.module.scss'
import { useRegions } from '@/features/auth/register'
import { sharedApi } from '@/shared/api'

interface LawyerFiltersProps {
	onFilter: (filters: {
		region_id?: number
		specialization_id?: number
		date?: string
	}) => void
}

export const LawyerFilters = ({ onFilter }: LawyerFiltersProps) => {
	const t = useTranslations('applications')
	const { regions } = useRegions()

	const [regionId, setRegionId] = useState<number | ''>('')
	const [specializationId, setSpecializationId] = useState<number | ''>('')
	const [date, setDate] = useState('')
	const [specializations, setSpecializations] = useState<Array<{ id: number; name: string }>>([])
	const [loadingSpecs, setLoadingSpecs] = useState(false)

	useEffect(() => {
		let mounted = true
		;(async () => {
			try {
				setLoadingSpecs(true)
				const res = (await sharedApi.getAllSpecializations()) as { data: Array<{ id: number; name: string }> }
				if (!mounted) return
				setSpecializations(res.data ?? [])
			} catch (e) {
				console.error('Failed to load specializations', e)
			} finally {
				setLoadingSpecs(false)
			}
		})()
		return () => {
			mounted = false
		}
	}, [])

	const handleSearch = () => {
		onFilter({
			region_id: regionId === '' ? undefined : Number(regionId),
			specialization_id: specializationId === '' ? undefined : Number(specializationId),
			date: date || undefined,
		})
	}

	const dateOptions = [
		{ value: 'today', label: 'Сегодня' },
		{ value: 'week', label: 'За неделю' },
		{ value: 'month', label: 'За месяц' },
		{ value: 'all', label: 'Все время' },
	]

	return (
		<div className={s.filters}>
			<div className={s.filterRow}>
				<div className={s.filterGroup}>
					<select
						className={s.dropdown}
						value={regionId}
						onChange={(e) => setRegionId(e.target.value ? Number(e.target.value) : '')}
					>
						<option value="">{t('selectRegion')}</option>
						{regions.map((r) => (
							<option key={r.id} value={r.id}>
								{r.name}
							</option>
						))}
					</select>
				</div>

				<div className={s.filterGroup}>
					<select
						className={s.dropdown}
						value={specializationId}
						onChange={(e) => setSpecializationId(e.target.value ? Number(e.target.value) : '')}
						disabled={loadingSpecs}
					>
						<option value="">{t('selectServiceType')}</option>
						{specializations.map((spec) => (
							<option key={spec.id} value={spec.id}>
								{spec.name}
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
						{dateOptions.map((option) => (
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
