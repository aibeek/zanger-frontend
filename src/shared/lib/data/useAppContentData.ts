import { useTranslations } from 'next-intl'

export type ContentDataItem = {
	left: {
		text: string[]
	}
	right: {
		text: string[]
	}
}

export const useAppContentData = () => {
	const t = useTranslations('lending.descriptionSection')

	const lawyer = t.raw('lawyer') as { name: string; faq: { question: string; answer: string }[] }

	const lawyerFaqData: any[] = [{ name: lawyer.name, faq: lawyer.faq }]

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
		lawyerFaqData,
	}
}
