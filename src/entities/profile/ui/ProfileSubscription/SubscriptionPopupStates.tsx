import Image from 'next/image'
import s from './SubscriptionPopupStates.module.scss'

import subFailed from '@/app/assets/images/subscription-failed.webp'
import subSuccess from '@/app/assets/images/subscription-success.webp'

interface Props {
	status: 'success' | 'failed'
	message: string
}

export const PopupStates = ({ status, message }: Props) => {
	return (
		<div className={s.item}>
			<Image
				className={s.img}
				src={status === 'success' ? subSuccess : subFailed}
				width={311}
				height={311}
				alt={status}
			/>
			<p className={s.text}>{message}</p>
		</div>
	)
}
