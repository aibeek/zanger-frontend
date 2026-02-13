'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import phone from '@/app/assets/icons/phone.svg'
import s from './MainSection.module.scss'
import heroImage from '@/app/assets/images/one.png'
import heroImageBg from '@/app/assets/images/two.png'
import { LangSwitcher } from '@/shared/ui-kit'
import { AppLink } from '@/shared/ui-kit/AppLink'
import { useAuthStore, useMediaQuery, useHydration, isMobileOrTablet } from '@/shared/lib'
import { useLoginStore } from '@/features/auth'

export const MainSection = () => {
	const t = useTranslations('lending.mainSection')
	const ht = useTranslations('header')
	const isHydrated = useHydration()
	const isMobile = useMediaQuery('(max-width: 900px)')
	const { isAuthenticated } = useAuthStore()
	const { personalData } = useLoginStore()
	const [showMobileMenu, setShowMobileMenu] = useState(false)

	const scrollToSection = (sectionId: string) => {
		const element = document.getElementById(sectionId)
		if (element) {
			const headerEl = document.querySelector('header') as HTMLElement | null
			const isFixed = headerEl ? window.getComputedStyle(headerEl).position === 'fixed' : false
			const headerHeight = isFixed ? headerEl?.offsetHeight ?? 0 : 0
			const elementPosition = element.offsetTop - headerHeight
			window.scrollTo({ top: elementPosition, behavior: 'smooth' })
		}
	}

	return (
		<section id="mainSection" className={s.wrapper}>
			{/* Navbar */}
			<header className={s.navbar}>
				<div className={s.navInner}>
					<Link href="/" className={s.logoLink}>
						<Image
							src="/newlogo.png"
							alt="ZANGER"
							width={44}
							height={48}
							priority
						/>
						<span className={s.logoText}>ZANGER</span>
					</Link>

					{isHydrated && !isMobile && (
						<nav className={s.nav}>
							<button onClick={() => scrollToSection('about')} className={s.navLink}>
								{ht('aboutUs')}
							</button>
							<button onClick={() => scrollToSection('lawyers')} className={s.navLink}>
								{ht('lawyers')}
							</button>
							<button onClick={() => scrollToSection('modules')} className={s.navLink}>
								{ht('modules')}
							</button>
							<button onClick={() => scrollToSection('info')} className={s.navLink}>
								{ht('info')}
							</button>
							<button onClick={() => scrollToSection('resources')} className={s.navLink}>
								{ht('useful')}
							</button>
							<button onClick={() => scrollToSection('news')} className={s.navLink}>
								{ht('news')}
							</button>
						</nav>
					)}

					<div className={s.navRight}>
						<LangSwitcher />
						{isHydrated && !isMobile && (
							<AppLink
								className={s.loginBtn}
								variant="primary"
								href="/auth/login"
							>
								{ht('login')}
							</AppLink>
						)}
						{isHydrated && isMobile && (
							<button
								className={s.burger}
								onClick={() => setShowMobileMenu(!showMobileMenu)}
								aria-label="Menu"
							>
								<span />
								<span />
								<span />
							</button>
						)}
					</div>
				</div>

				{/* Mobile menu */}
				{isHydrated && isMobile && showMobileMenu && (
					<div className={s.mobileMenu}>
						<button onClick={() => { scrollToSection('about'); setShowMobileMenu(false) }} className={s.mobileNavLink}>
							{ht('aboutUs')}
						</button>
						<button onClick={() => { scrollToSection('lawyers'); setShowMobileMenu(false) }} className={s.mobileNavLink}>
							{ht('lawyers')}
						</button>
						<button onClick={() => { scrollToSection('modules'); setShowMobileMenu(false) }} className={s.mobileNavLink}>
							{ht('modules')}
						</button>
						<button onClick={() => { scrollToSection('info'); setShowMobileMenu(false) }} className={s.mobileNavLink}>
							{ht('info')}
						</button>
						<button onClick={() => { scrollToSection('resources'); setShowMobileMenu(false) }} className={s.mobileNavLink}>
							{ht('useful')}
						</button>
						<button onClick={() => { scrollToSection('news'); setShowMobileMenu(false) }} className={s.mobileNavLink}>
							{ht('news')}
						</button>
						<div className={s.mobileAuthBtns}>
							<AppLink variant="primary" href="/auth/login">
								{ht('login')}
							</AppLink>
						</div>
					</div>
				)}
			</header>

			{/* Hero */}
			<div className={s.hero}>
				<div className={s.heroImageWrapper}>
					<div className={s.heroImageBgLayer}>
						<Image
							src={heroImageBg}
							alt=""
							fill
							className={s.heroImageBg}
							priority
							sizes="100vw"
						/>
					</div>
					<div className={s.heroImageLayer}>
						<Image
							src={heroImage}
							alt=""
							fill
							className={s.heroImage}
							priority
							sizes="100vw"
						/>
					</div>
				</div>
				<div className={s.container}>
					<div className={s.heroContent}>
						<h1 className={s.title}>
							{t.rich('title', {
								span: (chunks) => <span>{chunks}</span>,
								br: () => <br />,
							})}
						</h1>
						<p className={s.subtitle}>{t('description')}</p>
						<div className={s.numberBlock}>
							<span className={s.bigNumber}>5510</span>
						</div>
						<p className={s.disclaimer}>{t('disclaimer')}</p>
						<Link href="tel:5510" className={s.phoneButton}>
							<Image
								src={phone}
								alt=""
								width={20}
								height={20}
								className={s.phoneIcon}
							/>
							{t('phoneButton')}
						</Link>
					</div>
				</div>
			</div>
			<div id="mainSectionSentinel" className={s.sentinel} aria-hidden="true" />
		</section>
	)
}
