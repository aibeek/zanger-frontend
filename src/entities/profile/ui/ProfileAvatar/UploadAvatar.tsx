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
	currentAvatarUrl?: string
}

export const UploadAvatar: React.FC<UploadAvatarProps> = ({ onClose, currentAvatarUrl }) => {
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

	const handleDownloadAvatar = async () => {
		if (!currentAvatarUrl) return

		try {
			// Сначала попробуем прямую ссылку (если это data URL или blob URL)
			if (currentAvatarUrl.startsWith('data:') || currentAvatarUrl.startsWith('blob:')) {
				const link = document.createElement('a')
				link.href = currentAvatarUrl
				link.download = `avatar-${Date.now()}.jpg`
				document.body.appendChild(link)
				link.click()
				document.body.removeChild(link)
				message.success(t('downloadSuccess'))
				return
			}

			// Для обычных HTTP URL используем fetch с дополнительными опциями
			const response = await fetch(currentAvatarUrl, {
				method: 'GET',
				mode: 'cors',
				credentials: 'same-origin',
				headers: {
					'Accept': 'image/*',
				},
			})

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`)
			}

			const blob = await response.blob()
			const url = window.URL.createObjectURL(blob)
			const link = document.createElement('a')
			link.href = url
			link.download = `avatar-${Date.now()}.jpg`
			document.body.appendChild(link)
			link.click()
			document.body.removeChild(link)
			window.URL.revokeObjectURL(url)
			message.success(t('downloadSuccess'))
		} catch (error) {
			console.error('Error downloading avatar:', error)
			
			// Fallback: попробуем открыть изображение в новой вкладке
			try {
				const link = document.createElement('a')
				link.href = currentAvatarUrl
				link.target = '_blank'
				link.rel = 'noopener noreferrer'
				document.body.appendChild(link)
				link.click()
				document.body.removeChild(link)
				message.info(t('downloadFallback') || 'Изображение открыто в новой вкладке. Сохраните его вручную.')
			} catch (fallbackError) {
				console.error('Fallback download failed:', fallbackError)
				message.error(t('downloadError'))
			}
		}
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
				{currentAvatarUrl && (
					<Button
						variant="secondary"
						className={s.btn}
						onClick={handleDownloadAvatar}>
						{t('downloadCurrent')}
					</Button>
				)}
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
