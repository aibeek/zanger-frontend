'use client'

import Image from 'next/image'

import edit from '@/app/assets/icons/avatar-edit.svg'
import { Button, Modal, useModal } from '@/shared/ui-kit'
import avatar from '@/app/assets/icons/avatar-default.svg'

import s from './Avatar.module.scss'

export const Avatar = () => {
	const { open, close, isOpen } = useModal()

	return (
		<>
			<div className={s.avatar}>
				<Image
					src={avatar}
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
				title="Сменить аватар">
				{/* <p className={s.modalDescr}>В</p> */}
				<div className={s.modalBtns}>
					<Button
						variant="border"
						onClick={close}>
						Отмена
					</Button>
					<Button
						variant="primary"
						onClick={close}>
						Сохранить
					</Button>
				</div>
			</Modal>
		</>
	)
}
