'use client'

import useSWR from 'swr'

import { sharedApi, Tag, TagsResponse } from '@/shared/api'

const fetchTags = async (): Promise<(Tag | { id: null; name: string })[]> => {
	const tags = await sharedApi.getAllTags()
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
