'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

import tik_tok from '@/app/assets/icons/tik_tok.svg'
import facebook from '@/app/assets/icons/facebook.svg'
import telegram from '@/app/assets/icons/telegram.svg'
import arrow from '@/app/assets/icons/arrow-right.svg'
import instagram from '@/app/assets/icons/instagram.svg'
import mainBgPhone from '@/app/assets/icons/main-bg-phone.svg'
import s from './MainSection.module.scss'

export const MainSection = () => {
	const t = useTranslations('lending.mainSection')

	return (
		<section className={s.wrapper}>
			<div className={s.middle}>
				<div className={s.socials}>
					<Link href={'https://t.me/zanger5510'}>
						<Image
							src={telegram}
							alt="telegram"
						/>
					</Link>
					<Link href={'https://www.facebook.com/people/Zanger5510/61578403178388/'}>
						<Image
							src={facebook}
							alt="facebook"
						/>
					</Link>
					<Link href={'https://www.tiktok.com/@zanger5510'}>
						<Image
							src={tik_tok}
							alt="tik tok"
						/>
					</Link>
					<Link href={'https://www.instagram.com/zanger5510/'}>
						<Image
							src={instagram}
							alt="instagram"
						/>
					</Link>
				</div>
				<div className={s.middleContent}>
					<div className={s.text}>
						<h1 className={s.title}>{t('title')}</h1>
						<p className={s.descr}>{t('description')}</p>
					</div>
				</div>
			</div>

			<div className={s.bottom}>
				<div className={s.bottomContent}>
					<div className={s.arrow}>
						<p dangerouslySetInnerHTML={{ __html: t('disclaimer') }} />
						<Image
							src={arrow}
							alt="arrow"
							color={'#fff'}
							width={30}
							height={30}
						/>
					</div>
					<Link
						href={'tel:+5510'}
						className={s.phone}>
						<Image
							src={mainBgPhone}
							alt="phone"
						/>
					</Link>
					<div className={s.bottomText}>
						<p className={s.number}>5510</p>
						<p className={s.bottomDescr}>{t('freeCalls')}</p>
					</div>
				</div>
			</div>
		</section>
	)
}
