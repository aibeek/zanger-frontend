import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n'
import { UserRoleSelectionStep } from '@/features/auth/register'
import { AuthShell } from '@/widgets/AuthShell'

export default function SelectRole() {
	const t = useTranslations('auth.roleSelection')

	return (
		<AuthShell
			rightHeader={(
				<div className="panelHeader">
					<div className="panelBrand" style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
						<Image src="/logo.svg" alt="Zanger" width={28} height={28} />
						<span style={{ fontWeight: 700, color: '#1f2937', letterSpacing: '.5px' }}>ZANGER</span>
					</div>
					<div>
						<span style={{ color: '#6b7280', marginRight: 8 }}>Есть аккаунт?</span>
						<Link href="/auth/login" className="loginAnchor">Вход</Link>
					</div>
				</div>
			)}
		>
			<h1 style={{ fontSize: 28, color: '#2563eb', fontWeight: 800, margin: '16px 0 20px', display: 'inline-block', padding: '6px 12px', borderRadius: 6, background: 'rgba(37, 99, 235, 0.12)', border: '1px solid rgba(37, 99, 235, 0.32)' }}>
				{t('heading', { default: 'Ваш статус' } as any) || 'Ваш статус'}
			</h1>

			<UserRoleSelectionStep />

			<p style={{ marginTop: 28, color: '#6b7280', fontSize: 12 }}>
				Создавая аккаунт, вы подтверждаете, что ознакомились и принимаете{' '}
				<Link href="#" style={{ color: '#0f62fe', textDecoration: 'underline' }}>Политику конфиденциальности</Link>{' '}
				и{' '}
				<Link href="#" style={{ color: '#0f62fe', textDecoration: 'underline' }}>Публичную оферту</Link>
			</p>
		</AuthShell>
	)
}
