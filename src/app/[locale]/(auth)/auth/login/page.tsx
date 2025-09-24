import { Login } from '@/features/auth/login'
import { AuthShell } from '@/widgets/AuthShell'

export default function LoginPage() {
    return (
        <AuthShell
            title="Вход в систему"
            showNavigation={true}
            navigationText="Нет аккаунта?"
            navigationLinkText="Зарегистрироваться"
            navigationLinkHref="/auth/register/select-role"
        >
            <Login />
        </AuthShell>
    )
}