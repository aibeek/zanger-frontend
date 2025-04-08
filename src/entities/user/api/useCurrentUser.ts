import useSWR from 'swr'

import { baseApiURI } from '@/shared/lib/consts'
import { useUserStore } from '../model/useUserStore'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export const useCurrentUser = () => {
	const { data, error } = useSWR(`${baseApiURI}/me`, fetcher)
	const setUser = useUserStore((state) => state.setUser)

	if (data) {
		setUser(data)
	}

	return {
		user: data,
		isLoading: !data && !error,
		isError: !!error,
	}
}
