import { NotificationItem } from '@/entities/notifications'
import docIcon from '@/app/assets/icons/need-to-access-docs.svg'

export const mapNotification = (notification: any) => {
	const base: NotificationItem = {
		id: notification.id,
		title: notification.title,
		is_read: notification.is_read,
		created_at: notification.created_at,
		hasButton: false,
		buttonText: '',
		buttonLink: '#',
		name: '',
		type: notification.type,
	}

	switch (notification.type) {
		case 'response_accepted':
		case 'response_rejected':
			return {
				...base,
				image: notification.data?.user?.icon,
				name: notification.data?.user?.name || '',
				buttonText: 'Посмотреть',
				hasButton: true,
				buttonLink: `/dashboard/responses`,
			}

		case 'documents':
			return {
				...base,
				image: docIcon,
				name: `${notification.data?.document?.name_ru || ''} (${notification.data?.status.title})`,
				buttonText: 'Посмотреть',
				hasButton: true,
				buttonLink: '/dashboard/profile?tab=documents',
			}

		default:
			return base
	}
}
