'use client'

import { useLocale } from 'next-intl'

import { Loader } from '@/shared/ui-kit'
import { defaultClientTab } from '@/shared/lib'
import { EmptyApplicationsAndResponses } from '@/widgets/EmptyApplicationsAndResponses'

import { useMyApplicationsStore } from '../../model'
import { MyApplicationsList } from '../MyApplicationsList'
import { useMyApplicationsSWR } from '../../model/myApplicationsStore'

export const MyApplicationsTab = () => {
	const locale = useLocale()
	const { myApplications, loading } = useMyApplicationsStore()
	useMyApplicationsSWR()

	if (loading) return <Loader />

	return myApplications.length === 0 ? (
		<EmptyApplicationsAndResponses
			redirectUrl={`/${locale}/${defaultClientTab}`}
			buttonContent="Создать заявку"
			descr="Заявок пока нет"
		/>
	) : (
		<MyApplicationsList data={myApplications} />
	)
}
