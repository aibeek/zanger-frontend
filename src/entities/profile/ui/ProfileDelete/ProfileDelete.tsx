'use client'

import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { authService } from '@/features/auth'
import { Button, Modal, useModal } from '@/shared/ui-kit'
import { Disclosure, DisclosureButton } from '@headlessui/react'

import s from './ProfileDelete.module.scss'
import { useDeleteAccountStore } from '../../model/useDeleteAccountStore'

export const ProfileDelete = () => {
	const { isOpen, close, open } = useModal()
	const { submit, isSubmitting } = useDeleteAccountStore()
	const router = useRouter()
	const t = useTranslations('profile.delete_account')

	const handleDelete = async () => {
		const success = await submit()
		if (success) {
			authService.logout()
			router.push('/auth/register/select-role')
		}
	}

	return (
		<>
			<Disclosure>
				<div className={s.accordion}>
					<DisclosureButton
						onClick={open}
						style={{ color: 'rgba(255, 101, 101, 1)' }}
						className={s.btn}>
						{t('button')}
					</DisclosureButton>
				</div>
			</Disclosure>

			<Modal
				className={s.modal}
				isOpen={isOpen}
				onClose={close}
				title={t('modalTitle')}>
				<p
					className={s.modalDescr}
					dangerouslySetInnerHTML={{ __html: t('modalDescription') }}
				/>
				<div className={s.modalBtns}>
					<Button
						variant="border"
						onClick={close}>
						{t('cancel')}
					</Button>
					<Button
						variant="danger"
						onClick={handleDelete}
						disabled={isSubmitting}>
						{t('confirm')}
					</Button>
				</div>
			</Modal>
		</>
	)
}
