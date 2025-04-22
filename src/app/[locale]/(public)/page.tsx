import { FaqSection } from '@/widgets/MainPage/FaqSection'
import { MainSection } from '@/widgets/MainPage/MainSection'
import { CardsSection } from '@/widgets/MainPage/CardsSection'
import { BenefitShowcase } from '@/widgets/MainPage/BenefitShowcase'
import { DownloadAppSection } from '@/widgets/MainPage/DownloadAppSection'
import { advantageData, clientsValueCards, specialistsValueCards, valueData } from '@/shared/lib/data'

import s from './page.module.scss'

export default function Home() {
	return (
		<div className={s.page}>
			<MainSection />
			<CardsSection
				title="Зачем нашим клиентам приложение ZANGER"
				data={clientsValueCards}
				id="clients"
			/>
			<BenefitShowcase
				title="В чём преимущество этого приложения?"
				descr="Вы и представить себе не можете, сколько у нас преимуществ! Просто оставьте заявку, а мы, наши эксперты, поможем вам с решением"
				content={advantageData}
			/>
			<CardsSection
				title="Для специалистов в области юриспруденции"
				data={specialistsValueCards}
				id="lawyers"
			/>
			<BenefitShowcase
				title="В чём польза этого приложения для юристов?"
				descr="Вы и представить себе не можете, сколько у нас преимуществ! Просто оставьте заявку, а мы, наши эксперты, поможем вам с решением"
				content={valueData}
			/>
			<FaqSection id={'faq'} />
			<DownloadAppSection />
		</div>
	)
}
