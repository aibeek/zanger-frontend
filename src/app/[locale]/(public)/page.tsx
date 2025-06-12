import { useTranslations } from 'next-intl'

import { BenefitShowcase, CardsSection, DownloadAppSection, FaqSection, MainSection } from '@/widgets/MainPage'

import s from './page.module.scss'
import { useAppContentData } from '@/shared/lib'

export default function Home() {
	const t = useTranslations('lending')
	const { clientsValueCards, advantageData, specialistsValueCards, valueData } = useAppContentData()

	return (
		<div className={s.page}>
	
			<MainSection />
			<CardsSection
				title={t('cardsSection.clientsTitle')}
				data={clientsValueCards}
				id="clients"
			/>
			<BenefitShowcase
				title={t('benefitShowcase.commonTitle')}
				descr={t('benefitShowcase.description')}
				content={advantageData}
			/>
			<CardsSection
				title={t('cardsSection.lawyersTitle')}
				data={specialistsValueCards}
				id="lawyers"
			/>
			<BenefitShowcase
				title={t('benefitShowcase.lawyersTitle')}
				descr={t('benefitShowcase.description')}
				content={valueData}
			/>
			<FaqSection id="faq" />
			<DownloadAppSection />
		</div>
	)
}
