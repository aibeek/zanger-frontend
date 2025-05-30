import { mutate } from 'swr'
import toast from 'react-hot-toast'

import { authApi } from '@/shared/api'
import { useLoginStore } from '@/features/auth'

import { UserProfile } from '../types'

export const refreshUser = async (): Promise<UserProfile | null> => {
	try {
		const updatedPersonalData = (await authApi.me()) as UserProfile

		useLoginStore.setState({ personalData: updatedPersonalData })
		localStorage.setItem('personalData', JSON.stringify(updatedPersonalData))

		mutate('/auth/me')

		return updatedPersonalData
	} catch (error) {
		toast.error('Ошибка при обновлении профиля пользователя', error)
		return null
	}
}
