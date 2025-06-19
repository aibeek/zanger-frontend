'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

import Iphones from '@/app/assets/images/double-iphones.webp'
import Qr from '@/app/assets/icons/qr.svg'
// import GooglePlay from '@/app/assets/icons/googleplay.webp'
// import AppleStore from '@/app/assets/icons/appstore.webp'
import GooglePlay from '@/app/assets/icons/googleplay.png'
import AppleStore from '@/app/assets/icons/appstore.png'

import s from './DownloadAppSection.module.scss'

export const DownloadAppSection = () => {
	const t = useTranslations('lending.downloadApp')

	return (
		<section className={s.wrapper}>
			<div className="container-middle">
				<div className={s.inner}>
					<h3
						style={{ textAlign: 'center' }}
						className={`lending-title ${s.title}`}
						dangerouslySetInnerHTML={{ __html: t('title') }}
					/>

					<div className={s.content}>
						<div className={s.left}>
							<h6 className={s.subtitle}>{t('clientTitle')}</h6>
							{t.raw('clientTexts').map((text: string, idx: number) => (
								<p
									key={idx}
									className={s.text}
									dangerouslySetInnerHTML={{ __html: text }}
								/>
							))}
							<span className={s.subText}>{t('clientNote')}</span>
						</div>

						<div className={s.center}>
							<Image
								className={s.doubleIphones}
								src={Iphones}
								alt="изображение телефонов"
								width={400}
								height={480}
							/>

							<h6 className={s.microTitle}>{t('appInstall')}</h6>
							<div className={s.downloadLinks}>
								<Link href="#">
									<Image
										src={AppleStore}
										alt="apple store"
										width={180}
										height={52}
									/>
								</Link>
								<Link href="#">
									<Image
										src={GooglePlay}
										alt="google play"
										width={180}
										height={52}
									/>
								</Link>
							</div>
						</div>

						<div className={s.right}>
							<h6 className={s.subtitle}>{t('lawyerTitle')}</h6>
							{t.raw('lawyerTexts').map((text: string, idx: number) => (
								<p
									key={idx}
									className={s.text}
									dangerouslySetInnerHTML={{ __html: text }}
								/>
							))}
							<span
								className={s.subText}
								style={{ textAlign: 'right', maxWidth: '430px', margin: '0 0 0 auto' }}>
								{t('lawyerNote')}
							</span>
						</div>
					</div>
					{/* <div className={s.left}>
						<div className={s.leftTop}>
							<h3
								className={s.title}
								dangerouslySetInnerHTML={{ __html: t('title') }}
							/>
							<p className="lending-descr">{t('description')}</p>
						</div>
						<div className={s.leftBottom}>
							<Image
								className={s.qr}
								src={Qr}
								alt="изображение телефонов"
								width={210}
								height={216}
							/>
							<div className={s.downloadLinks}>
								<Link href="#">
									<Image
										src={AppleStore}
										alt="apple store"
										width={180}
										height={52}
									/>
								</Link>
								<Link href="#">
									<Image
										src={GooglePlay}
										alt="google play"
										width={180}
										height={52}
									/>
								</Link>
							</div>
						</div>
					</div>
					<div className={s.right}>
						<Image
							className={s.doubleIphones}
							src={Iphones}
							alt="изображение телефонов"
							width={481}
							height={583}
						/>
					</div> */}
				</div>
			</div>
		</section>
	)
}
