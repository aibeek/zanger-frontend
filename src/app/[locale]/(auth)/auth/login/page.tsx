import { Login } from '@/features/auth/login'
import { AuthShell } from '@/widgets/AuthShell'
import Image from 'next/image'
import { Link } from '@/i18n'

export default function LoginPage() {
	return (
		<AuthShell
			rightHeader={(
				<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
					<div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
						<Image src="/logo.svg" alt="Zanger" width={28} height={28} />
						<span style={{ fontWeight: 700, color: '#1f2937', letterSpacing: '.5px' }}>ZANGER</span>
					</div>
					<div>
						<span style={{ color: '#6b7280', marginRight: 8 }}>Нет аккаунта?</span>
						<Link href="/auth/register/select-role" style={{ color: '#2563eb', fontWeight: 600 }}>Зарегистрироваться</Link>
					</div>
				</div>
			)}
		>
			<Login />
		</AuthShell>
	)
}
