'use client'

import Image from 'next/image'

export function Resolver() {
	return (
		<div
			style={{
				backgroundColor: 'rgba(2, 125, 255, 1)',
				height: '100vh',
				position: 'absolute',
				inset: '0',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				zIndex: '10000',
			}}>
			<Image
				src={'/logo.svg'}
				alt={'logo'}
				width={200}
				height={200}
			/>
		</div>
	)
}
