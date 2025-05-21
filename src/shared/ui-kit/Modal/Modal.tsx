'use client'

import clsx from 'clsx'
import { ReactNode } from 'react'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'

import s from './Modal.module.scss'
import { Button } from '../Button'
import { XMarkIcon } from '@heroicons/react/20/solid'

type Props = {
	isOpen: boolean
	onClose: () => void
	title?: string
	children: ReactNode
	className?: string
	closeButton?: boolean
}

export const Modal = (props: Props) => {
	const { isOpen, onClose, title, children, className, closeButton = false } = props
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
					<div className={s.top}>
						{title && <DialogTitle className={s.title}>{title}</DialogTitle>}
						{closeButton && (
							<Button
								className={s.close}
								variant="clear"
								onClick={onClose}>
								<XMarkIcon
									width={24}
									height={24}
									color={'rgba(55, 55, 55, 1)'}
								/>
							</Button>
						)}
					</div>
					{children}
				</DialogPanel>
			</div>
		</Dialog>
	)
}
