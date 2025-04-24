import Image from 'next/image'

import s from './BenefitShowcase.module.scss'
import { ContentDataItem } from '@/shared/lib/data/lending-data'
import { BenefitShowcaseAccordion } from './BenefitShowcaseAccordion'

type Props = {
	title: string
	descr: string
	content: ContentDataItem[]
}

export const BenefitShowcase = ({ title, descr, content }: Props) => {
	return (
		<section className={s.wrapper}>
			<div className="container-middle">
				<div className={s.inner}>
					<div className={s.top}>
						<h2 className="lending-title">{title}</h2>
						<p className="lending-descr">{descr}</p>
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
												<h4 className={s.faqBoxTitle}>{top.title}</h4>
												<p className="lending-descr">{top.descr}</p>
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
												<h4 className={s.faqBoxTitle}>{bottom.title}</h4>
												<p className="lending-descr">{bottom.descr}</p>
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
