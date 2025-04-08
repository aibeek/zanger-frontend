import Image from 'next/image'
import s from './Header.module.scss'

export const Header = ({ variant }: { variant: 'user-variant' | 'lendos-variant' | 'only-logo' }) => {
	if (variant === 'user-variant') {
		return (
			<header className={s.userHeader}>
				<div className="container">
					<div className={s.inner}>
						<div className={s.left}>
							<Image
								src="/logo.svg"
								alt="logo"
								width={100}
								height={20}
							/>
						</div>
						<div className={s.right}>Lang switcher</div>
					</div>
				</div>
			</header>
		)
	}

	if (variant === 'lendos-variant') {
		return (
			<header className={s.header}>
				<h1>lendos variant header</h1>
			</header>
		)
	}

	return (
		<header className={s.header}>
			<div className={s.onlyLogo}>
				<Image
					src="/logo.svg"
					alt="logo"
					width={100}
					height={20}
				/>
			</div>
		</header>
	)
}
