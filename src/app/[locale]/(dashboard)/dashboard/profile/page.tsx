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
import { refreshUser } from '@/shared/lib/helpers/refreshUser'
import { PopupStates } from '@/entities/profile/ui/ProfileSubscription/SubscriptionPopupStates'
import { useTranslations } from 'next-intl'

export default function ProfileView() {
	const personalData = useLoginStore((state) => state.personalData)
	const { name, phone, icon } = personalData
	const role = Cookies.get('role')
	const t = useTranslations()
	const searchParams = useSearchParams()
	const router = useRouter()
	const pathname = usePathname()

	const { close, open, isOpen } = useModal()
	const [popupStatus, setPopupStatus] = useState<'success' | 'failed' | null>(null)
	const [popupMessage, setPopupMessage] = useState<string | null>(null)

	useEffect(() => {
		const checkParams = async () => {
			let status: 'success' | 'failed' | null = null
			let message: string | null = null

			const sub = searchParams.get('subscription')
			if (sub === 'success' || sub === 'failed') {
				status = sub
				message = t(sub === 'success' ? 'subscriptionSuccess' : 'subscriptionFailed')
			} else {
				const card = searchParams.get('card-init')
				if (card === 'success' || card === 'failed') {
					status = card
					message = t(card === 'success' ? 'cardInitSuccess' : 'cardInitFailed')
				}
			}

			if (!status) return

			setPopupStatus(status)
			setPopupMessage(message)
			open()
			await refreshUser()

			const newParams = new URLSearchParams(searchParams.toString())
			newParams.delete('subscription')
			newParams.delete('card-init')
			router.replace(`${pathname}?${newParams.toString()}`, { scroll: false })
		}

		checkParams()
	}, [searchParams, pathname, open, router, t])

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
						{lawyer && <ProfilePaymentMethod />}
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
					setPopupStatus(null)
					setPopupMessage(null)
				}}
				closeButton>
				{popupStatus && popupMessage && (
					<PopupStates
						status={popupStatus}
						message={popupMessage}
					/>
				)}
			</Modal>
		</>
	)
}
