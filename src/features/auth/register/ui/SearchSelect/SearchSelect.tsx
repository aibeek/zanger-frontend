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
	disabled?: boolean
}

export function SearchSelect<T>({
	data,
	value,
	onChange,
	getId,
	getLabel,
	groupBy,
	renderGroupLabel,
	placeholder = 'Выберите элемент',
	loading = false,
	className,
	disabled,
}: GroupedSelectProps<T>) {
	const actualData = Array.isArray(data) ? data : data || []

	const sortedData = [
		...actualData
			.filter((item) => getLabel(item) !== 'Другое')
			.sort((a, b) => getLabel(a).localeCompare(getLabel(b), 'ru', { sensitivity: 'base' })),
		...actualData.filter((item) => getLabel(item) === 'Другое'),
	]

	const grouped: Record<string, T[]> = {}
	const ungrouped: T[] = []

	if (groupBy) {
		sortedData.forEach((item) => {
			const group = groupBy(item)
			if (group) {
				if (!grouped[group]) grouped[group] = []
				grouped[group].push(item)
			} else {
				ungrouped.push(item)
			}
		})
	} else {
		ungrouped.push(...sortedData)
	}

	const handleChange = (id: string | number) => {
		const selected = actualData.find((item) => getId(item) === id)
		onChange?.(selected ?? null)
	}

	return (
		<Select
			showSearch
			placeholder={placeholder}
			onChange={handleChange}
			loading={loading}
			disabled={disabled}
			optionFilterProp="children"
			value={value ? getId(value) : undefined}
			className={className}>
			{ungrouped.map((item) => (
				<Option
					key={`${getId(item)}-${Math.random()}`}
					value={getId(item)}>
					{getLabel(item)}
				</Option>
			))}
			{Object.entries(grouped).map(([groupName, items]) => {
				if (items.length > 0 && (renderGroupLabel ? renderGroupLabel(groupName) : groupName)) {
					return (
						<OptGroup
							key={groupName}
							label={renderGroupLabel ? renderGroupLabel(groupName) : groupName}>
							{items.map((item) => (
								<Option
									key={`${getId(item)}-${Math.random()}`}
									value={getId(item)}>
									{getLabel(item)}
								</Option>
							))}
						</OptGroup>
					)
				}
				return null
			})}
		</Select>
	)
}
