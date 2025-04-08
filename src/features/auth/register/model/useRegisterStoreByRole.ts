import { useClientRegisterForm, useLawyerRegisterForm } from '@/features/auth/register'

export const useRegisterFormByVariant = (variant: 'client' | 'lawyer') => {
	const client = useClientRegisterForm()
	const lawyer = useLawyerRegisterForm()

	return variant === 'client' ? client : lawyer
}
