import { NotificationItem } from '@/entities/notifications'
import docIcon from '@/app/assets/icons/need-to-access-docs.svg'
import { formatPhoneNumber } from './formatPhoneNumber'

export const mapNotification = (notification: any, t: ReturnType<any>, lang: string): NotificationItem => {
	const base: NotificationItem = {
		id: notification.id,
		title: t(`types.${notification.type}`),
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
				buttonText: t('buttons.view'),
				hasButton: true,
				buttonLink: `/dashboard/responses`,
			}

		case 'documents':
			return {
				...base,
				image: docIcon,
				name: `${notification.data?.document?.name_ru || ''} (${notification.data?.status.title})`,
				buttonText: t('buttons.view'),
				hasButton: true,
				buttonLink: '/dashboard/profile?tab=documents',
			}

		case 'new_order_response':
			return {
				...base,
				image: notification.data?.response?.lawyer?.icon,
				buttonText: t('buttons.view'),
				hasButton: true,
				buttonLink: `/dashboard/applications`,
			}

		case 'new_order': {
			const rawTagName = notification.data?.tag?.name
			const tagName = typeof rawTagName === 'object' ? rawTagName[lang] || rawTagName.ru || '' : rawTagName || ''

			return {
				...base,
				name: tagName,
				buttonText: t('buttons.view'),
				hasButton: true,
				buttonLink: `/dashboard/responses`,
				image: docIcon,
			}
		}

		case 'call_request':
			return {
				...base,
				image: notification.data?.user?.icon,
				name: `${notification.data?.user?.name} ${formatPhoneNumber(notification.data?.user?.phone)}`,
				buttonText: t('buttons.view'),
				hasButton: true,
				buttonLink: `/dashboard/responses`,
			}

		case 'order_archived':
			return {
				...base,
				buttonText: t('buttons.view'),
				image: docIcon,
				hasButton: true,
				buttonLink: `/dashboard/history`,
			}

		default:
			return base
	}
}
