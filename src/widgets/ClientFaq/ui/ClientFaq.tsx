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

import { clientFaqData, faqData } from '@/shared/lib/data/lending-data'
import { ChevronDownIcon } from '@heroicons/react/20/solid'

import s from './ClientFaq.module.scss'

export const ClientFaq = () => {
	return (
		<section className={s.wrapper}>
			<div className={s.inner}>
				<div className={s.top}>
					<h2 className={s.faqTitle}>Часто задаваемые вопросы</h2>

					<div className={s.faqBox}>
						{clientFaqData.map(({ question, answer }, idx) => (
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
					</div>
				</div>
			</div>
		</section>
	)
}
