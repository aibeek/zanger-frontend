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
		case 'response_rejected': {
			const rawName = notification.data?.user.name
			const name = typeof rawName === 'object' ? rawName[lang] || rawName.ru || '' : rawName || ''

			return {
				...base,
				image: notification.data?.user?.icon,
				name,
				buttonText: t('buttons.view'),
				hasButton: true,
				buttonLink: `/dashboard/responses`,
			}
		}
		case 'documents': {
			const rawDocName = notification.data?.document?.name
			const rawTitleName = notification.data?.status.title
			const docName = typeof rawDocName === 'object' ? rawDocName[lang] || rawDocName.ru || '' : rawDocName || ''
			const titleName =
				typeof rawTitleName === 'object' ? rawTitleName[lang] || rawTitleName.ru || '' : rawTitleName || ''
			return {
				...base,
				image: docIcon,
				name: `${docName} (${titleName})`,
				buttonText: t('buttons.view'),
				hasButton: true,
				buttonLink: '/dashboard/profile?tab=documents',
			}
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
