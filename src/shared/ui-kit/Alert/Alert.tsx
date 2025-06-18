'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import s from './Alert.module.scss'
import { XMarkIcon } from '@heroicons/react/20/solid'
import { Button } from '../Button'
import { AppLink } from '../AppLink'
import Image from 'next/image'

type Props = {
	icon: string
	title: string
	description: string
	link: {
		href: string
		label: string
	}
}

export const Alert = ({ icon, title, description, link }: Props) => {
	const [visible, setVisible] = useState(true)

	return (
		<AnimatePresence>
			{visible && (
				<motion.div
					className={s.alert}
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}>
					<div className={s.content}>
						<div className={s.left}>
							<Image
								className={s.icon}
								src={icon}
								alt="иконка"
								width={60}
								height={60}
							/>
						</div>
						<div className={s.right}>
							<div className={s.text}>
								<div className={s.title}>{title}</div>
								<div className={s.descr}>{description}</div>
								<AppLink
									style={{ fontSize: '14px' }}
									variant={'clear'}
									size={'auto'}
									className={s.link}
									href={link.href}>
									{link.label}
								</AppLink>
							</div>
						</div>
						<Button
							size="auto"
							variant="clear"
							className={s.close}
							onClick={() => setVisible(false)}>
							<XMarkIcon
								width={24}
								height={24}
								color="#373737"
							/>
						</Button>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	)
}
