import useSWR from 'swr'
import { sharedApi, Tag } from '@/shared/api'

// @ts-expect-error fix it
const fetcher = () => sharedApi.getLawyerTypes().then((res) => res.data)

export const useProfileStatuses = () => {
	const { data, error, isLoading, mutate } = useSWR<Tag[]>('lawyerTypes', fetcher)

	return {
		statuses: data ?? [],
		loading: isLoading,
		error,
		refetch: mutate,
	}
}
