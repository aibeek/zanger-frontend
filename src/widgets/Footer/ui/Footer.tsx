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
			<div className={s.lendingMain}>
				{/* Contacts Section */}
				<div className={s.contactsSection}>
						<h3 className={s.sectionTitle}>{t('contacts')}</h3>
						<div className={s.contactItems}>
							<div className={s.contactItem}>
								<Image
									src={phone}
									alt={'phone'}
									width={20}
									height={20}
								/>
								<Link
									className={s.contactLink}
									target={'_blank'}
									href={'https://api.whatsapp.com/send/?phone=77009375505'}>
									+7 700 937 55 05
								</Link>
							</div>
							<div className={s.contactItem}>
								<Image
									src={letter}
									alt={'email'}
									width={20}
									height={20}
								/>	
								<Link
									className={s.contactLink}
									href={'mailto:support@zanger-app.kz'}>
									support@zanger-app.kz
								</Link>
							</div>
						</div>
						
						<div className={s.socialIcons}>
							<Link href={'https://t.me/zanger5510'}>
								<Image
									src={telegram}
									alt={'telegram'}
									width={32}
									height={32}
								/>
							</Link>
							<Link href={'https://api.whatsapp.com/send/?phone=77009375505'}>
								<Image
									src={phone}
									alt={'whatsapp'}
									width={32}
									height={32}
								/>
							</Link>
							<Link href={'https://www.instagram.com/zanger5510/'}>
								<Image
									src={instagram}
									alt={'instagram'}
									width={32}
									height={32}
								/>
							</Link>
							<Link href={'https://www.facebook.com/people/Zanger5510/61578403178388/'}>
								<Image
									src={facebook}
									alt={'facebook'}
									width={32}
									height={32}
								/>
							</Link>
						</div>
					</div>

				{/* Information Section */}
				<div className={s.infoSection}>
						<h3 className={s.sectionTitle}>{t('information')}</h3>
						<div className={s.infoLinks}>
							<Link
								target={'_blank'}
								href={policyHref}
								className={s.infoLink}>
								{t('privacy')}
							</Link>
							<Link
								target={'_blank'}
								href={termsHref}
								className={s.infoLink}>
								{t('offer')}
							</Link>
							<Link
								target={'_blank'}
								href={paymentHref}
								className={s.infoLink}>
								{t('payment')}
							</Link>
							<Link
								target={'_blank'}
								href={canselSubscriptionHref}
								className={s.infoLink}>
								{t('canselSubscription')}
							</Link>
						</div>
					</div>

				{/* Contact Form Section */}
				<div className={s.contactFormSection}>
						<div className={s.contactForm}>
							<h3 className={s.formTitle}>{t('questionsTitle')}</h3>
							<div className={s.formInputs}>
								<input
									type="text"
									placeholder={t('namePlaceholder')}
									className={s.formInput}
								/>
								<input
									type="tel"
									placeholder={t('phonePlaceholder')}
									className={s.formInput}
								/>
							</div>
						</div>
					</div>
				</div>
			
			<div className={s.lendingBottom}>
				<div className={s.lendingBottomInner}>
					<div className={s.lendingBottomLeft}>
						<p>
							© {new Date().getFullYear()} Zanger. {t('copyright')}
						</p>
						<p className={s.companyInfo}>
							{t('companyName')}
						</p>
					</div>
					<div className={s.lendingBottomRight}>
						<p className={s.addressInfo}>
							{t('address')} <br />
							{t('bin')}
						</p>
					</div>
				</div>
			</div>
		</footer>
	)
}
