import s from './SubscriptionPopupStates.module.scss'
import { useTranslations } from 'next-intl'

interface Props {
	status: 'success' | 'failed' | null
}

export const SubscriptionPopupStates = ({ status }: Props) => {
	const t = useTranslations('profile.subscription')

	if (!status) return null

	return (
		<div className={s.item}>
			<p className={s.text}>{t(`${status}.text`)}</p>
		</div>
	)
}
