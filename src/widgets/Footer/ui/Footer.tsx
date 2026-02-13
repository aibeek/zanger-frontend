'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'

import tik_tok from '@/app/assets/icons/tik_tok.svg'
import phone from '@/app/assets/icons/phone.svg'
import letter from '@/app/assets/icons/letter.svg'
import facebook from '@/app/assets/icons/facebook.svg'
import location from '@/app/assets/icons/location.svg'
import telegram from '@/app/assets/icons/telegram.svg'
import instagram from '@/app/assets/icons/instagram.svg'
import whatsappBusiness from '@/app/assets/icons/whatsapp-business-white.svg'
import s from './Footer.module.scss'
import { Link } from '@/i18n'
import {
    canselSubscriptionKzURL,
    canselSubscriptionURL,
    policyNewKzURL,
    policyNewRuURL,
    termsNewKzURL,
    termsNewRuURL,
    paymentKzURL,
    paymentURL
} from '@/shared/lib/consts/urls'

interface FooterProps {
	id?: string
}

export const Footer = ({ id }: FooterProps) => {
	const t = useTranslations('footer')
	const pathname = usePathname()
	const isKz = pathname.includes('kz')

	const [contactForm, setContactForm] = useState({
		name: '',
		phone: ''
	})
	const [isSubmitting, setIsSubmitting] = useState(false)

    const paymentHref = isKz ? paymentKzURL : paymentURL
    const canselSubscriptionHref = isKz ? canselSubscriptionKzURL : canselSubscriptionURL

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target
		setContactForm(prev => ({
			...prev,
			[name]: value
		}))
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		// Logic to handle form submission
	}

	return (
		<footer id={id} className={s.lendingFooter}>
			<div className={s.lendingMain}>
				{/* Left Section: Logo & Nav */}
				<div className={s.leftSection}>
					<div className={s.logoText}>Zanger</div>
					<nav className={s.navLinks}>
						<button className={s.navLink}>{t('aboutUs')}</button>
						<button className={s.navLink}>{t('lawyers')}</button>
						<button className={s.navLink}>{t('modules')}</button>
						<button className={s.navLink}>{t('info')}</button>
						<button className={s.navLink}>{t('useful')}</button>
						<button className={s.navLink}>{t('news')}</button>
					</nav>
				</div>

				{/* Middle Section: Contacts */}
				<div className={s.contactsSection}>
					<h3 className={s.sectionTitle}>{t('contacts')}</h3>
					
					<div>
						<Link href="tel:+77009375505" className={s.contactPhone}>
							+7 700 937 55 05
						</Link>
						<p className={s.workHours}>Пн-Пт с 9:00 до 18:00</p>
					</div>

					<div>
						<Link href="mailto:support@zanger-app.kz" className={s.contactEmail}>
							support@zanger-app.kz
						</Link>
						<p className={s.helpText}>Напишите нам на почту для помощи</p>
					</div>

					<p className={s.addressText}>
						г. Алматы, ул.Брусиловского, д.159, блок 1, офис 5А
					</p>
					<p className={s.binText}>
						БИН 250140021849
					</p>

					<div className={s.socialIcons}>
						<Link href={'https://t.me/zanger5510'} target="_blank">
							<Image src={telegram} alt={'telegram'} width={20} height={20} />
						</Link>
						<Link href={'https://api.whatsapp.com/send/?phone=77009375505'} target="_blank">
							<Image src={phone} alt={'whatsapp'} width={20} height={20} />
						</Link>
						<Link href={'https://www.instagram.com/zanger5510/'} target="_blank">
							<Image src={instagram} alt={'instagram'} width={20} height={20} />
						</Link>
						<Link href={'https://www.facebook.com/'} target="_blank">
							<Image src={facebook} alt={'facebook'} width={20} height={20} />
						</Link>
					</div>
				</div>

				{/* Right Section: Contact Form */}
				<div className={s.contactFormSection}>
					<div className={s.contactForm}>
						<h3 className={s.formTitle}>Остались вопросы?</h3>
						<form onSubmit={handleSubmit}>
							<div className={s.formInputs}>
								<input
									type="text"
									name="name"
									value={contactForm.name}
									onChange={handleInputChange}
									placeholder="Имя"
									className={s.formInput}
								/>
								<input
									type="tel"
									name="phone"
									value={contactForm.phone}
									onChange={handleInputChange}
									placeholder="Номер телефона"
									className={s.formInput}
								/>
								<button type="submit" className={s.submitButton}>
									Оставить заявку
								</button>
							</div>
						</form>
					</div>
				</div>
			</div>

			{/* Bottom Bar */}
			<div className={s.footerBottom}>
				<div className={s.copyright}>
					<p>© 2025 Zanger. Все права защищены</p>
					<p>ТОО «Global Legal Technologies»</p>
				</div>
				<div className={s.bottomLinks}>
					<Link
						target={'_blank'}
						href={isKz ? policyNewKzURL : policyNewRuURL}
						className={s.bottomLink}
					>
						{t('privacy')}
					</Link>
					<Link
						target={'_blank'}
						href={isKz ? termsNewKzURL : termsNewRuURL}
						className={s.bottomLink}
					>
						{t('userAgreement')}
					</Link>
					<Link
						target={'_blank'}
						href={paymentHref}
						className={s.bottomLink}
					>
						{t('payment')}
					</Link>
					<Link
						target={'_blank'}
						href={canselSubscriptionHref}
						className={s.bottomLink}
					>
						{t('canselSubscription')}
					</Link>
				</div>
			</div>
		</footer>
	)
}
