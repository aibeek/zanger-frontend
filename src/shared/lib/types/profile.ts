import { RoleVariant } from '../consts'
import { Region } from './shared'

type BaseProfile = {
	id: number
	name: string
	phone: string
	icon: string | null
	language: string
	onboarded: boolean
	region: Region
	role_id: RoleVariant
}

type LawyerTypes = {
	code: string
	id: number
	name: string
}

export type RequiredDocument = {
	id: number
	id_to_delete: number | null
	name: string
	is_double_sided: boolean
	link: string | null
	status: string | null
	sides: string | null
	is_uploaded: boolean
}

export type NeedDocuments = {
	type: 'documents'
	need: RequiredDocument[]
}

export type NeedSubscription = {
	type: 'subscription'
	need: true
}

export type NeedToAccessItem = NeedDocuments | NeedSubscription

// Тип для подписки из localStorage
export type SubscriptionFromStorage = {
	id: string
	user_id: number
	request_type_id: string
	request_type: string
	start_date: string
	end_date: string
	total_used: number
	last_reset: string
	requests_per_month: number
}

export type ClientProfile = BaseProfile & {
	role_id: { id: number; name: string; code: 'client' }
}

export type LawyerProfile = BaseProfile & {
	role_id: { id: number; name: string; code: 'lawyer' }
	lawyer: {
		id: number
		iin: string
		lawyer_types: LawyerTypes[]
		consultation_price: number | null
		has_access_to_orders: boolean
		telegram: string | null
		whatsapp: string | null
		need_to_access: NeedToAccessItem[]
		subscription: {
			id: number
			plan: {
				id: number
				name: string
			}
			started_at: string
			ends_at: string
		} | null
	}
}

export type UserProfile = LawyerProfile | ClientProfile | null
