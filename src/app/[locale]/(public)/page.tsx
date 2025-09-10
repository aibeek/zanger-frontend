import { DescriptionSection, MainSection, TeamSection, AboutSection, ModulesSection } from '@/widgets/MainPage'
import { ChatBot } from '@/widgets/ChatBot'
import { PulseChatWidget } from '@/widgets/PulseChatWidget'
import s from './page.module.scss'

export default function Home() {
	return (
		<div className={s.page}>
			<MainSection />
			<AboutSection />
			<TeamSection />
			<ModulesSection />
			<DescriptionSection />
			<PulseChatWidget />
		</div>
	)
}
