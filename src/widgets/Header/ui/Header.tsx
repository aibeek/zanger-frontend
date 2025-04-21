'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Disclosure } from '@headlessui/react'

import { Bars3Icon, XMarkIcon } from '@heroicons/react/20/solid'

import { Button, headerMenuData, scrollToSection } from '@/shared'

import s from './Header.module.scss'
import { useEffect, useState } from 'react'

export const Header = ({ variant }: { variant: 'user-variant' | 'lending-variant' }) => {
	const [activeSection, setActiveSection] = useState<string | null>('/ru')

	useEffect(() => {
		const handleIntersect = (entries: IntersectionObserverEntry[]) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					setActiveSection(`#${entry.target.id}`)
				}
			})
		}

		const observer = new IntersectionObserver(handleIntersect, {
			rootMargin: '-40% 0px -55% 0px',
			threshold: 0.1,
		})

		const sections = document.querySelectorAll('section[id]')
		sections.forEach((section) => observer.observe(section))

		return () => {
			sections.forEach((section) => observer.unobserve(section))
		}
	}, [])

	const isActive = (link: string) => activeSection === link

	if (variant === 'lending-variant') {
		return (
			<header className={s.lendingHeader}>
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
						{({ open }) => (
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
										{open ? <XMarkIcon className={s.iconBurger} /> : <Bars3Icon className={s.iconBurger} />}
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
											}}
											className={`${s.link} ${isActive(link) ? s.active : ''}`}>
											{name}
										</Link>
									))}
								</Disclosure.Panel>
							</>
						)}
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
