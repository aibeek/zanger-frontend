import { useTranslations } from 'next-intl'

import { DescriptionSection, DownloadAppSection, MainSection } from '@/widgets/MainPage'

import s from './page.module.scss'

export default function Home() {
	const t = useTranslations('lending')

	return (
		<div className={s.page}>
			<MainSection />
			<DescriptionSection />
			<DownloadAppSection />
		</div>
	)
}
