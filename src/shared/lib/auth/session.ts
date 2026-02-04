import Cookies from 'js-cookie'

import { tokenService } from '@/shared/api/tokenService'

export const performLogout = () => {
	tokenService.clearToken()
	Cookies.remove('role')
	localStorage.removeItem('personalData')
}
