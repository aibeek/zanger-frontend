import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'

import s from './Accordion.module.scss'

type AccordionItem = {
	question: string
	answer: string
}

type AccordionProps = {
	items: AccordionItem[]
	title?: string
}

export const Accordion = ({ items, title }: AccordionProps) => {
	return (
		<div className={s.box}>
			<h4 className={s.title}>{title}</h4>
			<div className={s.accordion}>
				{items.map((item, index) => (
					<Disclosure key={index}>
						<DisclosureButton className={s.question}>
							<div className={s.questionContent}>
								<p>{item.question}</p>
								<ChevronDownIcon className={s.chevron} />
							</div>
						</DisclosureButton>
						<DisclosurePanel className={s.answer}>
							<p>{item.answer}</p>
						</DisclosurePanel>
					</Disclosure>
				))}
			</div>
		</div>
	)
}
