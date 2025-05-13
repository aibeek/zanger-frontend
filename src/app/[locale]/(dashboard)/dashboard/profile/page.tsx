'use client'

import { formatPhoneNumber } from '@/shared/lib'
import { useLoginStore } from '@/features/auth/login'
import { Avatar, ProfileChangePassword, ProfileNotifications } from '@/entities/profile'

import s from './page.module.scss'
import { ProfileDelete } from '@/entities/profile/ui/ProfileDelete'

export default function ProfileView() {
	const { personalData } = useLoginStore()
	const { name, phone } = personalData

	return (
		<>
			<section className={s.wrapper}>
				<div className={s.content}>
					<div className={s.top}>
						<Avatar />
						<div className={s.name}>{name}</div>
						<div className={s.phone}>{formatPhoneNumber(phone)}</div>
					</div>

					<div className={s.bottom}>
						<ProfileChangePassword />
						<ProfileNotifications />
						<ProfileDelete />
					</div>
				</div>
			</section>
		</>
	)
}
