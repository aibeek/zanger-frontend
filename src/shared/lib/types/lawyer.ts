import { Role } from '../consts'
import { Region } from './shared'

type LawyerType = {
	id: number
	code: string
	name: string
}

type NeedToAccessItem =
	| { type: 'documents'; need: Array<{ [key: string]: any }> }
	| { type: 'specialization'; need: true }
	| { type: 'service-regions'; need: true }

export type LawyerProfile = {
	id: number
	name: string
	phone: string
	icon: string | null
	language: string
	onboarded: boolean
	region: Region
	role_id: Role
	lawyer: {
		id: number
		iin: string
		lawyer_type: LawyerType
		consultation_price: number | null
		has_access_to_orders: boolean
		telegram: string | null
		whatsapp: string | null
		need_to_access: NeedToAccessItem[]
	}
}
