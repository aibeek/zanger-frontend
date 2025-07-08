import Image from 'next/image'
import s from './SubscriptionPopupStates.module.scss'
import { useTranslations } from 'next-intl'
import subFailed from '@/app/assets/images/subscription-failed.webp'
import subSuccess from '@/app/assets/images/subscription-success.webp'

interface Props {
	status: 'success' | 'failed' | null
}

export const SubscriptionPopupStates = ({ status }: Props) => {
	const t = useTranslations('profile.subscription')

	if (!status) return null

	return (
		<div className={s.item}>
			<Image
				className={s.img}
				src={status === 'success' ? subSuccess : subFailed}
				width={311}
				height={311}
				alt={status}
			/>

			<p className={s.text}>{t(`${status}.text`)}</p>
		</div>
	)
}
