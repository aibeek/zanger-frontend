import { getTranslations } from 'next-intl/server'
import { UserRoleSelectionStep } from '@/features/auth/register'
import { AuthShell } from '@/widgets/AuthShell'

export default async function SelectRole() {
	const t = await getTranslations('auth.roleSelection')

	return (
		<AuthShell
			// title={t('heading', { default: 'Ваш статус' } as any) || 'Ваш статус'}
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
