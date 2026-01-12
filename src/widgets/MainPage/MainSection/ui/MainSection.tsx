'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import phone from '@/app/assets/icons/phone.svg'
import logo from '../../../../../public/happynewyear.svg'
import { Header } from '@/widgets/Header'
import s from './MainSection.module.scss'
import Iphones from '@/app/assets/images/iphones.webp'
import GooglePlay from '@/app/assets/icons/googleplay.webp'
import AppleStore from '@/app/assets/icons/appstore.webp'
import HubsLogoKZ from '../../../../../public/assets/images/hubs.svg'
import HubsLogoRU from '../../../../../public/assets/images/hub.svg'


export const MainSection = () => {
	const t = useTranslations('lending.mainSection')
	const locale = useLocale()
    
	const HubsLogo = locale === 'kz' ? HubsLogoKZ : HubsLogoRU
	const hubsDimensions = {
		width: HubsLogo.width,
		height: HubsLogo.height,
	}

	return (
		<section id="mainSection" className={s.wrapper}>
			<Header variant={'lending-variant'} />
			<div className={s.abstractLandscape}>
				<video
					className={s.bgVideo}
					src="/assets/images/mainn.mp4"
					autoPlay
					loop
					muted
					playsInline
				/>	
				<div className={s.container}>
					<div className={s.textSection}>
						{/* Title and content block (badge moved to phone side) */}
						<div className={s.titleContainer}>
							<h1 className={s.title} dangerouslySetInnerHTML={{ __html: t('title') }} />
						</div>
						<div className={s.descrContainer}>
							<p className={s.descr}>{t('description')}</p>
						</div>
						<div className={s.numberSection}>
							<div className={s.bigNumber}>5510</div>
						</div>
						<div className={s.disclaimer}>
							<p>{t('disclaimer')}</p>
						</div>
						<div className={s.actionButtons}>
							<Link href="tel:5510" className={s.phoneButton}>
								<Image src={phone} alt="Phone" className={s.phoneIcon} width={24} height={24} />
								{t('phoneButton')}
							</Link>
							{/* Mobile-only Astana Hub badge placed right after the call button */}
							<div className={s.hubsBadgeMobile}>
								<Image
									src={HubsLogo}
									alt="Astana Hub"
									width={hubsDimensions.width}
									height={hubsDimensions.height}
									className={s.hubsLogo}
								/>
							</div>
						{/* <div className={s.requestButtonContainer}>
							<Link href="/" className={s.requestButton}>
								{t('createNew')}
							</Link>
							</div> */}
						</div>
					</div>
					<div className={s.phoneImages}>
						{/* Astana Hub badge placed above the phone image */}
						<div className={s.hubsBadge}>
							<Image
								src={HubsLogo}
								alt="Astana Hub"
								width={hubsDimensions.width}
								height={hubsDimensions.height}
								className={s.hubsLogo}
							/>
						</div>
						<div className={s.phoneContainer}>
							<Image
								src={Iphones}
								alt="phones"
								className={s.phonesImg}
								width={260}
								height={260}
							/>
						</div>
						<div className={s.appStores}>
							{/* <Link href={'/'}>
								<Image
									src={AppleStore}
									alt={'app store'}
									width={160}
									height={48}
								/>
							</Link>
							<Link href={'/'}>
								<Image
									src={GooglePlay}
									alt={'google play'}
									width={160}
									height={48}
								/>
							</Link> */}
							<div className={s.mobileVersionText}>
								<span
									className={s.developmentLabel}
									dangerouslySetInnerHTML={{ __html: t('mobileVersionLabel') }}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div id="mainSectionSentinel" className={s.sentinel} aria-hidden="true" />
		</section>
	)
}
