'use client'

import Image from 'next/image'
import s from './SubscriptionView.module.scss'
import Subscription from '@/app/assets/images/subscription.webp'
import { Checkbox } from '@/shared/ui-kit'
import { SubscriptionPlans } from './SubscriptionPlans'
import { AutoRenewal } from './AutoRenewal'

export const SubscriptionView = () => {
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
							По окончании пробного периода, который закончится 12 мая 2025 года, с вашего счёта будет списана плата за
							подписку. Мы уведомим вас о продлении подписки за три дня до этого события. Вы можете отказаться от
							подписки в любой момент.
						</p>
					</div>

					<SubscriptionPlans />
					<AutoRenewal />
				</div>
			</div>
		</section>
	)
}
