import React from 'react'
import clsx from 'clsx'
import type { UrlObject } from 'url'

import { Link } from '@/i18n'

import s from './AppLink.module.scss'

type AppLinkVariant = 'primary' | 'secondary' | 'danger' | 'clear' | 'border' | 'border-white'
type AppLinkSize = 'sm' | 'md' | 'lg' | 'full' | 'auto'

type AppLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
	href: string | UrlObject
	className?: string
	children: React.ReactNode
	variant?: AppLinkVariant
	size?: AppLinkSize
}

export const AppLink: React.FC<AppLinkProps> = ({
	href,
	className,
	children,
	variant = 'primary',
	size = 'lg',
	...props
}) => {
	return (
		<Link
			href={href}
			className={clsx(s.link, s[variant], s[size], className)}
			{...props}>
			{children}
		</Link>
	)
}
