import { useLoginStore } from '@/features/auth'
import s from './ProfileSubscription.module.scss'
import { useTranslations } from 'next-intl'

export const ProfileSubscription = () => {
	const t = useTranslations('profile.subscription')
	const personalData = useLoginStore((state) => state.personalData)
	// @ts-expect-error fix it
	const subscription = personalData.lawyer.subscription
	return (
		<div className={s.item}>
			<h6 className={s.title}>{t('title')}</h6>
			<span className={s.plan}>{subscription === null ? 'Отсутствует' : subscription}</span>
		</div>
	)
}
