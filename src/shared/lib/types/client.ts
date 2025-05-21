import { Region, Role } from './shared'

export type ClientProfile = {
	id: number
	name: string
	phone: string
	icon: string
	language: string
	onboarded: boolean
	region: Region
	role_id: Role
}
