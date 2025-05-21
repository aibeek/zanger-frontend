'use client'

import Image from 'next/image'

import vk from '@/app/assets/icons/vk.svg'
import phone from '@/app/assets/icons/phone.svg'
import letter from '@/app/assets/icons/letter.svg'
import Logo from '@/app/assets/icons/footer-logo.svg'
import facebook from '@/app/assets/icons/facebook.svg'
import appstore from '@/app/assets/icons/appstore.webp'
import location from '@/app/assets/icons/location.svg'
import telegram from '@/app/assets/icons/telegram.svg'
import instagram from '@/app/assets/icons/instagram.svg'
import googleplay from '@/app/assets/icons/googleplay.webp'
import { scrollToSection, useAppContentData, useSectionScroll } from '@/shared/lib'

import s from './Footer.module.scss'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n'
import { policyURL, termsURL } from '@/shared/lib/consts/urls'

interface Props {
	variant?: 'user-variant' | 'lending-variant'
	id?: string
}

export const Footer = ({ variant, id }: Props) => {
	const { activeSection } = useSectionScroll()
	const { footerMenuData } = useAppContentData()
	const t = useTranslations('footer')
	const isActive = (link: string) => activeSection === link

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
							href={policyURL}>
							{t('privacy')}
						</Link>
						<Link
							target={'_blank'}
							href={termsURL}>
							{t('offer')}
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
							src={Logo}
							alt={'логотип'}
							width={96}
							height={18}
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
										alt={t('telegram')}
									/>
								</Link>
								<Link href={'/'}>
									<Image
										src={facebook}
										alt={t('facebook')}
									/>
								</Link>
								<Link href={'/'}>
									<Image
										src={vk}
										alt={t('vk')}
									/>
								</Link>
								<Link href={'/'}>
									<Image
										src={instagram}
										alt={t('instagram')}
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

						<div className={s.column}>
							<h6 className={s.columnTitle}>{t('address')}</h6>

							<ul className={s.columnList}>
								<li className={s.columnItem}>
									<Image
										src={location}
										alt={'метка'}
									/>
									{t('location')}
								</li>
								<li className={s.columnItem}>
									<Image
										src={phone}
										alt={'телефон'}
									/>
									<Link
										className={s.link}
										href={'tel:7770090000'}>
										+7 777 009 0000
									</Link>
								</li>
							</ul>
						</div>
						<div className={s.column}>
							<h6 className={s.columnTitle}>{t('nav')}</h6>

							<ul className={s.columnList}>
								{footerMenuData.map(({ name, link }) => (
									<li
										key={link}
										className={s.columnItem}>
										<Link
											href={link}
											onClick={(e) => {
												scrollToSection(e, link)
												document.body.click()
											}}
											className={`${s.link} ${isActive(link) ? s.active : ''}`}>
											{t(name)}
										</Link>
									</li>
								))}
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
										href={'https://api.whatsapp.com/send/?phone=77770090000'}>
										+7 777 009 0000
									</Link>
								</li>
								<li className={s.columnItem}>
									<Image
										src={letter}
										alt={'письмо'}
									/>
									<Link
										className={s.link}
										href={'mailto:zanger@info.com'}>
										zanger@info.com
									</Link>
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
								href={policyURL}>
								{t('privacy')}
							</Link>
							<Link
								target={'_blank'}
								href={termsURL}>
								{t('offer')}
							</Link>
						</div>
					</div>
				</div>
			</div>
		</footer>
	)
}
