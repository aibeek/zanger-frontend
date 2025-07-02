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

export default function ProfileView() {
	const personalData = useLoginStore((state) => state.personalData)
	const { name, phone, icon } = personalData
	const role = Cookies.get('role')

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
		</>
	)
}
