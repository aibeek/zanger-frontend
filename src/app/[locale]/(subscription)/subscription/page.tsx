import { useTranslations } from 'next-intl'

import s from './page.module.scss'
import { SubscriptionView } from '@/entities/subscription'
import { ChatBot } from '@/widgets/ChatBot'

export default function SubscriptionPage() {
	const t = useTranslations()

	return (
		<div className={s.page}>
			<SubscriptionView />
			<ChatBot />
		</div>
	)
}
