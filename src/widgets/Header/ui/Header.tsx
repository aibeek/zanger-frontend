'use client'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import { authService, useLoginStore } from '@/features/auth'
import LogoutIcon from '@/app/assets/icons/logout.svg'
import avatar from '@/app/assets/icons/header-avatar.svg'
import monitor from '@/app/assets/icons/monitor.webp'
import lendingUser from '@/app/assets/icons/user-lending.svg'
import { Button, LangSwitcher, Modal, useModal } from '@/shared/ui-kit'
import { formatPhoneNumber, useAuthStore, useMediaQuery, isMobileOrTablet } from '@/shared/lib'

import s from './Header.module.scss'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { AppLink } from '@/shared/ui-kit/AppLink'
import { NotificationsDropdown } from '@/entities/notifications'

export const Header = ({ variant }: { variant: 'user-variant' | 'lending-variant' }) => {
	const router = useRouter()
	const { isOpen, close, open } = useModal()
	const { personalData, getPersonalDataByToken, reset } = useLoginStore()
	const t = useTranslations('header')
	const { isAuthenticated, checkAuth } = useAuthStore()
	const pathname = usePathname()
	const isMobile = useMediaQuery('(max-width: 768px)') // Возвращаем обратно к 768px
	const isMobileDevice = isMobileOrTablet() // Проверка реальных мобильных устройств
	
	// Комбинированная проверка: либо узкий экран, либо реальное мобильное устройство
	const shouldShowMobileModal = isMobile || isMobileDevice
	
	// Состояние для Live заявок и мобильного меню
	const [showLiveApplications, setShowLiveApplications] = useState(false)
	const [showMobileMenu, setShowMobileMenu] = useState(false)
	const [liveApplications, setLiveApplications] = useState([
		{
			id: 1,
			title: "Консультация по трудовому праву",
			description: "Нужна помощь в составлении трудового договора",
			timeAgo: "2 мин назад",
			location: "Алматы"
		},
		{
			id: 2,
			title: "Семейное право - развод",
			description: "Консультация по разводу и разделу имущества",
			timeAgo: "5 мин назад",
			location: "Астана"
		}
	])

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

	if (variant === 'lending-variant') {
		return (
			<>
				<header className={`${s.lendingHeader}`}>
					<div className={s.headerContent}>
						<div className={s.left}>
							<div className={s.logo}>
								<Link 
									href="/"
									className={s.logoLink}>
									<Image
										src="/logo.svg"
										alt="ZANGER"
										width={120}
										height={32}
										priority
									/>
								</Link>
							</div>
						</div>
						
						{!isMobile && (
							<nav className={s.navigation}>
								<Link href="/about" className={s.navLink}>О нас</Link>
								<Link href="/lawyers" className={s.navLink}>Юристы</Link>
								<Link href="/modules" className={s.navLink}>Модули</Link>
								<Link href="/info" className={s.navLink}>Информация</Link>
								<Link href="/useful" className={s.navLink}>Полезное</Link>
								<Link href="/news" className={s.navLink}>Новости</Link>
							</nav>
						)}
						
						<div className={s.right}>
							{!isMobile && (
								<div className={s.authBtns}>
									{isAuthenticated && personalData ? (
										<div className={s.user}>
											<Link
												style={{ cursor: 'pointer' }}
												href={`/${personalData.language}/dashboard/profile`}>
												<Image
													style={{ borderRadius: '10px', border: '1px solid #c2c2c2' }}
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
												href={shouldShowMobileModal ? '#' : '/auth/login'}
												onClick={(e) => {
													if (shouldShowMobileModal) {
														e.preventDefault()
														open()
													}
												}}>
												{t('login')}
											</AppLink>

											<AppLink
												className={`${s.appLink} ${s.liveButton}`}
												variant={'primary'}
												href={shouldShowMobileModal ? '#' : '/auth/register/select-role'}
												onClick={(e) => {
													if (shouldShowMobileModal) {
														e.preventDefault()
														open()
													}
												}}>
												LIVE
											</AppLink>
										</>
									)}
								</div>
							)}
							
							<LangSwitcher />

							{isMobile && (
								<button
									className={s.mobileMenuBtn}
									onClick={() => setShowMobileMenu(!showMobileMenu)}
								>
									<span></span>
									<span></span>
									<span></span>
								</button>
							)}
						</div>
					</div>

						{/* Мобильное меню */}
						{isMobile && showMobileMenu && (
							<div className={s.mobileMenu}>
								<div className={s.mobileNavigation}>
									<Link href="/about" className={s.mobileNavLink}>О нас</Link>
									<Link href="/lawyers" className={s.mobileNavLink}>Юристы</Link>
									<Link href="/modules" className={s.mobileNavLink}>Модули</Link>
									<Link href="/info" className={s.mobileNavLink}>Информация</Link>
									<Link href="/useful" className={s.mobileNavLink}>Полезное</Link>
									<Link href="/news" className={s.mobileNavLink}>Новости</Link>
								</div>
								
								<div className={s.mobileAuthBtns}>
									{isAuthenticated && personalData ? (
										<div className={s.mobileUser}>
											<Link
												style={{ cursor: 'pointer' }}
												href={`/${personalData.language}/dashboard/profile`}>
												<Image
													style={{ borderRadius: '10px', border: '1px solid #c2c2c2' }}
													src={personalData.icon ?? avatar}
													alt={t('avatarAlt')}
													width={40}
													height={40}
												/>
											</Link>
											<div className={s.mobileUserInfo}>
												<p className={s.userName}>{personalData.name}</p>
												<p className={s.userPhone}>{formatPhoneNumber(personalData.phone)}</p>
											</div>
										</div>
									) : (
										<div className={s.mobileAuth}>
											<AppLink
												className={s.mobileAppLink}
												variant={'primary'}
												href={shouldShowMobileModal ? '#' : '/auth/login'}
												onClick={(e) => {
													if (shouldShowMobileModal) {
														e.preventDefault()
														open()
													}
												}}>
												{t('login')}
											</AppLink>
											<AppLink
												className={s.mobileAppLink}
												variant={'primary'}
												href={shouldShowMobileModal ? '#' : '/auth/register/select-role'}
												onClick={(e) => {
													if (shouldShowMobileModal) {
														e.preventDefault()
														open()
													}
												}}>
												{t('register')}
											</AppLink>
										</div>
									)}
								</div>
							</div>
						)}
					</header>
			</>
		)
	}

	return (
		<>
			<header className={s.userHeader}>
				<div className="container">
					<div className={s.inner}>
						<div className={s.left}>
							<Link
								className={s.logoBox}
								href={'/'}>
								<Image
									className={s.logo}
									src="/logo-blue.svg"
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
							<LangSwitcher />

							{isAuthenticated && personalData ? (
								<div className={s.user}>
									<NotificationsDropdown />

									<div className={s.userInfo}>
										<p className={s.userName}>{personalData.name}</p>
										<p className={s.userPhone}>{formatPhoneNumber(personalData.phone)}</p>
									</div>

									<Link
										style={{ cursor: 'pointer' }}
										href={`/${personalData.language}/dashboard/profile`}>
										<Image
											style={{ borderRadius: '10px', border: '1px solid #c2c2c2' }}
											src={personalData.icon ?? avatar}
											alt={t('avatarAlt')}
											width={40}
											height={40}
										/>
									</Link>

									<Button
										style={{ minWidth: 'max-content' }}
										variant={'danger'}
										onClick={handleLogout}>
										<Image
											src={LogoutIcon}
											alt={t('logoutAlt')}
											width={24}
											height={24}
										/>
									</Button>
								</div>
							) : (
								<Button
									style={{ minWidth: 'max-content' }}
									variant={'primary'}
									onClick={() => {
										if (shouldShowMobileModal) {
											open()
										} else {
											router.push('/auth/login')
										}
									}}>
									<Image
										src={lendingUser}
										alt={t('lendingUserAlt')}
										width={24}
										height={24}
									/>
								</Button>
							)}
						</div>
					</div>
				</div>
			</header>

			<Modal
				className={s.modal}
				isOpen={isOpen}
				onClose={close}>
				<div className={s.modalContent}>
					<Image
						src={monitor}
						alt={'monitor'}
						width={114}
						height={104}
					/>
					<p className={s.modalDescr}>{t('mobileModalTitle')}</p>

					<Button
						variant={'primary'}
						onClick={close}>
						{t('mobileModalButton')}
					</Button>
				</div>
			</Modal>
		</>
	)
}
