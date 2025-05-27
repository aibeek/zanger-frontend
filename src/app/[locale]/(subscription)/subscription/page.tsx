import { useTranslations } from 'next-intl'

import s from './page.module.scss'
import { SubscriptionView } from '@/entities/subscription'

export default function SubscriptionPage() {
	const t = useTranslations()

	return (
		<div className={s.page}>
			<SubscriptionView />
		</div>
	)
}
