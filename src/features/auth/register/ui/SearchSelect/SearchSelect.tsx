import { Select } from 'antd'
import { ReactNode } from 'react'

const { Option, OptGroup } = Select

interface GroupedSelectProps<T> {
	data: T[]
	value?: T | T[] | null
	onChange?: (value: T | T[] | null) => void
	getId: (item: T) => string | number
	getLabel: (item: T) => string
	groupBy?: (item: T) => string | null
	renderGroupLabel?: (groupName: string) => ReactNode
	placeholder?: string
	loading?: boolean
	className?: string
	disabled?: boolean
	multiple?: boolean
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
	multiple = false,
}: GroupedSelectProps<T>) {
	const actualData = Array.isArray(data) ? data : []

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

	const handleChange = (ids: string[] | string) => {
		if (multiple) {
			if (!Array.isArray(ids)) return onChange?.(null)
			const selected = actualData.filter((item) => {
				const id = getId(item)
				return id !== undefined && id !== null && ids.includes(id.toString())
			})
			onChange?.(selected.length ? selected : null)
		} else {
			if (typeof ids !== 'string') return onChange?.(null)
			const selected = actualData.find((item) => {
				const id = getId(item)
				return id !== undefined && id !== null && id.toString() === ids
			})
			onChange?.(selected ?? null)
		}
	}

	const currentValue = multiple
		? Array.isArray(value) && value.length > 0
			? value
					.map((v) => {
						const id = getId(v)
						return id !== undefined && id !== null ? id.toString() : null
					})
					.filter(Boolean) // убираем null и undefined
			: undefined
		: value
		? (() => {
				const id = getId(value as T)
				return id !== undefined && id !== null ? id.toString() : undefined
		  })()
		: undefined

	return (
		<Select
			showSearch
			mode={multiple ? 'multiple' : undefined}
			placeholder={placeholder}
			onChange={handleChange}
			loading={loading}
			disabled={disabled}
			optionFilterProp="label"
			value={currentValue}
			className={className}
			optionLabelProp="label"
			filterOption={(input, option) => option?.label?.toString().toLowerCase().includes(input.toLowerCase())}>
			{ungrouped.map((item) => (
				<Option
					key={getId(item)}
					value={getId(item).toString()}
					label={getLabel(item)}>
					{getLabel(item)}
				</Option>
			))}

			{Object.entries(grouped)
				.sort(([a], [b]) => {
					return b.localeCompare(a, 'ru', { sensitivity: 'base' })
				})
				.map(([groupName, items]) => (
					<OptGroup
						key={groupName}
						label={renderGroupLabel ? renderGroupLabel(groupName) : groupName}>
						{items.map((item) => (
							<Option
								key={getId(item)}
								value={getId(item).toString()}
								label={getLabel(item)}>
								{getLabel(item)}
							</Option>
						))}
					</OptGroup>
				))}
		</Select>
	)
}
