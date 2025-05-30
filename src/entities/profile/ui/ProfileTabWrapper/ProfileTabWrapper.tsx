'use client'

import clsx from 'clsx'
import Image from 'next/image'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'

import s from './ProfileTabWrapper.module.scss'

type Props = {
	title: string
	imgSrc: string
	imgAlt: string
	panel_title?: string
	panel_descr?: string
	children: React.ReactNode
	ref?: any
	defaultOpen?: boolean
}

export const ProfileTabWrapper = (props: Props) => {
	const { title, imgSrc, imgAlt, panel_title, panel_descr, defaultOpen = false, children, ref } = props

	return (
		<Disclosure defaultOpen={defaultOpen}>
			{({ open }) => (
				<div className={s.accordion}>
					<DisclosureButton
						ref={ref}
						className={s.item}>
						{title}
						<ChevronDownIcon className={clsx(s.icon, open && s.rotate)} />
					</DisclosureButton>
					<DisclosurePanel className={s.panel}>
						<div className={s.titleBox}>
							<div className={s.titleIcon}>
								<Image
									src={imgSrc}
									alt={imgAlt}
									width={24}
									height={24}
								/>
							</div>
							<div className={s.titleWrapper}>
								<h4 className={s.panelTitle}>{panel_title}</h4>
								<p className={s.panelDescr}>{panel_descr}</p>
							</div>
						</div>

						{children}
					</DisclosurePanel>
				</div>
			)}
		</Disclosure>
	)
}
