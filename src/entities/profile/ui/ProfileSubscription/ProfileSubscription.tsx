'use client'

import { useTranslations } from 'next-intl'
import { useRef, useEffect, useState } from 'react'
import s from './ProfileSubscription.module.scss'
import { ProfileTabWrapper } from '../ProfileTabWrapper'
import { Button } from '@/shared/ui-kit'
import { useLoginStore } from '@/features/auth'
import type { SubscriptionFromStorage } from '@/shared/lib/types'
import PaymentMethodIcon from '@/app/assets/icons/payment-method.svg'

export const ProfileSubscription = () => {
	console.log('🎬 ProfileSubscription component MOUNTED!')
	
	const t = useTranslations()
	const disclosureBtnRef = useRef<HTMLButtonElement>(null)
	const personalData = useLoginStore((state) => state.personalData)
	const [storageSubscription, setStorageSubscription] = useState<SubscriptionFromStorage | null>(null)

	// Проверяем, что это юрист
	console.log('👤 personalData:', personalData)
	console.log('👤 Type check - has lawyer?', personalData && 'lawyer' in personalData)
	
	const isLawyer = personalData && 'lawyer' in personalData
	console.log('👤 isLawyer:', isLawyer)
	
	const apiSubscription = isLawyer ? personalData.lawyer?.subscription : null
	console.log('👤 apiSubscription from personalData:', apiSubscription)

	// Получаем подписку из localStorage
	useEffect(() => {
		try {
			const subscriptionData = localStorage.getItem('subscription')
			console.log('📦 localStorage subscription:', subscriptionData)
			if (subscriptionData) {
				const parsed = JSON.parse(subscriptionData)
				console.log('✅ Parsed subscription from storage:', parsed)
				setStorageSubscription(parsed)
			} else {
				console.log('❌ No subscription in localStorage')
			}
		} catch (error) {
			console.error('❌ Ошибка при чтении подписки из localStorage:', error)
		}
	}, [])

	// Используем подписку из localStorage, если она есть, иначе из API
	const subscription = storageSubscription || apiSubscription

	console.log('🔍 Final subscription check:', {
		storageSubscription,
		apiSubscription,
		finalSubscription: subscription,
		hasSubscription: !!subscription
	})

	// Отладочная информация
	useEffect(() => {
		console.log('=== ProfileSubscription Debug ===')
		console.log('personalData:', personalData)
		console.log('isLawyer:', isLawyer)
		console.log('apiSubscription:', apiSubscription)
		console.log('storageSubscription:', storageSubscription)
		console.log('subscription (final):', subscription)
		console.log('subscription exists?', !!subscription)
		console.log('================================')
	}, [personalData, subscription, isLawyer, apiSubscription, storageSubscription])

	const handleSubscribe = () => {
		// Логика перенаправления на страницу подписки
		window.location.href = '/dashboard/subscription'
	}

	// Форматирование даты
	const formatDate = (dateString: string) => {
		const date = new Date(dateString)
		return date.toLocaleDateString('ru-RU', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		})
	}

	// Определяем поля в зависимости от типа подписки
	const getSubscriptionDetails = () => {
		console.log('🔧 getSubscriptionDetails called with:', subscription)
		
		if (!subscription) {
			console.log('❌ No subscription data')
			return null
		}

		// Если это подписка из localStorage
		if ('request_type' in subscription) {
			console.log('✅ Using localStorage format')
			return {
				planName: subscription.request_type,
				startDate: subscription.start_date,
				endDate: subscription.end_date
			}
		}

		// Если это подписка из API
		if ('plan' in subscription) {
			console.log('✅ Using API format')
			const details = {
				planName: subscription.plan.name,
				startDate: subscription.started_at,
				endDate: subscription.ends_at
			}
			console.log('📊 Subscription details:', details)
			return details
		}

		console.log('❌ Unknown subscription format')
		return null
	}

	const subscriptionDetails = getSubscriptionDetails()
	console.log('🎯 Final subscriptionDetails:', subscriptionDetails)

	console.log('🚀 RENDERING ProfileSubscription:', {
		hasSubscriptionDetails: !!subscriptionDetails,
		subscriptionDetails,
		willShowActive: !!subscriptionDetails,
		willShowNoSubscription: !subscriptionDetails
	})

	return (
		<ProfileTabWrapper
			title={t('profile.subscription.title')}
			imgSrc={PaymentMethodIcon}
			imgAlt={'subscription'}
			panel_title={t('profile.subscription.title')}
			panel_descr={subscription ? t('profile.subscription.active') : t('profile.subscription.none')}
			ref={disclosureBtnRef}>
			
			<div className={s.subscriptionInfo}>
				{subscriptionDetails ? (
					<div className={s.activeSubscription}>
						<h3 className={s.status}>{t('profile.subscription.active')}</h3>
						<div className={s.subscriptionDetails}>
							<p><strong>{t('profile.subscription.plan')}:</strong> {subscriptionDetails.planName}</p>
							<p><strong>{t('profile.subscription.started_at')}:</strong> {formatDate(subscriptionDetails.startDate)}</p>
							<p><strong>{t('profile.subscription.ends_at')}:</strong> {formatDate(subscriptionDetails.endDate)}</p>
						</div>
						<Button 
							variant="secondary" 
							onClick={handleSubscribe}
							className={s.subscribeButton}
						>
							{t('profile.subscription.manage')}
						</Button>
					</div>
				) : (
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
				)}
			</div>
		</ProfileTabWrapper>
	)
}
