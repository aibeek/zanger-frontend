import HistoryIcon from '@/app/assets/icons/user-tabs/history.svg'
import LentaIcon from '@/app/assets/icons/user-tabs/lenta.svg'
import MainIcon from '@/app/assets/icons/user-tabs/main.svg'
import ProfileIcon from '@/app/assets/icons/user-tabs/profile.svg'
import ResponsesIcon from '@/app/assets/icons/user-tabs/responses-and-orders.svg'

export type Role = 'client' | 'lawyer'

export const arrRoles: Role[] = ['client', 'lawyer']

export const defaultTabByRole: Record<'client' | 'lawyer', string> = {
	client: 'main',
	lawyer: 'lenta',
}

export const allTabs = [
	{ name: 'feed', route: 'lenta', icon: LentaIcon, onlyFor: 'lawyer' },
	{ name: 'responses', route: 'responses', icon: ResponsesIcon, onlyFor: 'lawyer' },
	{ name: 'main', route: 'main', icon: MainIcon, onlyFor: 'client' },
	{ name: 'applications', route: 'applications', icon: ResponsesIcon, onlyFor: 'client' },
	{ name: 'history', route: 'history', icon: HistoryIcon },
	{ name: 'profile', route: 'profile', icon: ProfileIcon },
] as const
