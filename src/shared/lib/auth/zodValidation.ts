import { z } from 'zod'

export const phoneSchema = z.object({
	phone: z
		.string()
		.min(10, 'Слишком короткий номер')
		// .regex(/^(\+7|8)?\d{10}$/, 'Введите корректный номер')
		.max(15, 'Номер телефона должен быть не более 15 символов'),
})

export type PhoneSchemaType = z.infer<typeof phoneSchema>

const PASSWORD_PATTERN_ERROR =
	'Пароль должен состоять минимум из 6 символов, содержать 1 строчную (a-z), 1 заглавную букву (A-Z), цифры и специальные символы (! ? $ % *)'

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!?\$\%\*])/

export const passwordSchema = z
	.object({
		password: z.string().min(6, 'Пароль должен быть минимум 6 символов').regex(PASSWORD_REGEX, PASSWORD_PATTERN_ERROR),
		password_confirmation: z.string(),
	})
	.superRefine(({ password, password_confirmation }, ctx) => {
		if (password !== password_confirmation) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Пароли не совпадают',
				path: ['password_confirmation'],
			})
		}
	})

export type PasswordSchemaType = z.infer<typeof passwordSchema>
export { PASSWORD_PATTERN_ERROR }

export const clientRegistrationSchema = z
	.object({
		name: z.string().min(1, 'Укажите имя и фамилию'),
		phone: z.string().min(10, 'Слишком короткий номер'),
		password: z.string().min(6, 'Пароль должен быть минимум 6 символов').regex(PASSWORD_REGEX, PASSWORD_PATTERN_ERROR),
		password_confirmation: z.string(),
		region_id: z.number({
			required_error: 'Выберите регион',
			invalid_type_error: 'Выберите регион',
		}),
		language: z.enum(['ru', 'en', 'kz']).default('ru'),
	})
	.superRefine(({ password, password_confirmation }, ctx) => {
		if (password !== password_confirmation) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Пароли не совпадают',
				path: ['password_confirmation'],
			})
		}
	})

export type ClientRegistrationFormType = z.infer<typeof clientRegistrationSchema>

export const lawyerRegistrationSchema = z
	.object({
		name: z.string().min(1, 'Укажите ФИО'),
		phone: z.string().min(10, 'Слишком короткий номер'),
		password: z.string().min(6, 'Пароль должен быть минимум 6 символов').regex(PASSWORD_REGEX, PASSWORD_PATTERN_ERROR),
		password_confirmation: z.string(),
		region_id: z.number({
			required_error: 'Выберите регион',
			invalid_type_error: 'Выберите регион',
		}),
		language: z.enum(['ru', 'en', 'kz']).default('ru'),
		iin: z.string().min(10, 'Укажите ИИН'),
		lawyer_type_id: z.number(),
	})
	.superRefine(({ password, password_confirmation }, ctx) => {
		if (password !== password_confirmation) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Пароли не совпадают',
				path: ['password_confirmation'],
			})
		}
	})

export type LawyerRegistrationFormType = z.infer<typeof lawyerRegistrationSchema>

export const loginSchema = z.object({
	phone: z.string().min(10, 'Слишком короткий номер'),
	password: z.string().min(6, 'Пароль должен быть минимум 6 символов').regex(PASSWORD_REGEX, PASSWORD_PATTERN_ERROR),
})

export type LoginSchemaType = z.infer<typeof loginSchema>

export const createApplicationSchema = z.object({
	description: z
		.string({
			required_error: 'Опишите заявку',
			invalid_type_error: 'Опишите заявку',
		})
		.min(10, 'Описание слишком короткое'),
	tag_id: z.union([z.number(), z.null()]).optional(),
	region_id: z.number({
		required_error: 'Выберите регион или город',
		invalid_type_error: 'Выберите регион или город',
	}),
})

export type CreateApplicationSchemaType = z.infer<typeof createApplicationSchema>
