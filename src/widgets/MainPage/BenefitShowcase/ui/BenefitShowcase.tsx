import Image from 'next/image'

import { ContentDataItem } from '@/shared/lib'

import s from './BenefitShowcase.module.scss'
import { BenefitShowcaseAccordion } from './BenefitShowcaseAccordion'
import { useTranslations } from 'next-intl'

type Props = {
	title: string
	descr: string
	content: ContentDataItem[]
}

export const BenefitShowcase = ({ title, descr, content }: Props) => {
	const t = useTranslations('lending.benefitShowcase')
	return (
		<section className={s.wrapper}>
			<div className="container-middle">
				<div className={s.inner}>
					<div className={s.top}>
						<h2
							className="lending-title"
							dangerouslySetInnerHTML={{ __html: title }}
						/>
						<p
							className="lending-descr"
							dangerouslySetInnerHTML={{ __html: descr }}
						/>
					</div>

					<div className={s.content}>
						{content.map(({ top, bottom }, idx) => (
							<div
								key={idx}
								className={s.contentInner}>
								{top && (
									<>
										<div className={s.faqBox}>
											<div className={s.faqBoxTop}>
												<h4 className={s.faqBoxTitle}>{t('faqBox.top.title')}</h4>
												<p
													className="lending-descr"
													dangerouslySetInnerHTML={{ __html: t('faqBox.top.descr') }}
												/>
											</div>

											{top.faq.map((faq, idx) => (
												<BenefitShowcaseAccordion
													key={idx}
													// @ts-expect-error fix it
													faq={faq}
												/>
											))}
										</div>
										<div
											style={{ backgroundColor: top.bgColor }}
											className={s.imgBox}>
											<Image
												src={top.imageUrl}
												alt={top.title}
											/>
										</div>
									</>
								)}
								{bottom && (
									<>
										<div
											style={{ backgroundColor: bottom.bgColor }}
											className={s.imgBox}>
											<Image
												src={bottom.imageUrl}
												alt={bottom.title}
											/>
										</div>
										<div className={s.faqBox}>
											<div className={s.faqBoxTop}>
												<h4
													className={s.faqBoxTitle}
													dangerouslySetInnerHTML={{ __html: t('faqBox.bottom.title') }}
												/>
												<p
													className="lending-descr"
													dangerouslySetInnerHTML={{ __html: t('faqBox.bottom.descr') }}
												/>
											</div>

											{bottom.faq.map((faq, idx) => (
												<BenefitShowcaseAccordion
													key={idx}
													// @ts-expect-error fix it
													faq={faq}
												/>
											))}
										</div>
									</>
								)}
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	)
}
