'use client'

import { useTranslations } from 'next-intl'
import { FAQAccordion } from '@/widgets/FAQAccordion'
import s from './page.module.scss'
import { RightWidgets } from '../dashboard/components/RightWidgets'

export default function FAQPage() {
	const t = useTranslations('dashboard')

	return (
		<div className={s.faqPage}>
			<div className={s.container}>
				<h1 className={s.title}>FAQ</h1>
				<FAQAccordion />
				<RightWidgets />
			</div>
		</div>
	)
}
