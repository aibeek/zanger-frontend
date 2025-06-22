'use client'

import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { Disclosure, DisclosureButton, DisclosurePanel, TabGroup, TabPanel, TabPanels } from '@headlessui/react'

import s from './ClientFaq.module.scss'
import { useAppContentData } from '@/shared/lib'

export const ClientFaq = () => {
	const { lawyerFaqData } = useAppContentData()

	return (
		<section className={s.wrapper}>
			<div className={s.inner}>
				<div className={s.top}>
					<h2 className={s.faqTitle}>F.A.Q.</h2>

					<div className={s.faqBox}>
						<TabGroup>
							<TabPanels>
								{lawyerFaqData.map(({ faq }, idx) => (
									<TabPanel
										className={s.faqItems}
										key={idx}>
										{faq.map(({ question, answer }, idx) => (
											<Disclosure
												key={idx}
												as="div"
												className={s.faqItem}>
												{({ open }) => (
													<>
														<DisclosureButton className={s.faq}>
															<p className={s.question}>{question}</p>
															<ChevronDownIcon className={`${s.chevron} ${open ? s.chevronOpen : ''}`} />
														</DisclosureButton>
														<DisclosurePanel>
															{typeof answer === 'string' ? (
																<p className={s.answer}>{answer}</p>
															) : (
																<ul className={s.answerList}>
																	{Object.values(answer).map((item, i) => (
																		<li
																			className={s.answer}
																			key={i}>
																			{/* @ts-expect-error fix it */}
																			{item}
																		</li>
																	))}
																</ul>
															)}
														</DisclosurePanel>
													</>
												)}
											</Disclosure>
										))}
									</TabPanel>
								))}
							</TabPanels>
						</TabGroup>
					</div>
				</div>
			</div>
		</section>
	)
}
