import { StaticImageData } from 'next/image'

import book from '@/app/assets/icons/book.webp'
import bank from '@/app/assets/icons/bank.webp'
import gavel from '@/app/assets/icons/gavel.webp'
import safe from '@/app/assets/icons/safe.webp'
import folder from '@/app/assets/icons/folder.webp'
import chart from '@/app/assets/icons/chart.webp'
import iphone1 from '@/app/assets/images/iphone-1.webp'
import iphone2 from '@/app/assets/images/iphone-2.webp'
import iphone3 from '@/app/assets/images/iphone-3.webp'
import iphone4 from '@/app/assets/images/iphone-4.webp'
import { useTranslations } from 'next-intl'

export type ContentDataItem = {
	top?: Content
	bottom?: Content
}

export type Content = {
	imageUrl: StaticImageData
	title: string
	descr: string
	bgColor: string
	faq: {
		question: string
		icon: string
		answer: string
	}[]
}

export type FaqItem = {
	question: string
	answer: string
}

export type FaqCategory = {
	name: string
	faq: FaqItem[]
}

export const useAppContentData = () => {
	const t = useTranslations('lending')

	const client = t.raw('client') as { name: string; faq: { question: string; answer: string }[] }
	const lawyer = t.raw('lawyer') as { name: string; faq: { question: string; answer: string }[] }

	const clientsValueCards = [
		{
			imgUrl: bank,
			title: t('cardsSection.clientsValueCards.card1.title'),
			descr: t('cardsSection.clientsValueCards.card1.descr'),
		},
		{
			imgUrl: book,
			title: t('cardsSection.clientsValueCards.card2.title'),
			descr: t('cardsSection.clientsValueCards.card2.descr'),
		},
		{
			imgUrl: gavel,
			title: t('cardsSection.clientsValueCards.card3.title'),
			descr: t('cardsSection.clientsValueCards.card3.descr'),
		},
	]
	const specialistsValueCards = [
		{
			imgUrl: safe,
			title: t('cardsSection.specialistsValueCards.card1.title'),
			descr: t('cardsSection.specialistsValueCards.card1.descr'),
		},
		{
			imgUrl: folder,
			title: t('cardsSection.specialistsValueCards.card2.title'),
			descr: t('cardsSection.specialistsValueCards.card2.descr'),
		},
		{
			imgUrl: chart,
			title: t('cardsSection.specialistsValueCards.card3.title'),
			descr: t('cardsSection.specialistsValueCards.card3.descr'),
		},
	]

	const advantageData: ContentDataItem[] = [
		{
			top: {
				title: 'title',
				descr: 'descr',
				faq: [
					{
						icon: 'hourglass',
						question: 'Что такое “Вид услуги”',
						answer: 'Если вы войдёте в мой профиль...',
					},
					{
						icon: 'document',
						question: 'Как корректно сформулировать проблему/ задачу?',
						answer: 'Если вы войдёте в мой профиль...',
					},
					{
						icon: 'people',
						question: 'Как обратиться в службу поддержки?',
						answer: 'Если вы войдёте в мой профиль...',
					},
				],
				bgColor: 'rgba(209, 192, 241, 1)',
				imageUrl: iphone1,
			},
		},
		{
			bottom: {
				title: 'title',
				descr: 'descr',
				faq: [
					{
						icon: 'people',
						question: 'Как принимать отклики от юристов',
						answer: 'Если вы войдёте в мой профиль...',
					},
					{
						icon: 'hourglass',
						question: 'Как можно отозвать отзыв ?',
						answer: 'Если вы войдёте в мой профиль...',
					},
					{
						icon: 'document',
						question: 'Возможно ли нанять нескольких юристов одновременно?',
						answer: 'Если вы войдёте в мой профиль...',
					},
				],
				bgColor: 'rgba(167, 228, 248, 1)',
				imageUrl: iphone2,
			},
		},
	]

	const valueData: ContentDataItem[] = [
		{
			top: {
				title: 'Принимайте вопросы от настоящих клиентов о законах',
				descr: 'Принимайте заявки, отвечайте на них и получайте доход, предоставляя консультации клиентам',
				faq: [
					{
						icon: 'hourglass',
						question: 'Как посмотреть заявку?',
						answer: 'Если вы войдёте в мой профиль...',
					},
					{
						icon: 'document',
						question: 'Как связаться с клиентом и задать вопрос?',
						answer: 'Если вы войдёте в мой профиль...',
					},
					{
						icon: 'people',
						question: 'Как обратиться в службу поддержки?',
						answer: 'Если вы войдёте в мой профиль...',
					},
				],
				bgColor: 'rgba(167, 228, 248, 1)',
				imageUrl: iphone3,
			},
		},
		{
			bottom: {
				title: 'Управляйте заявками',
				descr: 'Вы можете отслеживать статус заявок: какие из них были одобрены, а какие отклонены.',
				faq: [
					{ icon: 'people', question: 'Как закрыть заявку от клиента?', answer: 'В случае если...' },
					{
						icon: 'hourglass',
						question: 'Что означают статусы?',
						answer: 'Если вы войдёте в мой профиль...',
					},
					{
						icon: 'document',
						question: 'Есть ли возможность ответить на несколько заявок?',
						answer: 'Если вы войдёте в мой профиль...',
					},
				],
				bgColor: 'rgba(209, 192, 241, 1)',
				imageUrl: iphone4,
			},
		},
	]

	const faqData: FaqCategory[] = [
		{ name: client.name, faq: client.faq },
		{ name: lawyer.name, faq: lawyer.faq },
	]

	const lawyerFaqData: FaqCategory[] = [{ name: lawyer.name, faq: lawyer.faq }]

	const headerMenuData = [
		{ name: 'main', link: '/' },
		{ name: 'clients', link: '#clients' },
		{ name: 'lawyers', link: '#lawyers' },
		{ name: 'faq', link: '#faq' },
		{ name: 'contacts', link: '#footer' },
	]

	const footerMenuData = [
		{ name: 'clients', link: '#clients' },
		{ name: 'lawyers', link: '#lawyers' },
		{ name: 'faq', link: '#faq' },
	]

	return {
		clientsValueCards,
		specialistsValueCards,
		advantageData,
		valueData,
		faqData,
		headerMenuData,
		footerMenuData,
		lawyerFaqData,
	}
}
