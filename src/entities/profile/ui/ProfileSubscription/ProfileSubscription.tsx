import { useLoginStore } from '@/features/auth'
import s from './ProfileSubscription.module.scss'
import { useTranslations } from 'next-intl'

export const ProfileSubscription = () => {
	const t = useTranslations('profile.subscription')
	const personalData = useLoginStore((state) => state.personalData)

	// Проверяем, что данные загружены и пользователь - юрист
	if (!personalData || !personalData.lawyer) {
		return (
			<div className={s.item}>
				<h6 className={s.title}>{t('title')}</h6>
				<span className={s.plan}>Загрузка...</span>
			</div>
		)
	}

	const subscriptionPlan = personalData.lawyer.subscription?.plan?.name ?? t('none')
	const end_at = personalData.lawyer.subscription?.ends_at ?? ''

	return (
		<div className={s.item}>
			<h6 className={s.title}>{t('title')}</h6>
			<span className={s.plan}>
				{subscriptionPlan}{' '}
				{personalData.lawyer.subscription?.plan && (
					<span>
						- {t('active_until')} {end_at}
					</span>
				)}
			</span>
		</div>
	)
}
