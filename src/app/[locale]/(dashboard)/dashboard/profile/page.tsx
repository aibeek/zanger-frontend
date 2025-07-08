'use client'

import Cookies from 'js-cookie'

import { formatPhoneNumber } from '@/shared/lib'
import { useLoginStore } from '@/features/auth/login'
import {
	ProfileAvatar,
	ProfileChangePassword,
	ProfileDelete,
	ProfilePersonalData,
	ProfileChangeSpecialization,
	ProfileConsultationPrice,
	ProfileSubscription,
	ProfileServicingCities,
	ProfileDocuments,
	ProfileSupport,
	ProfilePaymentMethod,
} from '@/entities/profile'

import s from './page.module.scss'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Modal, useModal } from '@/shared/ui-kit'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { SubscriptionPopupStates } from '@/entities/profile/ui/ProfileSubscription/SubscriptionPopupStates'

export default function ProfileView() {
	const personalData = useLoginStore((state) => state.personalData)
	const { name, phone, icon } = personalData
	const role = Cookies.get('role')
	const t = useTranslations('')
	const searchParams = useSearchParams()
	const router = useRouter()
	const pathname = usePathname()

	const { isOpen, close, open } = useModal()
	const [subscriptionStatus, setSubscriptionStatus] = useState<'success' | 'failed' | null>(null)

	useEffect(() => {
		const status = searchParams.get('subscription')
		if (status === 'success' || status === 'failed') {
			setSubscriptionStatus(status)
			open()

			const newParams = new URLSearchParams(searchParams.toString())
			newParams.delete('subscription')
			router.replace(`${pathname}?${newParams.toString()}`, { scroll: false })
		}
	}, [searchParams, pathname, open, router])

	const lawyer = role === 'lawyer'
	return (
		<>
			<section className={s.wrapper}>
				<div className={s.content}>
					<div className={s.top}>
						<ProfileAvatar avatarUrl={icon} />
						<div className={s.name}>{name}</div>
						<div className={s.phone}>{formatPhoneNumber(phone)}</div>
					</div>

					<div className={s.bottom}>
						<ProfilePersonalData role={role} />
						<ProfileChangePassword />
						{lawyer && <ProfileDocuments />}
						{lawyer && <ProfileConsultationPrice />}
						{lawyer && <ProfileChangeSpecialization />}
						{lawyer && <ProfileSubscription />}
						{/* {lawyer && <ProfilePaymentMethod />} */}
						<ProfileSupport />
						{lawyer && <ProfileServicingCities />}
						<ProfileDelete />
					</div>
				</div>
			</section>

			<Modal
				className={s.modal}
				isOpen={isOpen}
				onClose={() => {
					close()
					setSubscriptionStatus(null)
				}}
				closeButton={true}
				title={subscriptionStatus ? t(`profile.subscription.${subscriptionStatus}.title`) : ''}>
				<SubscriptionPopupStates status={subscriptionStatus} />
			</Modal>
		</>
	)
}
