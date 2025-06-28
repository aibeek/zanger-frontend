import s from './ProfileSubscription.module.scss'
import { useTranslations } from 'next-intl'

export const ProfileSubscription = () => {
	const t = useTranslations('profile.subscription')

	return (
		<div className={s.item}>
			<h6 className={s.title}>{t('title')}</h6>
			<span className={s.plan}>Отсутствует</span>
		</div>
	)
}
