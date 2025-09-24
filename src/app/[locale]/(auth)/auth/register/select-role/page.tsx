import { getTranslations } from 'next-intl/server'
import { UserRoleSelectionStep } from '@/features/auth/register'
import { AuthShell } from '@/widgets/AuthShell'

export default async function SelectRole() {
	const t = await getTranslations('auth')
	const shell = await getTranslations('auth.shell')

	return (
		<AuthShell
			showNavigation={true}
			navigationText={shell('haveAccount')}
			navigationLinkText={shell('loginLink')}
			navigationLinkHref="/auth/login"
		>
			<UserRoleSelectionStep />
		</AuthShell>
	)
}
