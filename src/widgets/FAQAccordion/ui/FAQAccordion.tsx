'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { FAQItem, type FAQData } from '@/entities/faq'
import s from './FAQAccordion.module.scss'

export type FAQAccordionProps = {
	className?: string
}

export const FAQAccordion = ({ className }: FAQAccordionProps) => {
	const t = useTranslations('dashboard')
	
	// Получаем массив FAQ из переводов
	const faqData = t.raw('faq') as FAQData

	return (
		<div className={`${s.accordion} ${className || ''}`}>
			{faqData.map((item, index) => (
				<FAQItem
					key={index}
					number={index + 1}
					question={item.question}
					answer={item.answer}
				/>
			))}
		</div>
	)
}