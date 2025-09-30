'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import phone from '@/app/assets/icons/phone.svg'
import logo from '../../../../../public/logo.svg'
import { Header } from '@/widgets/Header'
import s from './MainSection.module.scss'
import Iphones from '@/app/assets/images/iphones.webp'
import GooglePlay from '@/app/assets/icons/googleplay.webp'
import AppleStore from '@/app/assets/icons/appstore.webp'


export const MainSection = () => {
	const t = useTranslations('lending.mainSection')

	return (
		<section className={s.wrapper}>
			<Header variant={'lending-variant'} />
			<div className={s.abstractLandscape}>
				<div className={s.container}>
					<div className={s.textSection}>
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
						<div className={s.requestButtonContainer}>
							<Link href="/auth/register/select-role" className={s.requestButton}>
								{t('createNew')}
							</Link>
							</div>
						</div>
					</div>
					<div className={s.phoneImages}>
						<div className={s.phoneContainer}>
							<Image
								src={Iphones}
								alt="phones"
								className={s.phonesImg}
								width={360}
								height={360}
								style={{ width: 'auto', height: 'auto' }}
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
		</section>
	)
}
