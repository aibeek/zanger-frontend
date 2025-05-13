import { ReactNode } from 'react'
import s from './DescriptionText.module.scss'

interface Props {
	children: ReactNode
	className?: string
}

export const DescriptionText = ({ children, className = '' }: Props) => {
	return <p className={`${s.descr} ${className}`}>{children}</p>
}
