import Link from 'next/link'
import s from './Footer.module.scss'
import Logo from '@/app/assets/icons/footer-logo.svg'
import Image from 'next/image'

interface Props {
	variant?: 'user-variant' | 'lending-variant'
	id?: string
}

export const Footer = ({ variant, id }: Props) => {
	return variant === 'user-variant' ? (
		<footer className={s.footer}>
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

					<div className={s.lendingMiddle}></div>
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
