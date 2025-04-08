import { UserRoleSelectionStep } from '@/features/auth/register'

import s from './page.module.scss'

interface pageProps {
	className?: string
}

export default function SelectRole({}: pageProps) {
	return (
		<div className={s.page}>
			<UserRoleSelectionStep />
		</div>
	)
}
