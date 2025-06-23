'use client'

import { ReactNode, useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import s from './DescriptionText.module.scss'
import { Button } from '../Button'

interface Props {
	children: ReactNode
	className?: string
}

export const DescriptionText = ({ children, className = '' }: Props) => {
	const t = useTranslations('DescriptionText')

	const [isExpanded, setIsExpanded] = useState(false)
	const [showButton, setShowButton] = useState(false)
	const textRef = useRef<HTMLParagraphElement>(null)

	useEffect(() => {
		const timeout = setTimeout(() => {
			if (!textRef.current) return

			const lineHeight = parseFloat(getComputedStyle(textRef.current).lineHeight || '20')
			const maxHeight = lineHeight * 5

			if (textRef.current.scrollHeight > maxHeight) {
				setShowButton(true)
			}
		}, 0)

		return () => clearTimeout(timeout)
	}, [children])

	return (
		<>
			<p
				ref={textRef}
				className={`${s.descr} ${className} ${isExpanded ? s.expanded : ''}`}>
				{children}
			</p>
			{showButton && (
				<Button
					variant={'clear'}
					className={s.btn}
					type="button"
					onClick={() => setIsExpanded(!isExpanded)}>
					{isExpanded ? t('collapse') : t('expand')}
				</Button>
			)}
		</>
	)
}
