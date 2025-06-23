'use client'

import Image from 'next/image'
import edit from '@/app/assets/icons/avatar-edit.svg'
import avatar from '@/app/assets/icons/avatar-default.svg'

import { Button, Modal, useModal } from '@/shared/ui-kit'
import { UploadAvatar } from './UploadAvatar'
import s from './ProfileAvatar.module.scss'
import { useTranslations } from 'next-intl'

export const ProfileAvatar = ({ avatarUrl }: { avatarUrl: string }) => {
	const { open, close, isOpen } = useModal()
	const t = useTranslations('uploadAvatar')

	return (
		<>
			<div className={s.avatar}>
				<Image
					style={{ borderRadius: '10px', objectFit: 'cover' }}
					src={avatarUrl || avatar}
					alt={t('avatarAlt')}
					width={80}
					height={80}
				/>
				<Button
					onClick={open}
					style={{ padding: '0px' }}
					variant="clear"
					className={s.editBtn}>
					<Image
						src={edit}
						alt={t('editAlt')}
						width={30}
						height={30}
					/>
				</Button>
			</div>

			<Modal
				className={s.modal}
				isOpen={isOpen}
				onClose={close}
				closeButton={true}
				title={t('modalTitle')}>
				<UploadAvatar onClose={close} />
			</Modal>
		</>
	)
}
