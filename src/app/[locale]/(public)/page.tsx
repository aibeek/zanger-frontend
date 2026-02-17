import { DescriptionSection, MainSection, TeamSection, AboutSection, ModulesSection, ResourcesSection, NewsSection, ScrollTopButton } from '@/widgets/MainPage'
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
			<AboutSection />
			<TeamSection />
			<ModulesSection />
			<LocalVideoSection
				videos={[
					{
						src: '/assets/images/edo.mp4',
						description: t('captions.edo'),
					},
					{
						src: '/assets/images/youtube.mp4',
						description: t('captions.youtube'),
					},
					{
						src: '/assets/images/era.mp4',
						description: t('captions.era'),
					},
					{
						src: '/assets/images/narxoz.mp4',
						description: t('captions.narxoz'),
					},
					{
						src: '/assets/images/moshenniki.mp4',
						description: t('captions.moshenniki'),
					},
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
			<DescriptionSection />
			<ResourcesSection />
			<NewsSection />
			<Footer />
			<WhatsAppFloat />
		</div>
	)
}
