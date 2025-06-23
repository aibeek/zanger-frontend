'use client'

import { Textarea } from '@headlessui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'

import { Button } from '@/shared/ui-kit'
import { createApplicationSchema, useRegionsUtils } from '@/shared/lib'
import { SearchSelect, useRegions } from '@/features/auth'
import { useCreateApplicationStore, useTags } from '@/features/create-application'

import s from './CreateApplicationForm.module.scss'
import { useTranslations } from 'next-intl'

export const CreateApplicationForm = () => {
	const t = useTranslations('createApplications.form')
	const { tags, loadingTags } = useTags()
	const { regions } = useRegions()
	const { submit, success, resetSuccess } = useCreateApplicationStore()
	const { optionsForSelect, allOptions } = useRegionsUtils(regions, [])

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

			await submit(modifiedData, t)
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
						<label className={s.label}>{t('tagLabel')}</label>
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
									placeholder={t('tagPlaceholder')}
								/>
							)}
						/>
						{errors.tag_id && <p className={s.error}>{t(errors.tag_id.message)}</p>}
					</div>

					<div className={`${s.city} ${s.inputBox}`}>
						<label className={s.label}>{t('regionLabel')}</label>
						<Controller
							name="region_id"
							control={control}
							render={({ field }) => (
								<SearchSelect
									className="search-select dashboard-select"
									data={optionsForSelect}
									searchData={allOptions}
									value={allOptions.find((r) => r.id === field.value) || null}
									onChange={(region) => field.onChange(region?.id)}
									getId={(item) => item.id}
									getLabel={(item) => (item.path ? `${item.name} (${item.path})` : item.name)}
									renderGroupLabel={(label) => <span>{label.slice(3)}</span>}
									placeholder={t('regionPlaceholder')}
								/>
							)}
						/>
						{errors.region_id && <p className={s.error}>{t(errors.region_id.message)}</p>}
					</div>

					<div className={`${s.description} ${s.inputBox}`}>
						<label className={s.label}>{t('descriptionLabel')}</label>
						<Controller
							name="description"
							control={control}
							render={({ field }) => (
								<Textarea
									{...field}
									value={field.value ?? ''}
									onChange={field.onChange}
									className={s.textarea}
									placeholder={t('descriptionPlaceholder')}
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
						{success ? t('success') : t('submit')}
					</Button>
				</form>
			</div>
		</div>
	)
}
