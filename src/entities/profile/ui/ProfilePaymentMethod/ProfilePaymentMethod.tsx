'use client'

import { useTranslations } from 'next-intl'
import { useRef, useState, useEffect } from 'react'
import { RadioGroup } from '@headlessui/react'
import clsx from 'clsx'

import PaymentMethodIcon from '@/app/assets/icons/payment-method.svg'
import kaspiIcon from '@/app/assets/icons/kaspi.png'

import s from './ProfilePaymentMethod.module.scss'
import { ProfileTabWrapper } from '../ProfileTabWrapper'
import { useModal } from '@/shared/ui-kit'
// import { StripeWrapper } from '@/shared/ui-kit/StripeWrapper'
import { PlusIcon } from '@heroicons/react/20/solid'
import Image from 'next/image'

export const ProfilePaymentMethod = () => {
	const t = useTranslations('profile.payment_method')
	const disclosureBtnRef = useRef<HTMLButtonElement>(null)
	const { open, isOpen, close } = useModal()
	const [selected, setSelected] = useState<string | null>(null)

	useEffect(() => {
		if (selected === 'new') {
			open()
		}
	}, [selected, open])

	const OPTIONS = [
		{ value: 'saved', label: '4400 4301 1723 6460' },
		{ value: 'new', label: t('newCard') },
	]

	return (
		<ProfileTabWrapper
			title={t('title')}
			imgSrc={PaymentMethodIcon}
			imgAlt="payment"
			panel_title={t('panelTitle')}
			panel_descr={t('panelDescription')}
			ref={disclosureBtnRef}>
			<RadioGroup
				value={selected}
				onChange={setSelected}>
				<div className={s.radioGroup}>
					{OPTIONS.map((option) => (
						<RadioGroup.Option
							key={option.value}
							value={option.value}
							className={({ checked }) =>
								clsx(s.option, {
									[s.checked]: checked,
								})
							}>
							<>
								<div className={s.left}>
									<div className={`${option.value === 'new' ? s.cardBoxNew : s.cardBox}`}>
										{option.value === 'new' ? (
											<PlusIcon
												width={24}
												height={24}
												color={'rgba(2, 125, 255, 1)'}
											/>
										) : (
											<Image
												src={kaspiIcon}
												alt={'kaspi'}
												width={80}
												height={60}
											/>
										)}
									</div>
									<span>{option.label}</span>
								</div>
								<span className={s.circle} />
							</>
						</RadioGroup.Option>
					))}
				</div>
			</RadioGroup>
			{/* 
		 <StripeWrapper>
				<NewPaymentPopup
					isOpen={isOpen}
					close={close}
				/> 
			</StripeWrapper> */}
		</ProfileTabWrapper>
	)
}
