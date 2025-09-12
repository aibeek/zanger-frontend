'use client'

import Image from 'next/image'
import avatar from '@/app/assets/icons/avatar-default.svg'

import { Modal, useModal } from '@/shared/ui-kit'
import { UploadAvatar } from './UploadAvatar'
import s from './ProfileAvatar.module.scss'
import { useTranslations } from 'next-intl'

export const ProfileAvatar = ({ avatarUrl }: { avatarUrl: string }) => {
	const { open, close, isOpen } = useModal()
	const t = useTranslations('uploadAvatar')

	return (
		<>
			<div className={s.avatar} onClick={open} style={{ cursor: 'pointer' }}>
				<Image
					style={{ borderRadius: '10px', objectFit: 'cover' }}
					src={avatarUrl || avatar}
					alt={t('avatarAlt')}
					width={80}
					height={80}
				/>
			</div>

			<Modal
				className={s.modal}
				isOpen={isOpen}
				onClose={close}
				closeButton={true}
				title={t('modalTitle')}>
				<UploadAvatar onClose={close} currentAvatarUrl={avatarUrl} />
			</Modal>
		</>
	)
}
