import { create } from 'zustand'
import { profileApi } from '@/shared/api'
import toast from 'react-hot-toast'
import { refreshUser } from '@/shared/lib/helpers/refreshUser'

interface UploadAvatarState {
	file: File | null
	avatarPreviewUrl: string | null
	isUploading: boolean
	uploadProgress: number
	setFile: (file: File) => void
	clearFile: () => void
	uploadAvatar: (t: (key: string) => string) => Promise<void>
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

	uploadAvatar: async (t) => {
		const { file } = get()
		if (!file) {
			toast.error(t('noFileSelected'))
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
			toast.success(t('success'))

			await refreshUser()

			set({
				file: null,
				avatarPreviewUrl: null,
				isUploading: false,
				uploadProgress: 100,
			})
		} catch (error) {
			toast.error(t('error'))
			set({ isUploading: false, uploadProgress: 0 })
		}
	},
}))
