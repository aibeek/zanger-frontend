import { Login } from '@/features/auth/login'
import { AuthShell } from '@/widgets/AuthShell'
import Image from 'next/image'
import { Link } from '@/i18n'

export default function LoginPage() {
    return (
        <AuthShell
            rightHeader={(
                <div
                    style={{
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                    }}
                >
                    {/* Центр: лого + текст */}
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
                        <Image src="/logo.svg" alt="Zanger" width={28} height={28} />
                        <span style={{ fontWeight: 700, color: '#1f2937', letterSpacing: '.5px' }}>ZANGER</span>
                    </div>

                    {/* Правый верх: ссылка регистрации */}
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <span style={{ color: '#6b7280', marginRight: 8 }}>Нет аккаунта?</span>
                        <Link href="/auth/register/select-role" style={{ color: '#2563eb', fontWeight: 600 }}>
                            Зарегистрироваться
                        </Link>
                    </div>
                </div>
            )}
        >
            <Login />
        </AuthShell>
    )
}