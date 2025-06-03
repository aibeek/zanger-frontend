'use client'

import { Textarea } from '@headlessui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'

import { Button } from '@/shared/ui-kit'
import { createApplicationSchema, regionGroupBy, sortRegions, useRegionsUtils } from '@/shared/lib'
import { SearchSelect, useRegions } from '@/features/auth'
import { useCreateApplicationStore, useTags } from '@/features/create-application'

import s from './CreateApplicationForm.module.scss'
import { useTranslations } from 'next-intl'

export const CreateApplicationForm = () => {
	const { tags, loadingTags } = useTags()
	const { regions } = useRegions()
	const { submit, success, resetSuccess } = useCreateApplicationStore()
	const t = useTranslations()
	const { optionsForSelect, allOptions } = useRegionsUtils(regions, [], t)

	const {
		handleSubmit,
		control,
		reset,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(createApplicationSchema),
		mode: 'onSubmit',
	})

	const onSubmit = async (data) => {
		try {
			const modifiedData = {
				...data,
				tag_id: data.tag_id || null,
			}

			await submit(modifiedData)
			reset()
			resetSuccess()
		} catch (error) {
			console.error('Ошибка при отправке:', error)
		}
	}

	return (
		<div className={s.wrapper}>
			<div className={s.inner}>
				<form
					className={s.form}
					onSubmit={handleSubmit(onSubmit)}>
					<div className={`${s.tags} ${s.inputBox}`}>
						<label className={s.label}>Вид услуги</label>
						<Controller
							name="tag_id"
							control={control}
							render={({ field }) => (
								<SearchSelect
									className="search-select dashboard-select"
									data={[...tags].sort((a, b) => a.name.localeCompare(b.name))}
									loading={loadingTags}
									value={tags.find((tag) => tag.id === field.value)}
									// @ts-expect-error fix it
									onChange={(tag) => field.onChange(tag?.id ?? null)}
									getId={(item) => item.id ?? 'null'}
									getLabel={(item) => item.name}
									placeholder="Выберите вид услуги"
								/>
							)}
						/>
						{errors.tag_id && <p className={s.error}>{t(errors.tag_id.message)}</p>}
					</div>

					<div className={`${s.city} ${s.inputBox}`}>
						<label className={s.label}>Населенный пункт</label>
						<Controller
							name="region_id"
							control={control}
							render={({ field }) => {
								return (
									<SearchSelect
										className="search-select dashboard-select"
										data={optionsForSelect}
										searchData={allOptions}
										value={optionsForSelect.find((r) => r.id === field.value) || null}
										onChange={(region) => field.onChange(region?.id)}
										getId={(item) => item.id}
										getLabel={(item) => item.name}
										groupBy={regionGroupBy}
										renderGroupLabel={(label) => <span>{label.slice(3)}</span>}
										placeholder="Выберите населенный пункт"
									/>
								)
							}}
						/>
						{errors.region_id && <p className={s.error}>{t(errors.region_id.message)}</p>}
					</div>

					<div className={`${s.description} ${s.inputBox}`}>
						<label className={s.label}>Описание</label>
						<Controller
							name="description"
							control={control}
							render={({ field }) => (
								<Textarea
									{...field}
									value={field.value ?? ''}
									onChange={field.onChange}
									className={s.textarea}
									placeholder="Введите описание"
								/>
							)}
						/>
						{errors.description && <p className={s.error}>{t(errors.description.message)}</p>}
					</div>

					<Button
						className={s.btn}
						variant="primary"
						size="lg"
						type="submit"
						disabled={success}>
						{success ? 'Заявка отправлена' : 'Подать заявку'}
					</Button>
				</form>
			</div>
		</div>
	)
}
