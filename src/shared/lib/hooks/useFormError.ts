import { useTranslations } from 'next-intl'
import { mapServerError } from '../helpers/mapServerError'

export const useFormError = (error: any, formErrors: any) => {
	const t = useTranslations()

	const translatedFieldErrors: Record<string, string> = {}
	for (const key in formErrors) {
		const message = formErrors[key]?.message
		if (message) {
			translatedFieldErrors[key] = t(message)
		}
	}

	let translatedServerError = null

	if (error) {
		if (typeof error === 'object' && error.code) {
			if (error.code === 422) {
				translatedServerError = error.message || t('errors.validation_error')
			} else {
				const errorMessageKey = mapServerError(error)
				translatedServerError = errorMessageKey ? t(`errors.${errorMessageKey}`) : t('errors.genericError')
			}
		} else if (typeof error === 'string') {
			translatedServerError = error
		} else {
			translatedServerError = t('errors.genericError')
		}
	}

	return {
		translatedFieldErrors,
		translatedServerError,
	}
}
