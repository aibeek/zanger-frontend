'use client'

import { useTranslations } from 'next-intl'
import { UserRoleSelectionStep } from '@/features/auth/register'
import { AuthShell } from '@/widgets/AuthShell'

export default function SelectRole() {
	const t = useTranslations('auth')
	const shell = useTranslations('auth.shell')

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
