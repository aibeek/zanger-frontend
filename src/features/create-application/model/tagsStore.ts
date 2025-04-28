import { create } from 'zustand'

import { sharedApi, Tag, TagsResponse } from '@/shared'

interface TagsStore {
	tags: Tag[]
	loadingTags: boolean
	fetchTags: () => Promise<void>
}

export const useTagsStore = create<TagsStore>((set) => ({
	tags: [],
	loadingTags: false,

	fetchTags: async () => {
		set({ loadingTags: true })
		try {
			const tags: TagsResponse = (await sharedApi.getAllTags()) as any

			set({ tags: tags.data })
		} catch (error) {
			console.error('Ошибка при загрузке тэгов:', error)
		} finally {
			set({ loadingTags: false })
		}
	},
}))
