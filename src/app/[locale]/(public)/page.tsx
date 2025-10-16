import { DescriptionSection, MainSection, TeamSection, AboutSection, ModulesSection, ResourcesSection, NewsSection, ScrollTopButton } from '@/widgets/MainPage'
import { PulseChatWidget } from '@/widgets/PulseChatWidget'
import { Footer } from '@/widgets/Footer'
import s from './page.module.scss'
export default function Home() {
	return (
		<div className={s.page}>
				<MainSection />
				<ScrollTopButton />
				<AboutSection />
				<TeamSection />
				<DescriptionSection />
				<ModulesSection />
				<ResourcesSection />
				<NewsSection />
				<Footer />
				<PulseChatWidget />
		</div>
	)
}
