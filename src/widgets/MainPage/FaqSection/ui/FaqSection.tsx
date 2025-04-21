'use client'

import {
	Disclosure,
	DisclosureButton,
	DisclosurePanel,
	Tab,
	TabGroup,
	TabList,
	TabPanel,
	TabPanels,
} from '@headlessui/react'

import { faqData } from '@/shared/lib/data/lending-data'
import { ChevronDownIcon } from '@heroicons/react/20/solid'

import s from './FaqSection.module.scss'

export const FaqSection = ({ id }: { id: string }) => {
	return (
		<section
			id={id}
			className={s.wrapper}>
			<div className="container-middle">
				<div className={s.inner}>
					<div className={s.top}>
						<h2 className="lending-title">Часто задаваемые вопросы</h2>

						<div className={s.content}>
							<TabGroup>
								<TabList className={s.tabList}>
									{faqData.map(({ name }) => (
										<Tab
											key={name}
											className={s.tab}>
											{name}
										</Tab>
									))}
								</TabList>

								<TabPanels>
									{faqData.map(({ faq }, idx) => (
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
																<p className={s.answer}>{answer}</p>
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
			</div>
		</section>
	)
}
