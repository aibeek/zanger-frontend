'use client'

import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { ReactNode } from 'react'
import s from './Modal.module.scss'
import clsx from 'clsx'

type Props = {
	isOpen: boolean
	onClose: () => void
	title?: string
	children: ReactNode
	className?: string
}

export const Modal = ({ isOpen, onClose, title, children, className }: Props) => {
	return (
		<Dialog
			open={isOpen}
			onClose={onClose}
			className="relative z-50">
			<div
				className={s.backdrop}
				aria-hidden="true"
			/>
			<div className={s.wrapper}>
				<DialogPanel className={clsx(s.panel, className)}>
					{title && <DialogTitle className={s.title}>{title}</DialogTitle>}
					{children}
				</DialogPanel>
			</div>
		</Dialog>
	)
}
