'use client'

import { useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'

import PhoneIcon from '@/app/assets/icons/support-phone.svg'
import whatsapp from '@/app/assets/icons/whatsapp.svg'

import s from './ProfileSupport.module.scss'
import { ProfileTabWrapper } from '../ProfileTabWrapper'
import { useProfileSupport } from '../../model'
import { AppLink } from '@/shared/ui-kit/AppLink'
import Image from 'next/image'

export const ProfileSupport = () => {
	const disclosureBtnRef = useRef<HTMLButtonElement>(null)
	const t = useTranslations()

	const { fetchSupportNumber, phone_number } = useProfileSupport()

	useEffect(() => {
		fetchSupportNumber()
	}, [])

	return (
		<ProfileTabWrapper
			title={t('profile.support.title')}
			imgSrc={PhoneIcon}
			imgAlt="PhoneIcon"
			panel_title={t('profile.support.panelTitle')}
			panel_descr={t('profile.support.panelDescription')}
			ref={disclosureBtnRef}>
			<div className={s.box}>
				<p className={s.text}>{t('profile.support.text')}</p>

				<AppLink
					variant="clear"
					size="auto"
					href={`https://api.whatsapp.com/send/?phone=${phone_number}`}
					target={'_blank'}>
					<Image
						src={whatsapp}
						alt="whatsapp"
						width={30}
						height={30}
					/>
				</AppLink>
			</div>
		</ProfileTabWrapper>
	)
}
