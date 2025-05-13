import Image from 'next/image'

import avatar from '@/app/assets/icons/avatar-default.svg'

import s from './UserBox.module.scss'
import { DateComponent } from '../DateComponent'

export const UserBox = ({ data }: { data: any }) => {
	return (
		<div className={s.user}>
			<Image
				style={{ borderRadius: '10px' }}
				src={data.user?.icon ?? avatar}
				alt={'аватар'}
				width={40}
				height={40}
			/>
			<div className={s.userInfo}>
				<p className={s.userName}>{data.user?.name}</p>
				<DateComponent date={data.order?.created_at || data.created_at} />
			</div>
		</div>
	)
}
