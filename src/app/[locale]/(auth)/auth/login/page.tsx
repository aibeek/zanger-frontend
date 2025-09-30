import { useTranslations } from 'next-intl'
import { Login } from '@/features/auth/login'
import { AuthShell } from '@/widgets/AuthShell'

export default function LoginPage() {
    const t = useTranslations('auth')
    
    return (
        <AuthShell
            showNavigation={true}
            navigationText={t('shell.noAccount')}
            navigationLinkText={t('shell.registerLink')}
            navigationLinkHref="/auth/register/select-role"
        >
            <Login />
        </AuthShell>
    )
}