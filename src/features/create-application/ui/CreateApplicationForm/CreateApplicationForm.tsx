'use client'

import { Textarea } from '@headlessui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'

import { Button, Input } from '@/shared/ui-kit'
import { createApplicationSchema, useRegionsUtils } from '@/shared/lib'
import { SearchSelect, useRegions } from '@/features/auth'
import { useCreateApplicationStore, useTags } from '@/features/create-application'
import { clientApi, Application } from '@/shared/api'

import s from './CreateApplicationForm.module.scss'
import { useTranslations } from 'next-intl'
import toast from 'react-hot-toast'

interface CreateApplicationFormProps {
	applicationId?: number
	onSuccess?: () => void
}

export const CreateApplicationForm = ({ applicationId, onSuccess }: CreateApplicationFormProps) => {
	const t = useTranslations('createApplications.form')
	const { tags, loadingTags } = useTags()
	const { regions } = useRegions()
	const { submit, success, resetSuccess } = useCreateApplicationStore()
	const { optionsForSelect, allOptions } = useRegionsUtils(regions, [])
	const [loading, setLoading] = useState(false)
	const [initialData, setInitialData] = useState<Application | null>(null)

	const {
		handleSubmit,
		control,
		reset,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(createApplicationSchema),
		mode: 'onSubmit',
	})

	// Загружаем данные заявки для редактирования
        useEffect(() => {
            if (applicationId && applicationId !== 0) {
                const fetchApplication = async () => {
                    try {
                        setLoading(true)
                        const data = await clientApi.getApplication(applicationId) as Application
                        setInitialData(data)
                        
                        // Заполняем форму данными
                        reset({
                            region_id: data.region_id,
                            tag_id: data.tag_id,
                            description: data.description,
                            phone: data.phone ?? '',
                        })
                    } catch (error) {
                        console.error('Error fetching application:', error)
                        toast.error(t('errorFetching'))
                    } finally {
                        setLoading(false)
                    }
                }
                fetchApplication()
            }
        }, [applicationId, reset, t])

	const onSubmit = async (data) => {
		try {
			setLoading(true)
            const modifiedData = {
                ...data,
                tag_id: data.tag_id || null,
                phone: data.phone?.trim() || undefined,
            }

			if (applicationId && applicationId !== 0) {
				// Редактируем существующую заявку
				await clientApi.updateApplication(applicationId, modifiedData)
				toast.success(t('successUpdate'))
			} else {
				// Создаем новую заявку
				await submit(modifiedData, t)
			}
			
			reset()
			resetSuccess()
			onSuccess?.()
		} catch (error) {
			console.error('Ошибка при отправке:', error)
			toast.error(applicationId ? t('errorUpdate') : t('errorStore'))
		} finally {
			setLoading(false)
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

                    <div className={`${s.phone} ${s.inputBox}`}>
                        <label className={s.label}>{t('phoneLabel')}</label>
                        <Controller
                            name="phone"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    value={field.value ?? ''}
                                    onChange={field.onChange}
                                    placeholder={t('phonePlaceholder')}
                                />
                            )}
                        />
                    </div>

					<Button
						className={s.btn}
						variant="primary"
						size="lg"
						type="submit"
						disabled={loading || success}>
						{loading 
							? t('loading') 
							: success 
								? t('success') 
								: applicationId 
									? t('update') 
									: t('submit')
						}
					</Button>
				</form>
			</div>
		</div>
	)
}
