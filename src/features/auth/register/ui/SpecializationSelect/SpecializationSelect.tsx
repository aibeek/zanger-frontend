import { Select } from 'antd'
import { ReactNode } from 'react'

const { Option, OptGroup } = Select

interface GroupedSelectProps<T> {
	data: T[]
	value?: T | null
	onChange?: (value: T | null) => void
	getId: (item: T) => string | number
	getLabel: (item: T) => string
	groupBy?: (item: T) => string | null
	renderGroupLabel?: (groupName: string) => ReactNode
	placeholder?: string
	loading?: boolean
	className?: string
}

export function SpecializationSelect<T>({
	data,
	value,
	onChange,
	getId,
	getLabel,
	groupBy,
	renderGroupLabel = (name) => name,
	placeholder = 'Выберите элемент',
	loading = false,
}: GroupedSelectProps<T>) {
	const actualData = Array.isArray(data) ? data : data || []

	const grouped: Record<string, T[]> = {}

	if (groupBy) {
		actualData.forEach((item) => {
			const group = groupBy(item)
			if (group) {
				if (!grouped[group]) grouped[group] = []
				grouped[group].push(item)
			}
		})
	}

	const handleChange = (id: string | number) => {
		const selected = actualData.find((item) => getId(item) === id)
		onChange?.(selected ?? null)
	}

	return (
		<Select
			showSearch
			placeholder={placeholder}
			style={{ width: '100%' }}
			onChange={handleChange}
			loading={loading}
			optionFilterProp="children"
			value={value ? getId(value) : undefined}
			className="search-select">
			{!groupBy &&
				actualData.map((item) => (
					<Option
						key={getId(item)}
						value={getId(item)}>
						{getLabel(item)}
					</Option>
				))}

			{groupBy &&
				Object.entries(grouped).map(([groupName, items]) => (
					<OptGroup
						key={groupName}
						label={renderGroupLabel(groupName)}>
						{items.map((item) => (
							<Option
								key={getId(item)}
								value={getId(item)}>
								{getLabel(item)}
							</Option>
						))}
					</OptGroup>
				))}
		</Select>
	)
}
