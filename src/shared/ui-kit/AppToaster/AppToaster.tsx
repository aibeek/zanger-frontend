'use client'

import { Toaster } from 'react-hot-toast'

export const AppToaster = () => {
	return (
		<Toaster
			toastOptions={{
				className: 'toast',
				duration: 5000,
				removeDelay: 1000,
				style: {
					fontWeight: '500',
					fontSize: '14px',
					lineHeight: '16px',
					color: 'rgba(55, 55, 55, 1)',
					maxWidth: '250px',
					minWidth: '250px',
				},
				success: {
					style: {
						backgroundColor: 'rgba(231, 244, 232, 1)',
					},
				},
				error: {
					style: {
						backgroundColor: '#ffafaf',
					},
				},
			}}
			position="top-right"
		/>
	)
}
