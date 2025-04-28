'use client'

import { useEffect } from 'react'
import { Textarea } from '@headlessui/react'
import { Toaster } from 'react-hot-toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'

import { Button } from '@/shared/ui-kit'
import { createApplicationSchema } from '@/shared'
import { SearchSelect } from '@/features/auth/register'
import { useCitiesStore } from '@/features/auth/register/model'

import s from './CreateApplicationForm.module.scss'
import { useTagsStore } from '../../model/tagsStore'
import { useCreateApplicationStore } from '../../model'

export const CreateApplicationForm = () => {
	const { cities, fetchCities, loadingCities } = useCitiesStore()
	const { submit, isLoading, resetTrigger } = useCreateApplicationStore()
	const { tags, loadingTags, fetchTags } = useTagsStore()

	const {
		handleSubmit,
		control,
		reset,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(createApplicationSchema),
		mode: 'onSubmit',
	})

	useEffect(() => {
		fetchCities()
		fetchTags()
	}, [])

	useEffect(() => {
		if (resetTrigger) {
			reset()
		}
	}, [resetTrigger])

	return (
		<>
			<div className={s.wrapper}>
				<div className={s.inner}>
					<form
						className={s.form}
						onSubmit={handleSubmit((data: any) => submit(data))}>
						<div className={`${s.tags} ${s.inputBox}`}>
							<label className={s.label}>Вид услуги</label>
							<Controller
								name="tag_id"
								control={control}
								render={({ field }) => (
									<SearchSelect
										data={tags}
										loading={loadingTags}
										value={tags.find((tag) => tag.id === field.value)}
										onChange={(tag) => field.onChange(tag?.id)}
										getId={(item) => item.id}
										getLabel={(item) => item.name}
										groupBy={(item) => item.name}
										renderGroupLabel={(name) => <span>{name}</span>}
										placeholder="Выберите тип услуги"
									/>
								)}
							/>

							{errors.tag_id && <p className={s.error}>{errors.tag_id.message}</p>}
						</div>

						<div className={`${s.city} ${s.inputBox}`}>
							<label className={s.label}>Выберите регион</label>
							<Controller
								name="region_id"
								control={control}
								render={({ field }) => (
									<SearchSelect
										data={cities}
										loading={loadingCities}
										value={cities.find((city) => city.id === field.value)}
										onChange={(city) => field.onChange(city?.id)}
										getId={(item) => item.id}
										getLabel={(item) => (item?.type?.name === 'Область' ? `${item.name} (Область)` : item.name)}
										groupBy={(item) => (item?.type?.name === 'Город' ? item.path : null)}
										renderGroupLabel={(name) => <span>{name}</span>}
										placeholder="Выберите регион или город"
									/>
								)}
							/>

							{errors.region_id && <p className={s.error}>{errors.region_id.message}</p>}
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
										placeholder="Введите описание"></Textarea>
								)}
							/>

							{errors.description && <p className={s.error}>{errors.description.message}</p>}
						</div>

						<Button
							className={s.btn}
							variant="primary"
							size="lg"
							type="submit"
							disabled={isLoading}>
							{isLoading ? 'Подаём...' : 'Подать заявку'}
						</Button>
					</form>
				</div>
			</div>
		</>
	)
}
