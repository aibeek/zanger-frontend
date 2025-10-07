'use client'
import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import { authService, useLoginStore } from '@/features/auth'
import LogoutIcon from '@/app/assets/icons/logout.svg'
import avatar from '@/app/assets/icons/header-resourses/header-avatar.svg'
import monitor from '@/app/assets/icons/monitor.webp'
import lendingUser from '@/app/assets/icons/user-lending.svg'
import { Button, LangSwitcher, Modal, useModal } from '@/shared/ui-kit'
import { formatPhoneNumber, useAuthStore, useMediaQuery, isMobileOrTablet, useHydration } from '@/shared/lib'

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
	const isHydrated = useHydration()
	const isMobile = useMediaQuery('(max-width: 900px)') // Изменяем breakpoint для соответствия CSS
	const isMobileDevice = isMobileOrTablet() // Проверка реальных мобильных устройств

	// Логирование состояния модального окна
	useEffect(() => {
		console.log('Modal isOpen changed:', isOpen)
	}, [isOpen])
	
	// Комбинированная проверка: либо узкий экран, либо реальное мобильное устройство
	// Only use this after component is mounted to prevent hydration mismatch
	const shouldShowMobileModal = isHydrated && (isMobile || isMobileDevice)

	// Отладка
	useEffect(() => {
		console.log('shouldShowMobileModal:', shouldShowMobileModal)
		console.log('isHydrated:', isHydrated)
		console.log('isMobile:', isMobile)
		console.log('isMobileDevice:', isMobileDevice)
	}, [shouldShowMobileModal, isHydrated, isMobile, isMobileDevice])

	// Функция для скролла к секции
	const scrollToSection = (sectionId: string) => {
		const element = document.getElementById(sectionId)
		if (element) {
			const headerHeight = 120 // Высота хедера + отступ
			const elementPosition = element.offsetTop - headerHeight
			
			window.scrollTo({ 
				top: elementPosition,
				behavior: 'smooth'
			})
		}
	}
	
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

	// Закрытие дропдауна по клику вне и по Esc
	const liveButtonRef = useRef<HTMLDivElement | null>(null)
	useEffect(() => {
		const onDocClick = (e: MouseEvent) => {
			if (liveButtonRef.current && !liveButtonRef.current.contains(e.target as Node)) {
				setShowLiveApplications(false)
			}
		}
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setShowLiveApplications(false)
		}
		document.addEventListener('mousedown', onDocClick)
		window.addEventListener('keydown', onKey)
		return () => {
			document.removeEventListener('mousedown', onDocClick)
			window.removeEventListener('keydown', onKey)
		}
	}, [])

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
										width={160}
										height={45}
										priority
										style={{ width: 'auto', height: 'auto' }}
									/>
									<span className={s.logoText}>ZANGER</span>
								</Link>
							</div>
						</div>
						
						{isHydrated && !isMobile && (
							<nav className={s.navigation}>
								<button 
									onClick={() => scrollToSection('about')} 
									className={s.navLink}
									style={{ background: 'none', border: 'none', cursor: 'pointer' }}
								>
									{t('aboutUs')}
								</button>
								<button 
									onClick={() => scrollToSection('lawyers')} 
									className={s.navLink}
									style={{ background: 'none', border: 'none', cursor: 'pointer' }}
								>{t('lawyers')}</button>
								<button 
									onClick={() => scrollToSection('modules')} 
									className={s.navLink}
									style={{ background: 'none', border: 'none', cursor: 'pointer' }}
								>{t('modules')}</button>
								<button 
									onClick={() => scrollToSection('info')} 
									className={s.navLink}
									style={{ background: 'none', border: 'none', cursor: 'pointer' }}
								>{t('info')}</button>
								<button 
									onClick={() => scrollToSection('resources')} 
									className={s.navLink}
									style={{ background: 'none', border: 'none', cursor: 'pointer' }}
								>{t('useful')}</button>
								<button 
									onClick={() => scrollToSection('news')} 
									className={s.navLink}
									style={{ background: 'none', border: 'none', cursor: 'pointer' }}
								>{t('news')}</button>
							</nav>
						)}
						
						<div className={s.right}>
							{isHydrated && !isMobile && (
								<div className={s.authBtns}>
									{isAuthenticated && personalData ? (
										<div className={s.user}>
											<Link
												style={{ cursor: 'pointer' }}
												href={`/${personalData.language}/dashboard/profile`}>
												<Image
													style={{ borderRadius: '10px', border: '1px solid #c2c2c2' }}
													src={personalData.icon && !personalData.icon.includes('Lawyer.jpg') ? personalData.icon : avatar}
													alt={('avatarAlt')}
													width={40}
													height={40}
													unoptimized={!personalData.icon || personalData.icon.includes('Lawyer.jpg')}
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
												href={'/auth/login'}
												onClick={(e) => {
													// На мобильных показываем модалку
													if (shouldShowMobileModal) {
														e.preventDefault()
														open()
													}
													// На десктопе ссылка работает нормально
												}}>
												{t('login')}
											</AppLink>

											<div className={s.liveButtonWrapper} ref={liveButtonRef}>
												<AppLink
													className={`${s.appLink} ${s.liveButton}`}
													variant={'primary'}
													href={'/live-applications'}
													onClick={(e) => {
														// На мобильных показываем модалку
														if (shouldShowMobileModal) {
															e.preventDefault()
															open()
															return
														}
														// На десктопе — дропдаун
														e.preventDefault()
														setShowLiveApplications((prev) => !prev)
													}}>
														LIVE
													</AppLink>
												{showLiveApplications && (
													<div className={s.liveDropdown} role="dialog" aria-label="LIVE заявки">
														<div className={s.liveDropdownHeader}>
															<h3>
																LIVE заявки <span className={s.demoLabel}>DEMO</span>
															</h3>
															<button className={s.closeDropdown} onClick={() => setShowLiveApplications(false)} aria-label="Закрыть">×</button>
														</div>
														<div className={s.liveApplicationsList}>
															{liveApplications.map((item) => (
																<div key={item.id} className={s.liveApplicationItem}>
																	<div className={s.liveAppHeader}>
																		<h4>{item.title}</h4>
																		<span className={s.timeAgo}>{item.timeAgo}</span>
																	</div>
																	<p className={s.liveAppDescription}>{item.description}</p>
																	<div className={s.liveAppFooter}>
																		<span className={s.location}>📍 {item.location}</span>
																		<button className={s.respondBtn} onClick={() => setShowLiveApplications(false)}>Откликнуться</button>
																	</div>
																</div>
															))}
														</div>
													</div>
												)}
											</div>
										</>
									)}
								</div>
							)}
							
							<LangSwitcher />

							{isHydrated && isMobile && (
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
						{isHydrated && isMobile && showMobileMenu && (
							<div className={s.mobileMenu}>
								<div className={s.mobileNavigation}>
									<button 
										onClick={() => { scrollToSection('about'); setShowMobileMenu(false); }} 
										className={s.mobileNavLink}
										style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
									>
										{t('aboutUs')}
									</button>
									<button 
										onClick={() => { scrollToSection('lawyers'); setShowMobileMenu(false); }} 
										className={s.mobileNavLink}
										style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
									>
										{t('lawyers')}
									</button>
									<button 
										onClick={() => { scrollToSection('modules'); setShowMobileMenu(false); }} 
										className={s.mobileNavLink}
										style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
									>
										{t('modules')}
									</button>
									<button 
										onClick={() => { scrollToSection('info'); setShowMobileMenu(false); }} 
										className={s.mobileNavLink}
										style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
									>
										{t('info')}
									</button>
									<button 
										onClick={() => { scrollToSection('resources'); setShowMobileMenu(false); }} 
										className={s.mobileNavLink}
										style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
									>
										{t('useful')}
									</button>
									<button 
										onClick={() => { scrollToSection('news'); setShowMobileMenu(false); }} 
										className={s.mobileNavLink}
										style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
									>
										{t('news')}
									</button>
								</div>
								
								<div className={s.mobileAuthBtns}>
									{isAuthenticated && personalData ? (
										<div className={s.mobileUser}>
											<Link
												style={{ cursor: 'pointer' }}
												href={`/${personalData.language}/dashboard/profile`}>
												<Image
													style={{ borderRadius: '10px', border: '1px solid #c2c2c2' }}
													src={personalData.icon && !personalData.icon.includes('Lawyer.jpg') ? personalData.icon : avatar}
													alt={t('avatarAlt')}
													width={40}
													height={40}
													unoptimized={!personalData.icon || personalData.icon.includes('Lawyer.jpg')}
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
												href={'/auth/login'}
												onClick={(e) => {
													// В мобильном меню всегда показываем модалку
													console.log('Клик на Войти в мобильном меню')
													console.log('isOpen:', isOpen)
													e.preventDefault()
													open()
													console.log('После вызова open()')
													setShowMobileMenu(false)
												}}>
												{t('login')}
											</AppLink>
											<AppLink
												className={s.mobileAppLink}
												variant={'primary'}
												href={'/auth/register/select-role'}
												onClick={(e) => {
													// В мобильном меню всегда показываем модалку
													console.log('Клик на Регистрация в мобильном меню')
													console.log('isOpen:', isOpen)
													e.preventDefault()
													open()
													console.log('После вызова open()')
													setShowMobileMenu(false)
												}}>
												{t('register')}
											</AppLink>
										</div>
									)}
								</div>
							</div>
						)}
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
											src={personalData.icon && !personalData.icon.includes('Lawyer.jpg') ? personalData.icon : avatar}
											alt={t('avatarAlt')}
											width={40}
											height={40}
											unoptimized={!personalData.icon || personalData.icon.includes('Lawyer.jpg')}
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
										alt={('lendingUserAlt')}
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
