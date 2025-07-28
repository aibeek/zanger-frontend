'use client'

import { useState } from 'react'
import Image from 'next/image'
import s from './SubscriptionView.module.scss'
import Subscription from '@/app/assets/images/subscription.webp'
import { SubscriptionPlans } from './SubscriptionPlans'
import { AutoRenewal } from './AutoRenewal'
import { Button, Modal } from '@/shared/ui-kit'
import { useTranslations } from 'next-intl'
import { PaymentMethodSelection } from './PaymentMethodSelection'

export const SubscriptionView = () => {
	const t = useTranslations('subscriptionView')
	const [isModalOpen, setModalOpen] = useState(false)

	const handleOpenModal = () => {
		setModalOpen(true)
	}

	const handleCloseModal = () => {
		setModalOpen(false)
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
							onClick={handleOpenModal}
							size="full">
							{t('button')}
						</Button>
					</div>

					<AutoRenewal />
				</div>
			</div>

			<Modal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				title="Выберите способ оплаты"
				className={s.paymentModal}>
				<PaymentMethodSelection />
			</Modal>
		</section>
	)
}
