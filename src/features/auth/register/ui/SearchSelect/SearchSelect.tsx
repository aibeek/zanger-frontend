'use client'

import { Select } from 'antd'
import { ReactNode, useEffect, useMemo, useState } from 'react'

const { Option, OptGroup } = Select

interface GroupedSelectProps<T> {
	data: T[]
	searchData?: T[]
	searchFn?: (searchTerm: string, item: T) => boolean

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
	searchData,
	searchFn = (searchTerm, item) => getLabel(item)?.toLowerCase().includes(searchTerm.toLowerCase()),
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
	const [searchTerm, setSearchTerm] = useState('')
	const [filtered, setFiltered] = useState<T[]>(data)

	const sourceData = searchTerm ? searchData || data : data

	useEffect(() => {
		if (!searchTerm) {
			setFiltered(data)
		} else {
			setFiltered(sourceData.filter((item) => searchFn(searchTerm, item)))
		}
	}, [searchTerm, searchData, data])

	const grouped: Record<string, T[]> = {}
	const ungrouped: T[] = []

	const sortedData = useMemo(() => {
		const withName = filtered.filter((item) => getLabel(item) !== 'Другое')
		const other = filtered.filter((item) => getLabel(item) === 'Другое')
		return [
			...withName.sort((a, b) => getLabel(a).localeCompare(getLabel(b), 'ru', { sensitivity: 'base' })),
			...other,
		]
	}, [filtered])

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

	const handleChange = (val: any) => {
		if (multiple) {
			if (!Array.isArray(val)) return onChange?.(null)
			const selected = (searchData || data).filter((item) => val.includes(getId(item).toString()))
			onChange?.(selected.length ? selected : null)
		} else {
			if (typeof val !== 'object' || val === null) return onChange?.(null)
			const id = val.value
			const selected = (searchData || data).find((item) => getId(item).toString() === id)
			onChange?.(selected ?? null)
		}
	}

	const currentValue = multiple
		? Array.isArray(value)
			? value.map((v) => ({
					value: getId(v)?.toString(),
					label: getLabel(v),
				}))
			: []
		: value
			? {
					// @ts-expect-error fix it
					value: getId(value)?.toString(),
					// @ts-expect-error fix it
					label: getLabel(value),
				}
			: undefined
	return (
		<Select
			showSearch
			onSearch={(val) => setSearchTerm(val)}
			filterOption={false}
			mode={multiple ? 'multiple' : undefined}
			placeholder={placeholder}
			onChange={handleChange}
			loading={loading}
			disabled={disabled}
			value={currentValue}
			optionFilterProp="label"
			optionLabelProp="label"
			className={className}
			labelInValue={!multiple}>
			{ungrouped.map((item) => (
				<Option
					key={getId(item)}
					value={getId(item).toString()}
					label={getLabel(item)}>
					{getLabel(item)}
				</Option>
			))}

			{Object.entries(grouped)
				.sort(([a], [b]) => b.localeCompare(a, 'ru', { sensitivity: 'base' }))
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
