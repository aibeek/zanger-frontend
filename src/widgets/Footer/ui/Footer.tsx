'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'

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
import whatsappBusiness from '@/app/assets/icons/whatsapp-business-white.svg'
import s from './Footer.module.scss'
import { Link } from '@/i18n'
import {
	canselSubscriptionKzURL,
	canselSubscriptionURL,
	policyKzURL,
	policyURL,
	termsKzURL,
	termsURL,
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

	// Contact form state
	const [contactForm, setContactForm] = useState({
		name: '',
		phone: ''
	})
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [submitMessage, setSubmitMessage] = useState('')
	const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')

	// Conditional URLs based on locale
	const policyHref = isKz ? policyKzURL : policyURL
	const termsHref = isKz ? termsKzURL : termsURL
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
		
		if (!contactForm.name.trim() || !contactForm.phone.trim()) {
			setSubmitMessage(t('requiredFields'))
			setMessageType('error')
			return
		}

		setIsSubmitting(true)
		setSubmitMessage('')
		setMessageType('')

		try {
			// Здесь будет реальная отправка формы
			// Пока что имитируем успешную отправку
			await new Promise(resolve => setTimeout(resolve, 1000))
			
			setSubmitMessage(t('successMessage'))
			setMessageType('success')
			setContactForm({ name: '', phone: '' })
		} catch (error) {
			setSubmitMessage(t('errorMessage'))
			setMessageType('error')
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
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
								+7 701 188 55 10
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
								href={'mailto:info@zanger-app.kz'}>
								info@zanger-app.kz
							</Link>
						</div>
					</div>
					
					<div className={s.socialIcons}>
						<Link href={'https://t.me/zanger5510'} target="_blank">
							<Image
								src={telegram}
								alt={'telegram'}
								width={32}
								height={32}
							/>
						</Link>
						<Link href={'https://api.whatsapp.com/send/?phone=77009375505'} target="_blank">
							<Image
								src={phone}
								alt={'whatsapp'}
								width={32}
								height={32}
							/>
						</Link>
						<Link href={'https://whatsapp.com/channel/0029VbBTmLNDzgTGrhXADy3b'} target="_blank">
							<Image
								src={whatsappBusiness}
								alt={'whatsapp channel'}
								width={64}
								height={64}
							/>
						</Link>
						<Link href={'https://www.instagram.com/zanger5510/'} target="_blank">
							<Image
								src={instagram}
								alt={'instagram'}
								width={32}
								height={32}
							/>
						</Link>
						<Link href={'https://www.facebook.com/people/%D0%AE%D1%80%D0%B8%D0%B4%D0%B8%D1%87%D0%B5%D1%81%D0%BA%D0%B0%D1%8F-%D0%BF%D0%BB%D0%B0%D1%82%D1%84%D0%BE%D1%80%D0%BC%D0%B0-Zanger/61579191275968/'} target="_blank">
							<Image
								src={facebook}
								alt={'facebook'}
								width={32}
								height={32}
							/>
						</Link>
					</div>

					{/* Address under social icons */}
					<div className={s.addressBlock}>
						<p className={s.addressText}>
							{t('address')} {t('location')}
						</p>
						<p className={s.binText}>
							{t('bin')}
						</p>
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
						<form onSubmit={handleSubmit}>
							<div className={s.formInputs}>
								<input
									type="text"
									name="name"
									value={contactForm.name}
									onChange={handleInputChange}
									placeholder={t('namePlaceholder')}
									className={s.formInput}
									disabled={isSubmitting}
								/>
								<input
									type="tel"
									name="phone"
									value={contactForm.phone}
									onChange={handleInputChange}
									placeholder={t('phonePlaceholder')}
									className={s.formInput}
									disabled={isSubmitting}
								/>
								<button
									type="submit"
									className={s.submitButton}
									disabled={isSubmitting}>
									{isSubmitting ? t('sending') : t('sendButton')}
								</button>
							</div>
							{submitMessage && (
								<div className={`${s.submitMessage} ${messageType ? s[messageType] : ''}`}>
									{submitMessage}
								</div>
							)}
						</form>
					</div>
				</div>
				{/* Unified Bottom Section (merged) */}
				<div className={s.footerBottom}>
					<div className={s.lendingBottomLeft}>
						<p>
							© {new Date().getFullYear()} Zanger. {t('copyright')}
						</p>
						<p className={s.companyInfo}>
							{t('companyName')}
						</p>
					</div>
				</div>
			</div>
		</footer>
	)
}
