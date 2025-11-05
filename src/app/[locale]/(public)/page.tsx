import { DescriptionSection, MainSection, TeamSection, AboutSection, ModulesSection, ResourcesSection, NewsSection, ScrollTopButton } from '@/widgets/MainPage'
import { PulseChatWidget } from '@/widgets/PulseChatWidget'
import { LocalVideoSection } from '@/widgets/MainPage/LocalVideoSection'
import { Footer } from '@/widgets/Footer'
import { WhatsAppFloat } from '@/widgets/WhatsAppFloat'
import { getTranslations } from 'next-intl/server'
import s from './page.module.scss'
export default async function Home() {
	const t = await getTranslations('lending.videoSection')
	return (
		<div className={s.page}>
				<MainSection />
			<NewsSection />
			<LocalVideoSection
				videos={[
					{
						src: '/assets/images/erzhan.mp4',
						description: t('captions.erzhan'),
					},
					{
						src: '/assets/images/vodeozanger.mp4',
						description: t('captions.v1'),
					},
					{
						src: '/assets/images/insta.mp4',
						description: t('captions.v2'),
					},
					{
						src: '/assets/images/insta2.mp4',
						description: t('captions.v3'),
					},
				]}
			/>
				<ScrollTopButton />
				<AboutSection />
				<TeamSection />
				<DescriptionSection />
			<ModulesSection />
			<ResourcesSection />
			<Footer />
			<WhatsAppFloat />
			{/* <PulseChatWidget /> */}
	</div>
	)
}