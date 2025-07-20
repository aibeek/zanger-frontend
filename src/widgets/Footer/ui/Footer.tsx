'use client'

import Image from 'next/image'

import tik_tok from '@/app/assets/icons/tik_tok.svg'
import phone from '@/app/assets/icons/phone.svg'
import letter from '@/app/assets/icons/letter.svg'
import facebook from '@/app/assets/icons/facebook.svg'
import appstore from '@/app/assets/icons/appstore.webp'
import location from '@/app/assets/icons/location.svg'
import telegram from '@/app/assets/icons/telegram.svg'
import instagram from '@/app/assets/icons/instagram.svg'
import googleplay from '@/app/assets/icons/googleplay.webp'
import card from '@/app/assets/icons/visa-mc.webp'
import s from './Footer.module.scss'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n'
import {
	canselSubscriptionKzURL,
	canselSubscriptionURL,
	paymentKzURL,
	paymentURL,
	policyKzURL,
	policyURL,
	termsKzURL,
	termsURL,
} from '@/shared/lib/consts/urls'
import { usePathname } from 'next/navigation'

interface Props {
	variant?: 'user-variant' | 'lending-variant'
	id?: string
}

export const Footer = ({ variant, id }: Props) => {
	const t = useTranslations('footer')
	const pathname = usePathname()

	const termsHref = pathname.includes('kz') ? termsKzURL : termsURL
	const canselSubscriptionHref = pathname.includes('kz') ? canselSubscriptionKzURL : canselSubscriptionURL
	const policyHref = pathname.includes('kz') ? policyKzURL : policyURL
	const paymentHref = pathname.includes('kz') ? paymentKzURL : paymentURL

	return variant === 'user-variant' ? (
		<footer
			id={id}
			className={s.footer}>
			<div className="container-big">
				<div className={s.inner}>
					<div className={s.left}>
						© {new Date().getFullYear()} Zanger. {t('copyright')}
					</div>

					<div className={s.right}>
						<Link
							target={'_blank'}
							href={policyHref}>
							{t('privacy')}
						</Link>
						<Link
							target={'_blank'}
							href={termsHref}>
							{t('offer')}
						</Link>
						<Link
							target={'_blank'}
							href={paymentHref}>
							{t('payment')}
						</Link>
						<Link
							target={'_blank'}
							href={canselSubscriptionHref}>
							{t('canselSubscription')}
						</Link>
					</div>
				</div>
			</div>
		</footer>
	) : (
		<footer
			id={id}
			className={s.lendingFooter}>
			<div className="container-middle">
				<div className={s.lengingInner}>
					<div className={s.lendingTop}>
						<Image
							src={'/logo.svg'}
							alt={'логотип'}
							width={56}
							height={66}
						/>
					</div>

					<div className={s.lendingMiddle}>
						<div className={s.lendingMiddleLeft}>
							<p
								className={s.text}
								dangerouslySetInnerHTML={{ __html: t('socials') }}
							/>
							<div className={s.socials}>
								<Link href={'/'}>
									<Image
										src={telegram}
										alt={'telegram'}
									/>
								</Link>
								<Link href={'/'}>
									<Image
										src={facebook}
										alt={'facebook'}
									/>
								</Link>
								<Link href={'/'}>
									<Image
										src={tik_tok}
										alt={'tik_tok'}
									/>
								</Link>
								<Link href={'/'}>
									<Image
										src={instagram}
										alt={'instagram'}
									/>
								</Link>
							</div>
							<div className={s.appBtns}>
								<Link href={'/'}>
									<Image
										src={appstore}
										alt={t('appstore')}
										width={180}
										height={52}
									/>
								</Link>
								<Link href={'/'}>
									<Image
										src={googleplay}
										alt={t('googleplay')}
										width={180}
										height={52}
									/>
								</Link>
							</div>
						</div>

						<div className={s.columnAddress}>
							<ul className={s.columnList}>
								<li className={s.columnItem}>{t('too')}</li>
								<li
									style={{ marginBottom: '10px' }}
									className={s.columnItem}>
									{t('bin')}
								</li>
								<h6
									style={{ marginBottom: '0' }}
									className={s.columnTitle}>
									{t('address')}
								</h6>

								<li className={s.columnItem}>
									<Image
										src={location}
										alt={'метка'}
									/>
									{t('location')}
								</li>
							</ul>
						</div>
						<div className={s.column}>
							<h6 className={s.columnTitle}>{t('support')}</h6>

							<ul className={s.columnList}>
								<li className={s.columnItem}>
									<Image
										src={phone}
										alt={'телефон'}
									/>
									<Link
										className={s.link}
										target={'_blank'}
										href={'https://api.whatsapp.com/send/?phone=77009375505'}>
										+7 700 937 55 05
									</Link>
								</li>
								<li className={s.columnItem}>
									<Image
										src={letter}
										alt={'письмо'}
									/>
									<Link
										className={s.link}
										href={'mailto:support@zanger-app.kz'}>
										support@zanger-app.kz
									</Link>
								</li>

								<li className={s.columnItem}>
									<Image
										width={71}
										height={46}
										src={card}
										alt={'карта'}
									/>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
			<div className={s.lendingBottom}>
				<div className="container-middle">
					<div className={s.lendingBottomInner}>
						<div className={s.lendingBottomLeft}>
							<p>
								© {new Date().getFullYear()} Zanger. {t('copyright')}
							</p>
						</div>
						<div className={s.lendingBottomRight}>
							<Link
								target={'_blank'}
								href={policyHref}>
								{t('privacy')}
							</Link>
							<Link
								target={'_blank'}
								href={termsHref}>
								{t('offer')}
							</Link>
							<Link
								target={'_blank'}
								href={paymentHref}>
								{t('payment')}
							</Link>
							<Link
								target={'_blank'}
								href={canselSubscriptionHref}>
								{t('canselSubscription')}
							</Link>
						</div>
					</div>
				</div>
			</div>
		</footer>
	)
}
