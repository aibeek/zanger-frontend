import { useTranslations } from 'next-intl'

import s from './page.module.scss'
import { ChatBot } from '@/widgets/ChatBot'

export default function SubscriptionPage() {
	const t = useTranslations()

	return (
		<div className={s.page}>
			<ChatBot />
		</div>
	)
}
