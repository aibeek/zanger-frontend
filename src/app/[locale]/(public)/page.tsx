import { DescriptionSection, DownloadAppSection, MainSection, TeamSection } from '@/widgets/MainPage'
import { ChatBot } from '@/widgets/ChatBot'

import s from './page.module.scss'

export default function Home() {
	return (
		<div className={s.page}>
			<MainSection />
			<DescriptionSection />
			<TeamSection />
			<DownloadAppSection />
			<ChatBot />
		</div>
	)
}
