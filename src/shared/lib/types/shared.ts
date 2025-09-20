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

export type Tag = {
	id: number
	name: string
	specialization_id?: number
}

export type Application = {
	id: number
	description: string
	region_id: number
	tag_id?: number
	status: string
	created_at: string
	updated_at: string
	region?: Region
	tag?: Tag
}

export type ApplicationsResponse = {
	data: Application[]
	current_page?: number
	last_page?: number
	per_page?: number
	total?: number
}
