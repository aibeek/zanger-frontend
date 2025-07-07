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
			plan: {
				name: string
			}
			ends_at: string
		}
	}
}

export type UserProfile = LawyerProfile
