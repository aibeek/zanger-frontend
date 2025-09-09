'use client'

import React, { useState } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import s from './FAQItem.module.scss'

export type FAQItemProps = {
	number: number
	question: string
	answer: string
	className?: string
}

export const FAQItem = ({ number, question, answer, className }: FAQItemProps) => {
	const [isOpen, setIsOpen] = useState(false)

	const toggleOpen = () => {
		setIsOpen(!isOpen)
	}

	return (
		<div className={`${s.faqItem} ${className || ''}`}>
			<button 
				className={s.question}
				onClick={toggleOpen}
				aria-expanded={isOpen}
			>
				<span className={s.questionText}>
					{number}. {question}
				</span>
				<ChevronDownIcon 
					className={`${s.icon} ${isOpen ? s.iconOpen : ''}`} 
				/>
			</button>
			
			<div className={`${s.answerContainer} ${isOpen ? s.answerOpen : ''}`}>
				<div className={s.answer}>
					{answer}
				</div>
			</div>
			
			{/* Разделитель между элементами */}
			<div className={s.separator} />
		</div>
	)
}
