'use client'

import { RotateLoader } from 'react-spinners'

export function Loader() {
	return (
		<div style={{ position: 'absolute', inset: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
			<RotateLoader color={'rgba(2, 125, 255, 1)'} />
		</div>
	)
}
