'use client'

import Image from 'next/image'
import s from './SubscriptionView.module.scss'
import Subscription from '@/app/assets/images/subscription.webp'
import { SubscriptionPlans } from './SubscriptionPlans'
import { AutoRenewal } from './AutoRenewal'
import { Button } from '@/shared/ui-kit'
import { useSubscriptionStore } from '../../model'
import { lawyerApi } from '@/shared/api'
import toast from 'react-hot-toast'
import { useTranslations } from 'next-intl'

export const SubscriptionView = () => {
	const planId = useSubscriptionStore((state) => state.planId)
	const isAutoRenew = useSubscriptionStore((state) => state.isAutoRenew)
	const t = useTranslations('subscriptionView')

	const handleSubmit = async () => {
		try {
			const { link } = await lawyerApi.subscribe(planId, isAutoRenew)
			window.location.href = link
		} catch (e) {
			toast.error(t('error'))
		}
	}

	return (
		<section>
			<div className="little-container">
				<div className={s.inner}>
					<h1 className={s.title}>{t('title')}</h1>

					<div className={s.info}>
						<Image
							src={Subscription}
							alt="subscription"
							width={440}
							height={360}
						/>
						<h3 className={s.subtitle}>{t('subtitle')}</h3>
					</div>

					<SubscriptionPlans />
					<div className={s.buy}>
						<Button
							style={{ marginBottom: '20px' }}
							onClick={handleSubmit}
							size={'full'}>
							{t('button')}
						</Button>
					</div>
					<AutoRenewal />
				</div>
			</div>
		</section>
	)
}
