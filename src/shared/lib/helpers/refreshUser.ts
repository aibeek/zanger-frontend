import { mutate as mutateSWR } from 'swr'
import toast from 'react-hot-toast'

import { authApi } from '@/shared/api'
import { useLoginStore } from '@/features/auth'

import { UserProfile } from '../types'

export const refreshUser = async (): Promise<UserProfile | null> => {
	try {
		const updatedPersonalData = (await authApi.me()) as UserProfile

		useLoginStore.setState({ personalData: updatedPersonalData })
		localStorage.removeItem('personalData')
		const fresh = await authApi.me()
		localStorage.setItem('personalData', JSON.stringify(fresh))
		mutateSWR('/auth/me')

		return updatedPersonalData
	} catch (error) {
		toast.error('Ошибка при обновлении профиля пользователя', error)
		return null
	}
}
