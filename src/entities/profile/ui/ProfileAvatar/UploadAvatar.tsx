'use client'

import React, { useState } from 'react'
import A4 from '@/app/assets/icons/a4.svg'
import { Upload, message } from 'antd'
import Image from 'next/image'
import { Button } from '@/shared/ui-kit'
import s from './UploadAvatar.module.scss'
import { useUploadAvatarStore } from '../../model'
import { useTranslations } from 'next-intl'

const { Dragger } = Upload

interface UploadAvatarProps {
	onClose?: () => void
}

export const UploadAvatar: React.FC<UploadAvatarProps> = ({ onClose }) => {
	const { setFile, avatarPreviewUrl, uploadAvatar, isUploading, clearFile, uploadProgress } = useUploadAvatarStore()
	const [showUploadUI, setShowUploadUI] = useState(false)
	const t = useTranslations('uploadAvatar')

	const handleBeforeUpload = (file: File) => {
		setFile(file)
		message.loading({ content: t('imageLoading'), key: 'upload-preview' })
		setShowUploadUI(true)
		return false
	}

	const handleUpload = async () => {
		await uploadAvatar(t)
		if (onClose) onClose()
	}

	return (
		<>
			{!avatarPreviewUrl && (
				<Dragger
					className={s.dragger}
					beforeUpload={handleBeforeUpload}
					multiple={false}
					showUploadList={false}>
					<div className={s.top}>
						<p className={s.icon}>
							<Image
								src={A4}
								alt="icon"
								width={50}
								height={60}
							/>
						</p>
						<p className={s.text}>{t('uploadPrompt')}</p>
					</div>
				</Dragger>
			)}

			{avatarPreviewUrl && (
				<div className={s.previewWrapper}>
					<div className={s.preview}>
						<Image
							src={avatarPreviewUrl}
							alt="Preview"
							width={150}
							height={150}
						/>
					</div>
				</div>
			)}

			{showUploadUI && (
				<Upload
					action=""
					listType="picture"
					fileList={[
						{
							uid: '0',
							name: 'avatar.png',
							status: isUploading ? 'uploading' : 'done',
							percent: uploadProgress,
							url: avatarPreviewUrl || undefined,
						},
					]}
					onRemove={() => {
						clearFile()
						setShowUploadUI(false)
					}}
					showUploadList={{ showRemoveIcon: true }}
				/>
			)}

			<div className={s.bottom}>
				<Button
					variant="primary"
					className={s.btn}
					disabled={!avatarPreviewUrl || isUploading}
					onClick={handleUpload}>
					{isUploading ? t('loading') : t('submit')}
				</Button>
			</div>
		</>
	)
}
