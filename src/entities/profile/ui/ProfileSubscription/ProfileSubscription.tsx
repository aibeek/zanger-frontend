import { useLoginStore } from '@/features/auth'
import s from './ProfileSubscription.module.scss'
import { useTranslations } from 'next-intl'

export const ProfileSubscription = () => {
	const t = useTranslations('profile.subscription')
	const personalData = useLoginStore((state) => state.personalData)
	// @ts-expect-error fix it
	const subscription = personalData.lawyer.subscription.plan.name
	// @ts-expect-error fix it
	const end_at = personalData.lawyer.subscription.ends_at

	return (
		<div className={s.item}>
			<h6 className={s.title}>{t('title')}</h6>
			<span className={s.plan}>
				{subscription !== null ? subscription : 'Отсутствует'} - Активна до {end_at}
			</span>
		</div>
	)
}
