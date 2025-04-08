import Link from 'next/link'
import s from './Footer.module.scss'

interface Props {
	variant: 'user-variant' | 'lendos-variant'
}

export const Footer = ({ variant }: Props) => {
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
		<footer className={s.footer}>
			<h1>lendos-variant</h1>
		</footer>
	)
}
