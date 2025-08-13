'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

import Iphones from '@/app/assets/images/iphones.webp'
import GooglePlay from '@/app/assets/icons/googleplay.webp'
import AppleStore from '@/app/assets/icons/appstore.webp'

import s from './DownloadAppSection.module.scss'

export const DownloadAppSection = () => {
	const t = useTranslations('lending.downloadAppSection')

	return (
		<section className={s.wrapper}>
			<div className="container-middle">
				<div className={s.inner}>
					<div className={s.left}>
						<h5 className={s.title}>{t('title')}</h5>
						<p className={s.availability}>{t('availabilityText')}</p>
						<div className={s.btns}>
							<Link href={'/'}>
								<Image
									src={AppleStore}
									alt={'app store'}
									width={180}
									height={52}
								/>
							</Link>
							<Link href={'/'}>
								<Image
									src={GooglePlay}
									alt={'google play'}
									width={180}
									height={52}
								/>
							</Link>
						</div>
					</div>
					<div className={s.right}>
						<Image
							src={Iphones}
							alt="iphones"
							className={s.img}
						/>
					</div>
				</div>
			</div>
		</section>
	)
}
