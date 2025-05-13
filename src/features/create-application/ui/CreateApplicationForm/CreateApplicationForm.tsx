'use client'

import { Textarea } from '@headlessui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'

import { Button } from '@/shared/ui-kit'
import { createApplicationSchema } from '@/shared/lib'
import { SearchSelect, useRegions } from '@/features/auth'
import { useCreateApplicationStore, useTags } from '@/features/create-application'

import s from './CreateApplicationForm.module.scss'
import { useTranslations } from 'next-intl'

export const CreateApplicationForm = () => {
	const { tags, loadingTags } = useTags()
	const { regions, loadingRegions } = useRegions()
	const { submit, success, resetSuccess } = useCreateApplicationStore()
	const t = useTranslations()
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
									data={tags}
									loading={loadingTags}
									value={tags.find((tag) => tag.id === field.value)}
									onChange={(tag) => field.onChange(tag?.id ?? null)}
									getId={(item) => item.id ?? 'null'}
									getLabel={(item) => item.name}
									groupBy={(item) => item.name.charAt(0)}
									renderGroupLabel={(groupName) => <span>{groupName}</span>}
									placeholder="Выберите тип услуги"
								/>
							)}
						/>
						{errors.tag_id && <p className={s.error}>{t(errors.tag_id.message)}</p>}
					</div>

					<div className={`${s.city} ${s.inputBox}`}>
						<label className={s.label}>Выберите регион</label>
						<Controller
							name="region_id"
							control={control}
							render={({ field }) => {
								const filteredRegions = regions.filter((region) => region.type.name !== 'Область')

								return (
									<SearchSelect
										className="search-select dashboard-select"
										data={filteredRegions}
										loading={loadingRegions}
										value={filteredRegions.find((region) => region.id === field.value)}
										onChange={(region) => field.onChange(region?.id)}
										getId={(item) => item.id}
										getLabel={(item) => item.name}
										groupBy={(item) => {
											if (item.type.name === 'Город' && item.path !== item.name) return item.path
											if (item.type.name === 'Город' && item.path === item.name) return 'Города'
											return null
										}}
										renderGroupLabel={(name) => <span>{name}</span>}
										placeholder="Выберите регион или город"
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
