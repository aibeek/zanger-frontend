'use client'

import { ClientFaq } from '@/widgets/ClientFaq'

import s from './page.module.scss'
import { ApplicationTab } from '@/entities/application'

export default function MainView() {
	return (
		<div className={s.page}>
			<ApplicationTab />
			<ClientFaq />
		</div>
	)
}
