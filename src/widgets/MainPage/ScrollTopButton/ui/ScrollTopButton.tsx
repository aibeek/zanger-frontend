'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import s from './ScrollTopButton.module.scss'

export const ScrollTopButton = () => {
	const t = useTranslations('lending.mainSection')
	const [isVisible, setIsVisible] = useState(false)

	useEffect(() => {
		const getTarget = () =>
			document.getElementById('mainSectionSentinel') ?? document.getElementById('mainSection')

		const target = getTarget()

		if (target && 'IntersectionObserver' in window) {
			const observer = new IntersectionObserver(
				([entry]) => {
					setIsVisible(!entry.isIntersecting)
				},
				{ threshold: 0 }
			)

			observer.observe(target)

			return () => observer.disconnect()
		}

		const handleScroll = () => {
			const current = getTarget()
			if (!current) {
				setIsVisible(window.scrollY > 400)
				return
			}

			const rect = current.getBoundingClientRect()
			if (current.id === 'mainSection') {
				setIsVisible(rect.bottom < 0)
			} else {
				setIsVisible(rect.top < 0)
			}
		}

		handleScroll()
		window.addEventListener('scroll', handleScroll)
		window.addEventListener('resize', handleScroll)

		return () => {
			window.removeEventListener('scroll', handleScroll)
			window.removeEventListener('resize', handleScroll)
		}
	}, [])

	const handleClick = () => {
		window.scrollTo({ top: 0, behavior: 'smooth' })
	}

	return (
		<div className={`${s.wrapper} ${isVisible ? s.visible : ''}`}>
			<button
				type="button"
				onClick={handleClick}
				className={s.button}
				aria-label={t('backToTop')}
			>
				<span className={s.icon} aria-hidden="true" />
			</button>
		</div>
	)
}
