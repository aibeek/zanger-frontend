'use client'

import { useLocale, useTranslations } from 'next-intl'
import Cookies from 'js-cookie'

import { Loader } from '@/shared/ui-kit'
import { defaultClientTab, defaultLawyerTab } from '@/shared/lib'
import { DashboarEmptyHistory } from '@/widgets/DashboarEmptyHistory'

import { useApplicationsHistoryInfinite, useResponsesHistoryInfinite } from '../../model'
import { ApplicationHistoryList } from '../ApplicationHistoryList'
import { ResponseHistoryList } from '../ResponseHistoryList'

export const HistoryTab = () => {
	const locale = useLocale()
	const t = useTranslations('tabs.historyTab')
	const role = Cookies.get('role')

	const {
		items: applicationsHistory,
		isLoadingMore: isLoadingApps,
		isReachingEnd: isAppsEnd,
		setSize: setAppSize,
		size: appSize,
	} = useApplicationsHistoryInfinite(role === 'client')

	const {
		items: responsesHistory,
		isLoadingMore: isLoadingResponses,
		isReachingEnd: isResponsesEnd,
		setSize: setResponsesSize,
		size: responsesSize,
	} = useResponsesHistoryInfinite(role === 'lawyer')

	if (!role) return <Loader />

	if ((role === 'client' && appSize === 0) || (role === 'lawyer' && responsesSize === 0)) {
		return <Loader />
	}

	if (role === 'client') {
		if (!applicationsHistory || applicationsHistory.length === 0) {
			return (
				<DashboarEmptyHistory
					descr={t('noApplications')}
					redirectUrl={`/${locale}/${defaultClientTab}`}
					buttonContent={t('createApplication')}
				/>
			)
		}

		return (
			<ApplicationHistoryList
				items={applicationsHistory}
				loadMore={() => setAppSize((s) => s + 1)}
				isLoadingMore={isLoadingApps}
				isReachingEnd={isAppsEnd}
			/>
		)
	}

	if (role === 'lawyer') {
		return (
			<ResponseHistoryList
				items={responsesHistory}
				loadMore={() => setResponsesSize((s) => s + 1)}
				isLoadingMore={isLoadingResponses}
				isReachingEnd={isResponsesEnd}
			/>
		)
	}

	return null
}
