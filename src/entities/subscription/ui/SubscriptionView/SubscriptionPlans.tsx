'use client'

import { useEffect, useState } from 'react'
import { RadioGroup } from '@headlessui/react'
import clsx from 'clsx'
import s from './SubscriptionPlans.module.scss'
import { useSubscriptionStore } from '../../model'
import { Loader } from '@/shared/ui-kit'

export const SubscriptionPlans = () => {
	const { plans, fetchPlans, loading, setPlanId } = useSubscriptionStore()
	const [selected, setSelected] = useState(plans[0]?.value)

	useEffect(() => {
		fetchPlans()
	}, [fetchPlans])

	useEffect(() => {
		if (plans.length > 0 && !selected) {
			setSelected(plans[0].value)
			setPlanId(plans[0].planId)
		}
	}, [plans, selected])

	if (loading) return <Loader />

	const handleChange = (value: string) => {
		setSelected(value)
		const selectedPlan = plans.find((o) => o.value === value)
		if (selectedPlan) setPlanId(selectedPlan.planId)
	}

	return (
		<RadioGroup
			className={s.wrapper}
			value={selected}
			onChange={handleChange}>
			<div className={s.subPlans}>
				{plans.map((option) => (
					<RadioGroup.Option
						key={option.value}
						value={option.value}>
						{({ checked }) => (
							<article
								className={clsx(s.card, {
									[s.checked]: checked,
								})}>
								<div className={s.top}>
									<span className={clsx(s.circle, { [s.filled]: checked })} />
									<span className={s.title}>{option.label}</span>
									<span className={s.price}>{option.price.startsWith('0') ? 'Бесплатно' : option.price}</span>
								</div>
								<p className={s.descr}>{option.description}</p>
							</article>
						)}
					</RadioGroup.Option>
				))}
			</div>
		</RadioGroup>
	)
}
