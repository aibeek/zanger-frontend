import useSWR from 'swr'

import { sharedApi, Tag, TagsResponse } from '@/shared/api'

const fetchTags = async (): Promise<Tag[]> => {
	// @ts-expect-error fix it
	const tags: TagsResponse = await sharedApi.getAllTags()
	// @ts-expect-error fix it
	return [...tags.data, { id: null, name: 'Другое' }]
}

export const useTags = () => {
	const { data, error, isLoading, mutate } = useSWR('tags', fetchTags)

	return {
		tags: data ?? [],
		loadingTags: isLoading,
		errorTags: error,
		mutateTags: mutate,
	}
}
