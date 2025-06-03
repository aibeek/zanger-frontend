import { useClientRegisterForm, useLawyerRegisterForm } from '@/features/auth/register'
import { RoleVariant } from '@/shared/lib'

export const useRegisterFormByVariant = (variant: RoleVariant) => {
	const client = useClientRegisterForm()
	const lawyer = useLawyerRegisterForm()

	return variant === 'client' ? client : lawyer
}
