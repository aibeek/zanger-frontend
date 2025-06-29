'use client'

import { useState } from 'react'
import { RadioGroup } from '@headlessui/react'
import clsx from 'clsx'
import s from './SubscriptionPlans.module.scss'
import { useSubscriptionStore } from '../../model'

const OPTIONS = [
	{
		planId: 1,
		label: '1 месяц',
		value: 'free',
		price: 'БЕСПЛАТНО',
		description: 'В течение первого месяца приложение бесплатно',
	},
	{
		planId: 2,
		label: 'Следующий месяц',
		value: 'next',
		price: '2 300 ₸',
		description: 'Пожалуйста, произведите оплату, привязав карту',
	},
	{
		planId: 3,
		label: '6 месяцев',
		value: '6',
		price: '13 800 ₸',
		description: 'Пожалуйста, произведите оплату, привязав карту',
	},
	{
		planId: 4,
		label: '12 месяцев',
		value: '12',
		price: '27 600 ₸',
		description: 'Пожалуйста, произведите оплату, привязав карту',
	},
]

export const SubscriptionPlans = () => {
	const [selected, setSelected] = useState('free')
	const setPlanId = useSubscriptionStore((state) => state.setPlanId)

	const handleChange = (value: string) => {
		setSelected(value)
		const selectedPlan = OPTIONS.find((o) => o.value === value)
		if (selectedPlan) setPlanId(selectedPlan.planId)
	}

	return (
		<RadioGroup
			className={s.wrapper}
			value={selected}
			onChange={handleChange}>
			<div className={s.subPlans}>
				{OPTIONS.map((option) => (
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
									<span className={s.price}>{option.price}</span>
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
