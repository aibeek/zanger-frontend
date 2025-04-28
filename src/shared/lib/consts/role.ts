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
	{ name: 'Лента заявок', route: 'lenta', icon: LentaIcon, onlyFor: 'lawyer' },
	{ name: 'Отклики', route: 'responses', icon: ResponsesIcon, onlyFor: 'lawyer' },
	{ name: 'Главная', route: 'main', icon: MainIcon, onlyFor: 'client' },
	{ name: 'Мои заявки', route: 'applications', icon: ResponsesIcon, onlyFor: 'client' },
	{ name: 'История', route: 'history', icon: HistoryIcon },
	{ name: 'Профиль', route: 'profile', icon: ProfileIcon },
] as const
