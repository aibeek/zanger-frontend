import { lawyerApi } from '@/shared/api'
import useSWR from 'swr'

export const useMyCards = () => {
	return useSWR('my-cards', async () => {
		const response = await lawyerApi.getMyCards()

		// @ts-expect-error fix it
		return response.data
	})
}
