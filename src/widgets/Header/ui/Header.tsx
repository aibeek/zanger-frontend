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
import { formatPhoneNumber, useAuthStore, useMediaQuery } from '@/shared/lib'

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
	const isMobile = useMediaQuery('(max-width: 768px)')
	
	// Состояние для Live заявок
	const [showLiveApplications, setShowLiveApplications] = useState(false)
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
					<div className="container">
						<div className={s.headerContent}>
							<div className={s.logo}>
								<Link 
									href="/"
									style={{ 
										background: 'linear-gradient(45deg, #1e3c72, #2a5298, #3b82f6, #60a5fa, #93c5fd)',
										backgroundSize: '400% 400%',
										WebkitBackgroundClip: 'text',
										WebkitTextFillColor: 'transparent',
										backgroundClip: 'text',
										fontSize: isMobile ? '20px' : '28px', 
										fontWeight: '700', 
										textDecoration: 'none',
										letterSpacing: isMobile ? '1px' : '1.5px',
										animation: 'gradient 3s ease infinite',
										display: 'inline-block'
									}}>
									ZANGER
								</Link>
								<style jsx>{`
									@keyframes gradient {
										0% {
											background-position: 0% 50%;
										}
										50% {
											background-position: 100% 50%;
										}
										100% {
											background-position: 0% 50%;
										}
									}
								`}</style>
							</div>
							<LangSwitcher />
							
							<div className={s.authBtns}>
								{isMobile && (
									<div style={{ height: '42px' }}>
										<Button
											onClick={open}
											size={'auto'}
											variant={'clear'}>
											<Image
												style={{ borderRadius: '10px' }}
												src={lendingUser}
												alt={'icon'}
												width={42}
												height={42}
											/>
										</Button>
									</div>
								)}
								{isAuthenticated && personalData ? (
									<>
										{!isMobile && (
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
										)}
									</>
								) : (
									<>
										{!isMobile && (
											<AppLink
												className={s.appLink}
												variant={'primary'}
												href={'/auth/login'}>
												{t('login')}
											</AppLink>
										)}

										{!isMobile && (
											<AppLink
												className={s.appLink}
												variant={'border-white'}
												href={'/auth/register/select-role'}>
												{t('register')}
											</AppLink>
										)}

										{!isMobile && (
											<div className={s.liveButtonWrapper}>
												<button
													className={`${s.appLink} ${s.liveButton}`}
													onClick={() => setShowLiveApplications(!showLiveApplications)}
													onMouseEnter={(e) => {
														const shine = e.currentTarget.querySelector('.shine-effect')
														if (shine) {
															(shine as HTMLElement).style.left = '100%'
														}
													}}
													onMouseLeave={(e) => {
														const shine = e.currentTarget.querySelector('.shine-effect')
														if (shine) {
															(shine as HTMLElement).style.left = '-100%'
														}
													}}>
													<span 
														className="shine-effect"
														style={{
															position: 'absolute',
															top: 0,
															left: '-100%',
															width: '100%',
															height: '100%',
															background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
															transition: 'left 0.6s ease',
															zIndex: 1,
															pointerEvents: 'none'
														}}>
													</span>
													<span style={{ 
														position: 'relative', 
														zIndex: 2, 
														display: 'flex', 
														alignItems: 'center', 
														gap: '6px',
														lineHeight: '1'
													}}>
														🔴 {t('liveApplications')}
													</span>
												</button>
												
												{showLiveApplications && (
													<div className={s.liveDropdown}>
														<div className={s.liveDropdownHeader}>
															<h3>🔴 Live заявки <span className={s.demoLabel}>(ДЕМО)</span></h3>
															<button 
																className={s.closeDropdown}
																onClick={() => setShowLiveApplications(false)}>
																×
															</button>
														</div>
														
														<div className={s.liveApplicationsList}>
															{liveApplications.map((app) => (
																<div key={app.id} className={s.liveApplicationItem}>
																	<div className={s.liveAppHeader}>
																		<h4>{app.title} <span className={s.testBadge}>ТЕСТ</span></h4>
																		<span className={s.timeAgo}>{app.timeAgo}</span>
																	</div>
																	<p className={s.liveAppDescription}>{app.description}</p>
																														<div className={s.liveAppFooter}>
														<span className={s.location}>📍 {app.location}</span>
														<button 
															className={s.respondBtn}
															onClick={() => {
																setShowLiveApplications(false)
																router.push('/auth/register/select-role')
															}}>
															Откликнуться
														</button>
													</div>
																</div>
															))}
														</div>
														
														<div className={s.liveDropdownFooter}>
															<p>⚠️ Это тестовые данные для демонстрации</p>
														</div>
													</div>
												)}
											</div>
										)}
									</>
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

							{isAuthenticated && personalData && (
								<>
									<div className={s.notifications}>
										<NotificationsDropdown />
									</div>
									<div className={s.user}>
										{personalData.role_id.code === 'lawyer' &&
											isAuthenticated &&
											personalData &&
											!pathname.includes('/subscription') && (
												<div className={s.subscription}>
													<AppLink
														className={s.subLink}
														variant={'border'}
														href={'/subscription'}>
														{t('subscription')}
													</AppLink>
												</div>
											)}
										<Link
											style={{ cursor: 'pointer' }}
											href={`/${personalData.language}/dashboard/profile`}>
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
