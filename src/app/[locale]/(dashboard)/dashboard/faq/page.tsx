'use client'

import { useTranslations } from 'next-intl'
import { FAQAccordion } from '@/widgets/FAQAccordion'
import s from './page.module.scss'
import { RightWidgets } from '../components/RightWidgets'

export default function FAQPage() {
	const t = useTranslations('dashboard')

	return (
		<div className={s.faqPage}>
			<div className={s.container}>
				<div className={s.content}>
					<div className={s.mainContent}>
						<h1 className={s.title}>FAQ</h1>
						<FAQAccordion />
					</div>
					<div className={s.rightSidebar}>
						<RightWidgets />
					</div>
				</div>
			</div>
		</div>
	)
}
