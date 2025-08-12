'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import phone from '@/app/assets/icons/phone.svg'
import logo from '../../../../../public/logo.svg'
import s from './MainSection.module.scss'

export const MainSection = () => {
	const t = useTranslations('lending.mainSection')
	const [videoLoaded, setVideoLoaded] = useState(false)
	const videoRef = useRef<HTMLVideoElement>(null)

	const handleVideoLoad = () => {
		setVideoLoaded(true)
	}

	return (
		<section className={s.wrapper}>
			<div className={s.middle}>
				<div className={s.middleContent}>
					<video 
						ref={videoRef}
						className={`${s.backgroundVideo} ${videoLoaded ? s.loaded : ''}`}
						width="400"
						height="225"
						autoPlay 
						muted 
						loop 
						playsInline
						onLoadedData={handleVideoLoad}
						onCanPlay={handleVideoLoad}
					>
						<source src="/assets/images/main-video.mp4" type="video/mp4" />
					</video>
					<div className={s.text}>
						<div className={s.companyTitle}>Global Legal Technologies</div>
						<div className={s.logoContainer}>
							<Image
								src={logo}
								alt="ZANGER Logo"
								className={s.logo}
								width={300}
								height={300}
							/>
						</div>
						<div className={s.titleContainer}>
							<h1 className={s.title} dangerouslySetInnerHTML={{ __html: t('title') }} />
							<div className={s.titleUnderline}></div>
						</div>
						<div className={s.descrContainer}>
							<p className={s.descr}>{t('description')}</p>
							<div className={s.descrGlow}></div>
						</div>
					</div>
				</div>
			</div>

			<div className={s.bottom}>
				<div className={s.bottomContent}>
					<div className={s.contactSection}>
						<div className={s.disclaimerWrapper}>
							<div className={s.arrow}>
								<p dangerouslySetInnerHTML={{ __html: t('disclaimer') }} />
							</div>
						</div>
						
						<div className={s.callAction}>
							<Link
								href={'tel:+5510'}
								className={s.phoneButton}>
								<div className={s.phoneIcon}>
									<Image
										src={phone}
										alt="phone"
										width={24}
										height={24}
									/>
								</div>
								<div className={s.callText}>
									<span className={s.callNow}>Позвонить</span>
									<span className={s.number}>5510</span>
								</div>
							</Link>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}
