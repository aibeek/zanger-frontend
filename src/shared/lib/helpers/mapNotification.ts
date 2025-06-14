import { NotificationItem } from '@/entities/notifications'

export const mapNotification = (notification: any) => {
	const base: NotificationItem = {
		id: notification.id,
		title: notification.title,
		is_read: notification.is_read,
		created_at: notification.created_at,
		hasButton: false,
		buttonText: '',
		buttonLink: '#',
	}

	switch (notification.type) {
		case 'response_accepted':
			return {
				...base,
				image: notification.data?.user?.icon,
				buttonText: 'Посмотреть отклик',
				hasButton: true,
				buttonLink: `/dashboard/responses`,
			}

		case 'documents':
			return {
				...base,
				image: '/document-icon.png',
				buttonText: 'Документ на модерации',
				hasButton: true,
				buttonLink: '/dashboard/profile?tab=documents',
			}

		default:
			return base
	}
}
