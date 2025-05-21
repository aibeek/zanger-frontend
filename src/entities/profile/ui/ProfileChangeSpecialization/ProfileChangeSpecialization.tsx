import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button, Checkbox } from '@/shared/ui-kit'
import rocketIcon from '@/app/assets/icons/rocket.svg'
import s from './ProfileChangeSpecialization.module.scss'
import { SpecializationForm, specializationSchema } from '@/shared/lib'
import { useChangeSpecializationStore } from '../../model/useChangeSpecializationStore'
import { useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { ProfileTabWrapper } from '../ProfileTabWrapper'

export const ProfileChangeSpecialization = () => {
	const { specializations, isSubmitting, fetchSpecializations, updateLawyerSpecializations } =
		useChangeSpecializationStore()
	const disclosureBtnRef = useRef<HTMLButtonElement>(null)
	const t = useTranslations('profile.change_specialization')
	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<SpecializationForm>({
		resolver: zodResolver(specializationSchema),
		defaultValues: { specializations: [] as number[] },
	})

	useEffect(() => {
		fetchSpecializations()
	}, [fetchSpecializations])

	const onSubmit = async (data: SpecializationForm) => {
		await updateLawyerSpecializations({ specialization_ids: data.specializations })
	}

	return (
		<ProfileTabWrapper
			title={t('title')}
			imgSrc={rocketIcon}
			imgAlt="personalData"
			panel_title={t('panelTitle')}
			panel_descr={t('panelDescription')}
			ref={disclosureBtnRef}>
			<form onSubmit={handleSubmit(onSubmit)}>
				<Controller
					control={control}
					name="specializations"
					render={({ field }) => (
						<div className={s.checkboxes}>
							{specializations.map((spec) => (
								<Checkbox
									className={s.checkbox}
									key={spec.name}
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
				<Button
					type="submit"
					variant="primary"
					size="auto"
					style={{ padding: '8px 30px', marginTop: '-22px' }}
					disabled={isSubmitting}
					className={s.submitButton}>
					{isSubmitting ? 'Сохранение...' : 'Сохранить'}
				</Button>
			</form>
		</ProfileTabWrapper>
	)
}
