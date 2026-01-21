'use client'
import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import { authService, useLoginStore } from '@/features/auth'
import LogoutIcon from '@/app/assets/icons/logout.svg'
import avatar from '@/app/assets/icons/header-resourses/header-avatar.svg'
import monitor from '@/app/assets/icons/monitor.webp'
import lendingUser from '@/app/assets/icons/user-lending.svg'
import hubsImage from '/public/assets/images/hubs.png'
import { Button, LangSwitcher, Modal, useModal } from '@/shared/ui-kit'
import { formatPhoneNumber, useAuthStore, useMediaQuery, isMobileOrTablet, useHydration } from '@/shared/lib'
import { sharedApi } from '@/shared/api'

import s from './Header.module.scss'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { AppLink } from '@/shared/ui-kit/AppLink'
import { NotificationsDropdown } from '@/entities/notifications'
import { useSnow } from '@/shared/ui-kit/SnowProvider/SnowProvider'

interface HeaderProps {
	variant: 'user-variant' | 'lending-variant'
}

export const Header = ({ variant }: HeaderProps) => {
	const router = useRouter()
	const { isOpen, close, open } = useModal()
	const { personalData, getPersonalDataByToken, reset } = useLoginStore()
	const t = useTranslations('header')
	const { isAuthenticated, checkAuth } = useAuthStore()
	const pathname = usePathname()
	const isHydrated = useHydration()
	const isMobile = useMediaQuery('(max-width: 900px)') // Изменяем breakpoint для соответствия CSS
	const isMobileDevice = isMobileOrTablet() // Проверка реальных мобильных устройств

	const { snowEnabled, toggleSnow } = useSnow()

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

	// LIVE applications types and state
	type LiveApplicationItem = {
		id: number
		title: string
		description: string
		timeAgo: string
		createdDate: string // Добавлено: отформатированная дата создания
		location: string
		firstName: string
	}
	const [liveApplications, setLiveApplications] = useState<LiveApplicationItem[]>([])
	const [liveLoading, setLiveLoading] = useState(false)
	const [liveError, setLiveError] = useState<string | null>(null)
	const isLiveFetchingRef = useRef(false)
	const liveIntervalRef = useRef<number | null>(null)

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

	// Логи для отладки кнопки подписки
	useEffect(() => {
		console.log('🎫 Header subscription debug:', {
			isAuthenticated,
			hasPersonalData: !!personalData,
			isLawyer: personalData && 'lawyer' in personalData,
			lawyerData: personalData && 'lawyer' in personalData ? personalData.lawyer : null,
			subscription: personalData && 'lawyer' in personalData ? personalData.lawyer?.subscription : null,
			variant,
			fullPersonalData: personalData
		})
	}, [isAuthenticated, personalData, variant])

	const handleLogout = () => {
		reset()
		authService.logout()
		router.push('/auth/login')
	}

	// Helpers for LIVE
	const formatTimeAgo = (dateStr?: string) => {
		if (!dateStr) return ''
		const date = new Date(dateStr)
		const now = new Date()
		const diffMs = now.getTime() - date.getTime()
		const diffMin = Math.floor(diffMs / 60000)
		if (diffMin < 1) return 'только что'
		if (diffMin < 60) return `${diffMin} мин назад`
		const diffHours = Math.floor(diffMin / 60)
		if (diffHours < 24) return `${diffHours} ч назад`
		const diffDays = Math.floor(diffHours / 24)
		return `${diffDays} дн назад`
	}

	// Форматирование даты в читаемый вид: "13 ноября 2025, 12:59"
	const formatCreatedDate = (dateStr?: string) => {
		if (!dateStr) return ''
		const date = new Date(dateStr)
		const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
		const day = date.getDate()
		const month = months[date.getMonth()]
		const year = date.getFullYear()
		const hours = String(date.getHours()).padStart(2, '0')
		const minutes = String(date.getMinutes()).padStart(2, '0')
		return `${day} ${month} ${year}, ${hours}:${minutes}`
	}

	const mapLatestOrders = (raw: any[]): LiveApplicationItem[] => {
		if (!Array.isArray(raw)) return []
		return raw.map((item: any) => {
			const title =
				(item?.tag?.name && (typeof item.tag.name === 'string' ? item.tag.name : item.tag.name?.ru)) ||
				item?.specialization?.name ||
				'Заявка'
			const description = item?.short_description || item?.description || ''
			const createdAt = item?.created_at || item?.createdAt || item?.created
			const location =
				item?.region?.name ||
				item?.city?.name ||
				item?.user?.region?.name ||
				item?.location ||
				''
			const rawName = item?.user?.name || ''
			const firstName = typeof rawName === 'string' ? rawName.split(' ')[0] : ''
			return {
				id: Number(item?.id ?? Math.random() * 1e9),
				title,
				description,
				timeAgo: formatTimeAgo(createdAt),
				createdDate: formatCreatedDate(createdAt),
				location,
				firstName,
			}
		})
	}

	const fetchLatestOrders = async () => {
		if (isLiveFetchingRef.current) return
		isLiveFetchingRef.current = true
		try {
			setLiveLoading(true)
			setLiveError(null)
			const res: any = await sharedApi.getLatestOrders<any>()
			const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
			setLiveApplications(mapLatestOrders(data))
		} catch (err) {
			console.error('Ошибка загрузки последних заявок:', err)
			setLiveError('Не удалось загрузить заявки')
		} finally {
			setLiveLoading(false)
			isLiveFetchingRef.current = false
		}
	}

	// LIVE button click handler
	const handleLiveClick = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
		// Always toggle dropdown and fetch on both desktop and mobile
		e.preventDefault()
		setShowLiveApplications((prev) => {
			const next = !prev
			if (next) fetchLatestOrders()
			return next
		})
	}

	// Автообновление списка заявок пока открыт диалог LIVE
	useEffect(() => {
		if (showLiveApplications) {
			if (!liveIntervalRef.current) {
				liveIntervalRef.current = window.setInterval(() => {
					fetchLatestOrders()
				}, 3000)
			}

			// Блокируем скролл на мобильных устройствах когда меню открыто
			if (isMobile) {
				document.body.style.overflow = 'hidden'
			}
		} else {
			if (liveIntervalRef.current) {
				clearInterval(liveIntervalRef.current)
				liveIntervalRef.current = null
			}

			// Восстанавливаем скролл
			document.body.style.overflow = ''
		}
		return () => {
			if (liveIntervalRef.current) {
				clearInterval(liveIntervalRef.current)
				liveIntervalRef.current = null
			}
			// Восстанавливаем скролл при размонтировании
			document.body.style.overflow = ''
		}
	}, [showLiveApplications, isMobile])

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
										width={50}
										height={50}
										priority
									/>
									<span className={s.logoText}>ZANGER</span>
								</Link>
							</div>
						</div>

						{isHydrated && !isMobile && (
							<nav className={s.navigation}>
								{/* snow toggle moved to right area (next to LangSwitcher) */}
								<button
									onClick={() => scrollToSection('news')}
									className={s.navLink}
									style={{ background: 'none', border: 'none', cursor: 'pointer' }}
								>
									{t('news')}
								</button>
								<button
									onClick={() => scrollToSection('about')}
									className={s.navLink}
									style={{ background: 'none', border: 'none', cursor: 'pointer' }}
								>{t('aboutUs')}</button>
								<button
									onClick={() => scrollToSection('lawyers')}
									className={s.navLink}
									style={{ background: 'none', border: 'none', cursor: 'pointer' }}
								>{t('lawyers')}</button>
								<button
									onClick={() => scrollToSection('info')}
									className={s.navLink}
									style={{ background: 'none', border: 'none', cursor: 'pointer' }}
								>{t('info')}</button>
								<button
									onClick={() => scrollToSection('modules')}
									className={s.navLink}
									style={{ background: 'none', border: 'none', cursor: 'pointer' }}
								>{t('modules')}</button>
								<button
									onClick={() => scrollToSection('resources')}
									className={s.navLink}
									style={{ background: 'none', border: 'none', cursor: 'pointer' }}
								>{t('useful')}</button>
							</nav>
						)}						<div className={s.right}>
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

											<AppLink
												className={s.appLink}
												variant={'primary'}
												href={'/auth/register/select-role'}
												onClick={(e) => {
													// На мобильных показываем модалку
													if (shouldShowMobileModal) {
														e.preventDefault()
														open()
													}
													// На десктопе ссылка работает нормально
												}}>
												{t('register')}
											</AppLink>

											<div className={s.liveButtonWrapper} ref={liveButtonRef}>
												<AppLink
													className={`${s.appLink} ${s.liveButton}`}
													variant={'primary'}
													href={'/live-applications'}
													prefetch={false}
													onClick={handleLiveClick}>
													LIVE
												</AppLink>
												{showLiveApplications && (
													<div className={s.liveDropdown} role="dialog" aria-label="LIVE заявки">
														<div className={s.liveDropdownHeader}>
															<h3>
																LIVE заявки
															</h3>
															<button className={s.closeDropdown} onClick={() => setShowLiveApplications(false)} aria-label="Закрыть">×</button>
														</div>
														<div className={s.liveApplicationsList}>
															{liveError ? (
																<p style={{ padding: '12px', color: 'red' }}>{liveError}</p>
															) : liveApplications.length === 0 ? (
																liveLoading ? (
																	<p style={{ padding: '12px' }}>Загрузка...</p>
																) : (
																	<p style={{ padding: '12px' }}>Нет новых заявок</p>
																)
															) : (
																<>
																	{liveApplications.map((item) => (
																		<div key={item.id} className={s.liveApplicationItem}>
																			<div className={s.liveAppHeader}>
																				<h4>{item.title}</h4>
																				<span className={s.userNameBadge}>{item.firstName || '—'}</span>
																			</div>
																			<p className={s.liveAppDescription}>{item.description}</p>
																			<div className={s.liveAppFooter}>
																				<span className={s.location}>📍 {item.location || '—'}</span>
																				<span className={s.createdDate}>🕐 {item.createdDate}</span>
																				<button
																					className={s.respondBtn}
																					onClick={() => {
																						setShowLiveApplications(false)
																						router.push('/auth/login')
																					}}>
																					Откликнуться
																				</button>
																			</div>
																		</div>
																	))}
																	<div className={s.moreBtnWrapper}>
																		<button
																			className={s.respondBtn}
																			onClick={() => {
																				setShowLiveApplications(false)
																				router.push('/auth/login')
																			}}>
																			Больше
																		</button>
																	</div>
																</>
															)}
														</div>
													</div>
												)}
											</div>
										</>
									)}
								</div>
							)}

							<LangSwitcher />


							{/* Snow toggle placed to the right of language selector */}
							<button
								className={s.snowToggle}
								onClick={toggleSnow}
								aria-label={snowEnabled ? 'Выключить снег' : 'Включить снег'}
								title={snowEnabled ? 'Выключить снег' : 'Включить снег'}
							>
								<svg
									className={`${s.snowSvg} ${snowEnabled ? s.animateSpinSlow : ''} lucide h-5 w-5 lucide-snowflake-icon lucide-snowflake`}
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<path d="m10 20-1.25-2.5L6 18"></path>
									<path d="M10 4 8.75 6.5 6 6"></path>
									<path d="m14 20 1.25-2.5L18 18"></path>
									<path d="m14 4 1.25 2.5L18 6"></path>
									<path d="m17 21-3-6h-4"></path>
									<path d="m17 3-3 6 1.5 3"></path>
									<path d="M2 12h6.5L10 9"></path>
									<path d="m20 10-1.5 2 1.5 2"></path>
									<path d="M22 12h-6.5L14 15"></path>
									<path d="m4 10 1.5 2L4 14"></path>
									<path d="m7 21 3-6-1.5-3"></path>
									<path d="m7 3 3 6h4"></path>
								</svg>
							</button>

							{isHydrated && isMobile && (
								<>
									<div className={s.mobileLiveButtonWrapper} ref={liveButtonRef}>
										<button
											className={`${s.mobileHeaderLiveBtn}`}
											onClick={handleLiveClick}
										>
											LIVE
										</button>
										{showLiveApplications && (
											<>
												<div className={s.liveDropdownBackdrop} onClick={() => setShowLiveApplications(false)} />
												<div className={s.liveDropdown} role="dialog" aria-label="LIVE заявки">
													<div className={s.liveDropdownHeader}>
														<h3>LIVE заявки</h3>
														<button className={s.closeDropdown} onClick={() => setShowLiveApplications(false)} aria-label="Закрыть">×</button>
													</div>
													<div className={s.liveApplicationsList}>
														{liveError ? (
															<p style={{ padding: '12px', color: 'red' }}>{liveError}</p>
														) : liveApplications.length === 0 ? (
															liveLoading ? (
																<p style={{ padding: '12px' }}>Загрузка...</p>
															) : (
																<p style={{ padding: '12px' }}>Нет новых заявок</p>
															)
														) : (
															<>
																{liveApplications.map((item) => (
																	<div key={item.id} className={s.liveApplicationItem}>
																		<div className={s.liveAppHeader}>
																			<h4>{item.title}</h4>
																			<span className={s.userNameBadge}>{item.firstName || '—'}</span>
																		</div>
																		<p className={s.liveAppDescription}>{item.description}</p>
																		<div className={s.liveAppFooter}>
																			<span className={s.location}>📍 {item.location || '—'}</span>
																			<span className={s.createdDate}>🕐 {item.createdDate}</span>
																			<button
																				className={s.respondBtn}
																				onClick={() => {
																					setShowLiveApplications(false)
																					router.push('/auth/login')
																				}}>
																				Откликнуться
																			</button>
																		</div>
																	</div>
																))}
																<div className={s.moreBtnWrapper}>
																	<button
																		className={s.respondBtn}
																		onClick={() => {
																			setShowLiveApplications(false)
																			router.push('/auth/login')
																		}}>
																		Больше
																	</button>
																</div>
															</>
														)}
													</div>
												</div>
											</>
										)}
									</div>
									<button
										className={s.mobileMenuBtn}
										onClick={() => setShowMobileMenu(!showMobileMenu)}
									>
										<span></span>
										<span></span>
										<span></span>
									</button>
								</>
							)}
						</div>
					</div>

					{/* Мобильное меню */}
					{isHydrated && isMobile && showMobileMenu && (
						<div className={s.mobileMenu}>
							<div className={s.mobileNavigation}>
								{/* Snow Toggle Button for Mobile */}
								<button
									className={s.snowToggleMobile}
									onClick={toggleSnow}
									aria-label={snowEnabled ? 'Выключить снег' : 'Включить снег'}
								>
									<svg
										className={`${s.snowSvg} ${snowEnabled ? s.animateSpinSlow : ''} lucide h-5 w-5 lucide-snowflake-icon lucide-snowflake`}
										width="24"
										height="24"
										viewBox="0 0 24 24"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<path d="m10 20-1.25-2.5L6 18"></path>
										<path d="M10 4 8.75 6.5 6 6"></path>
										<path d="m14 20 1.25-2.5L18 18"></path>
										<path d="m14 4 1.25 2.5L18 6"></path>
										<path d="m17 21-3-6h-4"></path>
										<path d="m17 3-3 6 1.5 3"></path>
										<path d="M2 12h6.5L10 9"></path>
										<path d="m20 10-1.5 2 1.5 2"></path>
										<path d="M22 12h-6.5L14 15"></path>
										<path d="m4 10 1.5 2L4 14"></path>
										<path d="m7 21 3-6-1.5-3"></path>
										<path d="m7 3 3 6h4"></path>
									</svg>
									<span className={s.snowToggleLabel}>{snowEnabled ? 'Выключить снег' : 'Включить снег'}</span>
								</button>
								<button
									onClick={() => { scrollToSection('news'); setShowMobileMenu(false); }}
									className={s.mobileNavLink}
									style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
								>
									{t('news')}
								</button>
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
									onClick={() => { scrollToSection('info'); setShowMobileMenu(false); }}
									className={s.mobileNavLink}
									style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
								>
									{t('info')}
								</button>
								<button
									onClick={() => { scrollToSection('modules'); setShowMobileMenu(false); }}
									className={s.mobileNavLink}
									style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
								>
									{t('modules')}
								</button>
								<button
									onClick={() => { scrollToSection('resources'); setShowMobileMenu(false); }}
									className={s.mobileNavLink}
									style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
								>
									{t('useful')}
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
											className={`${s.mobileAppLink} ${s.mobileLiveButton}`}
											variant={'primary'}
											href={'/live-applications'}
											prefetch={false}
											onClick={(e) => {
												// В мобильном меню показываем модалку
												console.log('Клик на LIVE в мобильном меню')
												e.preventDefault()
												open()
												setShowMobileMenu(false)
											}}>
											LIVE заявки
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
							{/* Кнопка подписки для юристов */}
							{isAuthenticated && personalData && 'lawyer' in personalData && personalData.lawyer?.subscription && (
								<>
									{console.log('🎫 Subscription button data:', {
										subscription: personalData.lawyer.subscription,
										ends_at: personalData.lawyer.subscription.ends_at,
										formatted: new Date(personalData.lawyer.subscription.ends_at).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
									})}
									<Link
										href={`/${personalData.language}/dashboard/subscription`}
										className={s.subscriptionButton}
									>
										{t('subscriptionActive')} {new Date(personalData.lawyer.subscription.ends_at).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })}
									</Link>
								</>
							)}

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
