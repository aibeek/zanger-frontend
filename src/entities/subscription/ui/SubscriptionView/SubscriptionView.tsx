'use client'

import Image from 'next/image'
import s from './SubscriptionView.module.scss'
import Subscription from '@/app/assets/images/subscription.webp'
import { SubscriptionPlans } from './SubscriptionPlans'
import { AutoRenewal } from './AutoRenewal'
// import { StripeWrapper } from '@/shared/ui-kit/StripeWrapper'
import { Button, useModal } from '@/shared/ui-kit'
import { useSubscriptionStore } from '../../model'
import { useState } from 'react'
import { lawyerApi } from '@/shared/api'
import toast from 'react-hot-toast'
import { useLoginStore } from '@/features/auth'

export const SubscriptionView = () => {
	const planId = useSubscriptionStore((state) => state.planId)
	const isAutoRenew = useSubscriptionStore((state) => state.isAutoRenew)
	const { personalData } = useLoginStore()

	// @ts-expect-error fix it
	const ends_at = personalData?.lawyer?.subscription?.ends_at ?? ''

	const handleSubmit = async (e: React.FormEvent) => {
		try {
			const { link } = await lawyerApi.subscribe(planId, isAutoRenew)
			window.location.href = link
		} catch (e) {
			console.error(e)
			toast.error('Ошибка при оформлении подписки')
		}
	}

	return (
		<section>
			<div className="little-container">
				<div className={s.inner}>
					<h1 className={s.title}>Выбор подписки</h1>

					<div className={s.info}>
						<Image
							src={Subscription}
							alt="subscription"
							width={440}
							height={360}
						/>
						<h3 className={s.subtitle}>Пробный период со скидкой 90%</h3>
						<p className={s.descr}>
							По окончании пробного периода, который закончится {ends_at}, с вашего счёта будет списана плата за
							подписку. Мы уведомим вас о продлении подписки за три дня до этого события. Вы можете отказаться от
							подписки в любой момент.
						</p>
					</div>

					<SubscriptionPlans />
					<div className={s.buy}>
						<Button
							style={{ marginBottom: '20px' }}
							onClick={handleSubmit}
							size={'full'}>
							Оформить подписку
						</Button>
					</div>
					<AutoRenewal />
				</div>
			</div>
		</section>
	)
}
