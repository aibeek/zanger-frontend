'use client'

import { useTranslations } from 'next-intl'
import s from './DescriptionSection.module.scss'
import { ContentDataItem, useAppContentData } from '@/shared/lib'

export const DescriptionSection = () => {
	const t = useTranslations('lending.descriptionSection')
	const { descriptionData } = useAppContentData()

	const data: ContentDataItem = descriptionData[0]

	return (
		<section className={s.wrapper}>
			<div className={s.left}>
				<h2 className={s.title}>{t('leftTitle')}</h2>
				<ul className={s.leftList}>
					{data.left.text.map((text, idx) => (
						<li
							className={s.item}
							key={idx}
							dangerouslySetInnerHTML={{ __html: text }}
						/>
					))}
				</ul>
				<p className={s.descr}>{t('leftDescr')}</p>
			</div>
			<div className={s.right}>
				<h2 className={s.title}>{t('rightTitle')}</h2>
				<ul className={s.rightList}>
					{data.right.text.map((text, idx) => (
						<li
							className={s.item}
							key={idx}
							dangerouslySetInnerHTML={{ __html: text }}
						/>
					))}
				</ul>
				<p className={s.descr}>{t('rightDescr')}</p>
			</div>
		</section>
	)
}
