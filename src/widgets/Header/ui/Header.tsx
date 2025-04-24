'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Disclosure } from '@headlessui/react'

import closeIcon from '@/app/assets/icons/close.svg'
import burger from '@/app/assets/icons/burger.svg'
import { Button, headerMenuData, scrollToSection } from '@/shared'

import s from './Header.module.scss'
import { useSectionScroll } from '@/shared/lib/hooks/useSectionScroll'
import { useState } from 'react'

export const Header = ({ variant }: { variant: 'user-variant' | 'lending-variant' }) => {
	const { activeSection, setActiveSection } = useSectionScroll()
	const [isMenuOpen, setIsMenuOpen] = useState(false)

	const isActive = (link: string) => activeSection === link
	if (variant === 'lending-variant') {
		return (
			<header className={`${s.lendingHeader} ${isMenuOpen ? s.open : ''}`}>
				<div className={s.left}>
					<div className={s.logo}>
						<Image
							src="/logo.svg"
							alt="logo"
							width={100}
							height={20}
						/>
					</div>

					<Disclosure
						as="nav"
						className={s.nav}>
						{({ open, close }) => {
							if (open !== isMenuOpen) setIsMenuOpen(open)
							return (
								<>
									<div className={s.desktopMenu}>
										{headerMenuData.map(({ name, link }) => (
											<Link
												key={name}
												href={link}
												onClick={(e) => {
													scrollToSection(e, link)
													setActiveSection(link)
												}}
												className={`${s.link} ${isActive(link) ? s.active : ''}`}>
												{name}
											</Link>
										))}
									</div>
									<div className={s.mobileMenuButton}>
										<Disclosure.Button className={s.burger}>
											{open ? (
												<Image
													src={closeIcon}
													alt={'закрыть'}
													width={24}
													height={24}
													className={s.iconClose}
												/>
											) : (
												<Image
													src={burger}
													alt={'кнопка открытия меню'}
													width={24}
													height={24}
													className={s.iconBurger}
												/>
											)}
										</Disclosure.Button>
									</div>

									<Disclosure.Panel className={s.mobileMenu}>
										{headerMenuData.map(({ name, link }) => (
											<Link
												key={name}
												href={link}
												onClick={(e) => {
													scrollToSection(e, link)
													document.body.click()
													close()
												}}
												className={`${s.link} ${isActive(link) ? s.active : ''}`}>
												{name}
											</Link>
										))}
									</Disclosure.Panel>
								</>
							)
						}}
					</Disclosure>
				</div>

				<div className={s.authBtns}>
					<Button
						variant={'primary'}
						size={'auto'}
						className={s.btn}>
						<Link href={`/ru/auth/login`}>Войти</Link>
					</Button>
					<Button
						variant="border"
						size={'auto'}
						className={s.btn}>
						<Link href={`/ru/auth/register/select-role`}>Регистарция</Link>
					</Button>
				</div>
			</header>
		)
	}

	return (
		<header className={s.userHeader}>
			<div className="container">
				<div className={s.inner}>
					<div className={s.left}>
						<Link href={'/ru'}>
							<Image
								src="/logo.svg"
								alt="logo"
								width={100}
								height={20}
							/>
						</Link>
					</div>
					<div className={s.right}>Lang switcher</div>
				</div>
			</div>
		</header>
	)
}
