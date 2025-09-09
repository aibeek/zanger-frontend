'use client'

import { useTranslations } from 'next-intl'
import { useRef } from 'react'
import s from './ProfileSubscription.module.scss'
import { ProfileTabWrapper } from '../ProfileTabWrapper'
import { Button } from '@/shared/ui-kit'

export const ProfileSubscription = () => {
	const t = useTranslations()
	const disclosureBtnRef = useRef<HTMLButtonElement>(null)

	const handleSubscribe = () => {
		// Логика перенаправления на страницу подписки
		window.location.href = '/dashboard/subscription'
	}

	return (
		<ProfileTabWrapper
			title={t('profile.subscription.title')}
			imgSrc={null}
			imgAlt={'subscription'}
			panel_title={t('profile.subscription.title')}
			panel_descr={t('profile.subscription.none')}
			ref={disclosureBtnRef}>
			
			<div className={s.subscriptionInfo}>
				<div className={s.noSubscription}>
					<p className={s.status}>{t('profile.subscription.none')}</p>
					<Button 
						variant="primary" 
						onClick={handleSubscribe}
						className={s.subscribeButton}
					>
						{t('header.subscription')}
					</Button>
				</div>
			</div>
		</ProfileTabWrapper>
	)
}
