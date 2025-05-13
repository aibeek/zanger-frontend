import { useTranslations } from 'next-intl'
import { mapServerError } from '@/shared/lib/helpers/mapServerError'

export const useFormError = (error: any, formErrors: any) => {
	const t = useTranslations()

	const formErrorMessage = formErrors.phone?.message || null
	const errorMessageKey = error ? mapServerError(error) : null
	const genericErrorMessage = !errorMessageKey && error ? t('errors.genericError') : null

	const translatedError = formErrorMessage
		? t(formErrorMessage)
		: errorMessageKey
		? t(`errors.${errorMessageKey}`)
		: genericErrorMessage

	return {
		formErrorMessage,
		errorMessageKey,
		genericErrorMessage,
		translatedError,
	}
}
