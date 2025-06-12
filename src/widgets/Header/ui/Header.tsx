'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Disclosure } from '@headlessui/react'
import Image from 'next/image'
import { authService, useLoginStore } from '@/features/auth'
import burger from '@/app/assets/icons/burger.svg'
import closeIcon from '@/app/assets/icons/close.svg'
import LogoutIcon from '@/app/assets/icons/logout.svg'
import avatar from '@/app/assets/icons/header-avatar.svg'
import { Button, LangSwitcher, Modal, useModal } from '@/shared/ui-kit'
import { formatPhoneNumber, scrollToSection, useAppContentData, useAuthStore, useSectionScroll } from '@/shared/lib'

import s from './Header.module.scss'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { AppLink } from '@/shared/ui-kit/AppLink'
import { NotificationsDropdown } from '@/entities/notifications'

export const Header = ({ variant }: { variant: 'user-variant' | 'lending-variant' }) => {
	const router = useRouter()
	const { isOpen, close, open } = useModal()
	const [isMenuOpen, setIsMenuOpen] = useState(false)
	const { activeSection, setActiveSection } = useSectionScroll()
	const { personalData, getPersonalDataByToken, reset } = useLoginStore()
	const { headerMenuData } = useAppContentData()
	const t = useTranslations('header')
	const { isAuthenticated, checkAuth } = useAuthStore()

	useEffect(() => {
		checkAuth()
	}, [checkAuth])

	useEffect(() => {
		if (isAuthenticated && !personalData) {
			getPersonalDataByToken()
		}
	}, [isAuthenticated, personalData, getPersonalDataByToken])

	const handleLogout = () => {
		reset()
		authService.logout()
		router.push('/auth/login')
	}

	const isActive = (link: string) => activeSection === link
	if (variant === 'lending-variant') {
		return (
			<header className={`${s.lendingHeader} ${isMenuOpen ? s.open : ''}`}>
				<div className={s.logo}>
					<Image
						src="/logo.svg"
						alt={t('logoAlt')}
						width={100}
						height={20}
					/>
				</div>
				<div
					onClick={open}
					className={s.left}>
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
												{t(name)}
											</Link>
										))}
									</div>
									<div className={s.mobileMenuButton}>
										<Disclosure.Button className={s.burger}>
											{open ? (
												<Image
													src={closeIcon}
													alt={t('closeMenu')}
													width={24}
													height={24}
													className={s.iconClose}
												/>
											) : (
												<Image
													src={burger}
													alt={t('openMenu')}
													width={24}
													height={24}
													className={s.iconBurger}
												/>
											)}
										</Disclosure.Button>
									</div>

									<Disclosure.Panel className={s.mobileMenuBox}>
										<LangSwitcher />
										<div className={s.mobileMenu}>
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
													{t(name)}
												</Link>
											))}
										</div>
									</Disclosure.Panel>
								</>
							)
						}}
					</Disclosure>
				</div>

				<div className={s.authBtns}>
					<LangSwitcher hide={true} />

					{isAuthenticated && personalData ? (
						<div className={s.user}>
							<Link
								style={{ cursor: 'pointer' }}
								href={'/dashboard/profile'}>
								<Image
									style={{ borderRadius: '10px' }}
									src={personalData.icon ?? avatar}
									alt={t('avatarAlt')}
									width={40}
									height={40}
								/>
							</Link>
							<div className={s.userInfo}>
								<p className={s.userName}>{personalData.name}</p>
								<p className={s.userPhone}>{formatPhoneNumber(personalData.phone)}</p>
							</div>
						</div>
					) : (
						<>
							<AppLink
								className={s.appLink}
								variant={'primary'}
								href={'/auth/login'}>
								{t('login')}
							</AppLink>

							<AppLink
								className={s.appLink}
								variant={'border'}
								href={'/auth/register/select-role'}>
								{t('register')}
							</AppLink>
						</>
					)}
				</div>
			</header>
		)
	}

	return (
		<>
			<header className={s.userHeader}>
				<div className="container">
					<div className={s.inner}>
						<div className={s.left}>
							<Link href={'/'}>
								<Image
									src="/logo.svg"
									alt={t('logoAlt')}
									width={100}
									height={20}
								/>
							</Link>

							{isAuthenticated && personalData && (
								<p className={s.city}>
									{t('city')}: <span>{personalData.region.name}</span>
								</p>
							)}
						</div>
						<div className={s.right}>
							<LangSwitcher hide={true} />
							
							{isAuthenticated && personalData && (
								<>
									<div className={s.notifications}>
										<NotificationsDropdown />
									</div>
									<div className={s.user}>
										<Link
											style={{ cursor: 'pointer' }}
											href={'/dashboard/profile'}>
											<Image
												style={{ borderRadius: '10px', objectFit: 'cover' }}
												src={personalData.icon ?? avatar}
												alt={t('avatarAlt')}
												width={40}
												height={40}
											/>
										</Link>
										<div className={s.userInfo}>
											<p className={s.userName}>{personalData.name}</p>
											<p className={s.userPhone}>{formatPhoneNumber(personalData.phone)}</p>
										</div>
									</div>
									<Button
										onClick={open}
										className={s.logout}
										size={'auto'}
										variant={'clear'}>
										<Image
											src={LogoutIcon}
											alt={t('logoutAlt')}
											width={24}
											height={24}
										/>
									</Button>
								</>
							)}
						</div>
					</div>
				</div>
			</header>

			<Modal
				className={s.modal}
				isOpen={isOpen}
				onClose={close}
				title={t('modalTitle')}>
				<div className={s.top}>
					<p
						className={s.descr}
						dangerouslySetInnerHTML={{ __html: t('modalDescription') }}
					/>
				</div>
				<div className={s.btns}>
					<Button
						variant="border"
						size={'lg'}
						className={s.stayBtn}
						onClick={close}>
						{t('stay')}
					</Button>
					<Button
						variant="danger"
						size={'lg'}
						className={s.logoutBtn}
						onClick={handleLogout}>
						{t('logout')}
					</Button>
				</div>
			</Modal>
		</>
	)
}
