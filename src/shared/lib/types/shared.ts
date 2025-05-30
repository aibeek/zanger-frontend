export type RegionType = {
	id: number
	name: string
}

export type Region = {
	id: number
	name: string
	path: string
	type: RegionType
}

export type Role = {
	id: number
	name: string
	code: string
}
