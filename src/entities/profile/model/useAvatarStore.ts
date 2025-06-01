import { create } from 'zustand'
import { profileApi, authApi } from '@/shared/api'
import { useLoginStore } from '@/features/auth'
import { UserProfile } from '@/shared/lib/types'
import toast from 'react-hot-toast'
import { mutate } from 'swr'
import { refreshUser } from '@/shared/lib/helpers/refreshUser'

interface UploadAvatarState {
	file: File | null
	avatarPreviewUrl: string | null
	isUploading: boolean
	uploadProgress: number
	setFile: (file: File) => void
	clearFile: () => void
	uploadAvatar: () => Promise<void>
}

export const useUploadAvatarStore = create<UploadAvatarState>((set, get) => ({
	file: null,
	avatarPreviewUrl: null,
	isUploading: false,
	uploadProgress: 0,

	setFile: (file) => {
		const previewUrl = URL.createObjectURL(file)
		set({ file, avatarPreviewUrl: previewUrl, uploadProgress: 33 })
	},

	clearFile: () => {
		set({ file: null, avatarPreviewUrl: null, uploadProgress: 0 })
	},

	uploadAvatar: async () => {
		const { file } = get()
		if (!file) {
			toast.error('Сначала выберите файл')
			return
		}

		const formData = new FormData()
		formData.append('file', file)
		formData.append('folder', 'profile')
		formData.append('type', 'images')

		try {
			set({ isUploading: true, uploadProgress: 50 })

			const response = await profileApi.setAvatar(formData)
			// @ts-expect-error fix it
			const uploadedUrl = response?.url

			if (!uploadedUrl) {
				throw new Error('URL отсутствует в ответе сервера')
			}

			await profileApi.updateAvatar({ icon: uploadedUrl })
			toast.success('Аватар успешно обновлён')

			await refreshUser()

			set({
				file: null,
				avatarPreviewUrl: null,
				isUploading: false,
				uploadProgress: 100,
			})
		} catch (error) {
			toast.error('Ошибка загрузки аватара')
			set({ isUploading: false, uploadProgress: 0 })
		}
	},
}))
