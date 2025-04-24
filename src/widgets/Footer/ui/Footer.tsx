'use client'

import Link from 'next/link'
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
import { footerMenuData, scrollToSection } from '@/shared'
import googleplay from '@/app/assets/icons/googleplay.webp'
import { useSectionScroll } from '@/shared/lib/hooks/useSectionScroll'

import s from './Footer.module.scss'

interface Props {
	variant?: 'user-variant' | 'lending-variant'
	id?: string
}

export const Footer = ({ variant, id }: Props) => {
	const { activeSection } = useSectionScroll()

	const isActive = (link: string) => activeSection === link

	return variant === 'user-variant' ? (
		<footer
			id={id}
			className={s.footer}>
			<div className="container-big">
				<div className={s.inner}>
					<div className={s.left}>© {new Date().getFullYear()} Zanger. Все права защищены</div>
					<div className={s.right}>
						<Link
							target={'_blank'}
							href="/policy">
							Политика конфиденциальности
						</Link>
						<Link
							target={'_blank'}
							href="/rules">
							Публичная оферта
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
							<p className={s.text}>
								Будьте в курсе наших новостей
								<br /> в социальных сетях
							</p>
							<div className={s.socials}>
								<Link href={'/'}>
									<Image
										src={telegram}
										alt={'телеграм'}
									/>
								</Link>
								<Link href={'/'}>
									<Image
										src={facebook}
										alt={'фейсбук'}
									/>
								</Link>
								<Link href={'/'}>
									<Image
										src={vk}
										alt={'вконтакте'}
									/>
								</Link>
								<Link href={'/'}>
									<Image
										src={instagram}
										alt={'инстаграм'}
									/>
								</Link>
							</div>
							<div className={s.appBtns}>
								<Link href={'/'}>
									<Image
										src={appstore}
										alt={'эплстор'}
										width={180}
										height={52}
									/>
								</Link>
								<Link href={'/'}>
									<Image
										src={googleplay}
										alt={'гуглплей'}
										width={180}
										height={52}
									/>
								</Link>
							</div>
						</div>

						<div className={s.column}>
							<h6 className={s.columnTitle}>Адрес:</h6>

							<ul className={s.columnList}>
								<li className={s.columnItem}>
									<Image
										src={location}
										alt={'метка'}
									/>
									г. Алматы, ул Толе би 51
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
							<h6 className={s.columnTitle}>Навигация:</h6>

							<ul className={s.columnList}>
								{footerMenuData.map(({ name, link }) => (
									<li
										key={name}
										className={s.columnItem}>
										<Link
											href={link}
											onClick={(e) => {
												scrollToSection(e, link)
												document.body.click()
											}}
											className={`${s.link} ${isActive(link) ? s.active : ''}`}>
											{name}
										</Link>
									</li>
								))}
							</ul>
						</div>

						<div className={s.column}>
							<h6 className={s.columnTitle}>Служба поддержки:</h6>

							<ul className={s.columnList}>
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
							<p>© {new Date().getFullYear()} Zanger. Все права защищены</p>
						</div>
						<div className={s.lendingBottomRight}>
							<p>Политика конфиденциальности</p>
							<p>Публичная оферта</p>
						</div>
					</div>
				</div>
			</div>
		</footer>
	)
}
