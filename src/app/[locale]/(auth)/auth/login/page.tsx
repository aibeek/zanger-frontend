import { Login } from '@/features/auth/login'

import s from './page.module.scss'

export default function LoginPage() {
	return (
		<div className={s.page}>
			<Login />
		</div>
	)
}
