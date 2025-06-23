import { z } from 'zod'

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d])/

export const phoneSchema = z.object({
	phone: z
		.string({
			required_error: 'validation.phoneRequired',
			invalid_type_error: 'validation.phoneRequired',
		})
		.min(10, { message: 'validation.phone_too_short' })
		.max(15, { message: 'validation.phone_too_long' }),
})

export const passwordSchema = z
	.object({
		password: z
			.string()
			.min(6, { message: 'validation.password_min' })
			.regex(PASSWORD_REGEX, { message: 'validation.password_pattern' }),
		password_confirmation: z.string(),
	})
	.superRefine(({ password, password_confirmation }, ctx) => {
		if (password !== password_confirmation) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'validation.passwords_do_not_match',
				path: ['password_confirmation'],
			})
		}
	})

export const clientRegistrationSchema = z
	.object({
		name: z.string().min(1, { message: 'validation.name_required' }),
		phone: z.string().min(10, { message: 'validation.phone_too_short' }),
		password: z
			.string()
			.min(6, { message: 'validation.password_min' })
			.regex(PASSWORD_REGEX, { message: 'validation.password_pattern' }),
		password_confirmation: z.string(),
		region_id: z.number({
			required_error: 'validation.region_required',
			invalid_type_error: 'validation.region_required',
		}),
		language: z.enum(['ru', 'en', 'kz']).default('ru').optional(),
	})
	.superRefine(({ password, password_confirmation }, ctx) => {
		if (password !== password_confirmation) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'validation.passwords_do_not_match',
				path: ['password_confirmation'],
			})
		}
	})

export const lawyerRegistrationSchema = z
	.object({
		name: z.string().min(1, { message: 'validation.name_required' }),
		phone: z.string().min(10, { message: 'validation.phone_too_short' }),
		password: z
			.string()
			.min(6, { message: 'validation.password_min' })
			.regex(PASSWORD_REGEX, { message: 'validation.password_pattern' }),
		password_confirmation: z.string(),
		region_id: z.number({
			required_error: 'validation.region_required',
			invalid_type_error: 'validation.region_required',
		}),
		language: z.enum(['ru', 'en', 'kz']).default('ru').optional(),
		iin: z.string().regex(/^\d{12}$/, { message: 'validation.iin_invalid' }),
		lawyer_type_id: z.number({
			required_error: 'validation.specialization_required',
			invalid_type_error: 'validation.specialization_required',
		}),
	})
	.superRefine(({ password, password_confirmation }, ctx) => {
		if (password !== password_confirmation) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'validation.passwords_do_not_match',
				path: ['password_confirmation'],
			})
		}
	})

export const loginSchema = z.object({
	phone: z.string().min(10, { message: 'validation.phone_too_short' }),
	password: z
		.string()
		.min(6, { message: 'validation.password_min' })
		.regex(PASSWORD_REGEX, { message: 'validation.password_pattern' }),
})

export const createApplicationSchema = z.object({
	description: z
		.string({
			required_error: 'description_required',
			invalid_type_error: 'description_required',
		})
		.min(10, { message: 'description_too_short' }),
	tag_id: z.union([z.number(), z.null()]).optional(),
	region_id: z.number({
		required_error: 'region_or_city_required',
		invalid_type_error: 'region_or_city_required',
	}),
})

export const updateProfilePasswordSchema = z
	.object({
		old_password: z
			.string()
			.min(6, { message: 'validation.password_min' })
			.regex(PASSWORD_REGEX, { message: 'validation.password_pattern' }),
		password: z
			.string()
			.min(6, { message: 'validation.password_min' })
			.regex(PASSWORD_REGEX, { message: 'validation.password_pattern' }),
		password_confirmation: z.string(),
	})
	.superRefine(({ password, password_confirmation }, ctx) => {
		if (password !== password_confirmation) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'validation.passwords_do_not_match',
				path: ['password_confirmation'],
			})
		}
	})

export const profilePersonalDataSchema = z.object({
	name: z.string().min(1, { message: 'Required' }),
	phone: z
		.string()
		.min(10, { message: 'validation.phone_too_short' })
		.max(15, { message: 'validation.phone_too_long' }),
	telegram: z.string().optional(),
	whatsapp: z.string().optional(),
	iin: z
		.string()
		.regex(/^\d{12}$/, { message: 'validation.iin_invalid' })
		.optional(),

	lawyer_type_ids: z
		.array(z.number(), {
			required_error: 'Выберите хотя бы один статус',
			invalid_type_error: 'Выберите хотя бы один статус',
		})
		.min(1, { message: 'Выберите хотя бы один статус' }),

	region_id: z
		.number({
			required_error: 'validation.region_required',
			invalid_type_error: 'validation.region_required',
		})
		.refine((val) => val !== null, { message: 'validation.region_required' }),
})

export const profileConsultationPriceSchema = z
	.object({
		consultation_price: z.string().optional(),
	})
	.superRefine(({ consultation_price }, ctx) => {
		if (consultation_price === undefined) return

		const digitsOnly = /^\d+(\s?\d+)*$/
		if (!digitsOnly.test(consultation_price)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'validation.only_digits',
				path: ['consultation_price'],
			})
		}
	})

export const specializationSchema = z.object({
	specializations: z
		.array(z.number(), {
			required_error: 'Выберите хотя бы одну специализацию',
		})
		.min(1, { message: 'Выберите хотя бы одну специализацию' }),
})

export const statusesSchema = z.object({
	statuses: z
		.array(z.number(), {
			required_error: 'Выберите свой статус',
		})
		.min(1, { message: 'Выберите свой статус' }),
})

export const servicingCitiesSchema = z.object({
	region_ids: z
		.array(z.number(), {
			required_error: 'Выберите хотя бы одну локацию',
		})
		.min(1, { message: 'Выберите хотя бы одну локацию' }),
})

export type ServicingCitiesForm = z.infer<typeof servicingCitiesSchema>
export type StatusesForm = z.infer<typeof statusesSchema>
export type SpecializationForm = z.infer<typeof specializationSchema>
export type PhoneSchemaType = z.infer<typeof phoneSchema>
export type PasswordSchemaType = z.infer<typeof passwordSchema>
export type ClientRegistrationSchemaType = z.infer<typeof clientRegistrationSchema>
export type LawyerRegistrationSchemaType = z.infer<typeof lawyerRegistrationSchema>
export type LoginSchemaType = z.infer<typeof loginSchema>
export type createApplicationSchemaType = z.infer<typeof createApplicationSchema>
export type UpdateProfilePasswordSchemaType = z.infer<typeof updateProfilePasswordSchema>
export type ProfilePersonalDataFormValues = z.infer<typeof profilePersonalDataSchema>
export type ProfileConsultationPriceSchema = z.infer<typeof profileConsultationPriceSchema>
