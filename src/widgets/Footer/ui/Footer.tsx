import Link from 'next/link'
import s from './Footer.module.scss'

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
			className={s.footer}>
			<h1>lending-variant</h1>
		</footer>
	)
}
