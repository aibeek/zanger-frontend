import { useTranslations } from 'next-intl'

export type ContentDataItem = {
	left: {
		text: string[]
	}
	right: {
		text: string[]
	}
}

export const useAppContentData = (): { descriptionData: ContentDataItem[] } => {
	const t = useTranslations('lending.descriptionSection')

	const leftTexts = t.raw('left.items') as string[]
	const rightTexts = t.raw('right.items') as string[]

	const descriptionData: ContentDataItem[] = [
		{
			left: {
				text: leftTexts,
			},
			right: {
				text: rightTexts,
			},
		},
	]

	return {
		descriptionData,
	}
}
