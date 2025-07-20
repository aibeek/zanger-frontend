'use client'
import { useEffect } from 'react'
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
					<div className={s.left}>
						<div className={s.logo}>
							<Image
								src="/logo.svg"
								alt={t('logoAlt')}
								width={56}
								height={66}
							/>
						</div>
						<LangSwitcher />
					</div>

					<div className="container">
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
								</>
							)}
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
