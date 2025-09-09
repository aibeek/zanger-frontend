'use client'

import { useTranslations } from 'next-intl'
import { FAQAccordion } from '@/widgets/FAQAccordion'
import s from './page.module.scss'
import { RightWidgets } from '../components/RightWidgets'

export default function FAQPage() {
	const t = useTranslations('dashboard')

	return (
		<div className={s.faqContent}>
			<div className={s.faqMain}>
				<FAQAccordion />
			</div>
			<RightWidgets />
		</div>
	)
}
