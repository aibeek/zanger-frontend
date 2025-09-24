import { useTranslations } from 'next-intl'
import { UserRoleSelectionStep } from '@/features/auth/register'
import { AuthShell } from '@/widgets/AuthShell'

export default function SelectRole() {
	const t = useTranslations('auth.roleSelection')

	return (
		<AuthShell
			title={t('heading', { default: 'Ваш статус' } as any) || 'Ваш статус'}
			showNavigation={true}
			navigationText="Есть аккаунт?"
			navigationLinkText="Вход"
			navigationLinkHref="/auth/login"
			showDisclaimer={true}
		>
			<UserRoleSelectionStep />
		</AuthShell>
	)
}
