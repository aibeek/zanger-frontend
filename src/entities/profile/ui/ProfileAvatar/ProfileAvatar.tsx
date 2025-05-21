'use client'

import Image from 'next/image'

import edit from '@/app/assets/icons/avatar-edit.svg'
import { Button, Modal, useModal } from '@/shared/ui-kit'
import avatar from '@/app/assets/icons/avatar-default.svg'

import s from './ProfileAvatar.module.scss'
import { UploadAvatar } from './UploadAvatar'

export const ProfileAvatar = ({ avatarUrl }: { avatarUrl: string }) => {
	const { open, close, isOpen } = useModal()

	return (
		<>
			<div className={s.avatar}>
				<Image
					style={{ borderRadius: '10px', objectFit: 'cover' }}
					src={avatarUrl || avatar}
					alt="аватар"
					width={80}
					height={80}
				/>
				<Button
					onClick={open}
					style={{ padding: '0px' }}
					variant={'clear'}
					className={s.editBtn}>
					<Image
						src={edit}
						alt="редактировать"
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
				title="Загрузить изображение">
				<UploadAvatar onClose={close} />
			</Modal>
		</>
	)
}
