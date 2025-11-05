import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button, Checkbox } from '@/shared/ui-kit'
import specializationIcon from '@/app/assets/icons/medal.svg'
import s from './ProfileChangeSpecialization.module.scss'
import { SpecializationForm, specializationSchema } from '@/shared/lib'
import { useChangeSpecializationStore } from '../../model/useChangeSpecializationStore'
import { useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { ProfileTabWrapper } from '../ProfileTabWrapper'

export const ProfileChangeSpecialization = () => {
	const {
		specializations,
		isSubmitting,
		fetchSpecializations,
		fetchSelectedSpecializations,
		updateLawyerSpecializations,
		selectedSpecs,
	} = useChangeSpecializationStore()
	const disclosureBtnRef = useRef<HTMLButtonElement>(null)
	const t = useTranslations('profile.change_specialization')
	const {
		control,
		handleSubmit,
		setValue,
		formState: { errors },
	} = useForm<SpecializationForm>({
		resolver: zodResolver(specializationSchema),
		defaultValues: { specializations: [] },
	})

	useEffect(() => {
		fetchSpecializations()
		fetchSelectedSpecializations()
	}, [fetchSpecializations, fetchSelectedSpecializations])

	useEffect(() => {
		if (selectedSpecs?.length) {
			const selectedIds = selectedSpecs.map((spec) => spec.id)
			setValue('specializations', selectedIds)
		} else {
			setValue('specializations', [])
		}
	}, [selectedSpecs, setValue])

	const onSubmit = async (data: SpecializationForm) => {
		await updateLawyerSpecializations({ specialization_ids: data.specializations }, t)
	}

	return (
		<ProfileTabWrapper
			title={t('title')}
			imgSrc={specializationIcon}
			imgAlt="personalData"
			panel_title={t('panelTitle')}
			panel_descr={t('panelDescription')}
			ref={disclosureBtnRef}>
			<form onSubmit={handleSubmit(onSubmit)} className={s.form}>
				<div className={s.scrollableContent}>
					<Controller
						control={control}
						name="specializations"
						render={({ field }) => (
							<div className={s.checkboxes}>
								{specializations.map((spec) => (
									<Checkbox
										className={s.checkbox}
										key={spec.id}
										label={spec.name}
										checked={field.value.includes(spec.id)}
										onChange={(checked) => {
											const newValue = checked ? [...field.value, spec.id] : field.value.filter((id) => id !== spec.id)
											field.onChange(newValue)
										}}
									/>
								))}
							</div>
						)}
					/>
					{errors.specializations && <p className={s.error}>{errors.specializations.message}</p>}
				</div>
				<div className={s.stickyFooter}>
					<Button
						type="submit"
						variant="primary"
						size="auto"
						disabled={isSubmitting}
						className={s.submitButton}>
						{isSubmitting ? t('saving') : t('save')}
					</Button>
				</div>
			</form>
		</ProfileTabWrapper>
	)
}
