"use client"

import React from 'react'
import { useLocale } from 'next-intl'

import s from './LocalVideoSection.module.scss'

type LocalizedNode = React.ReactNode | { ru?: React.ReactNode; kz?: React.ReactNode }

type VideoItem = {
	src: string
	poster?: string
	autoPlay?: boolean
	loop?: boolean
	muted?: boolean
	description?: LocalizedNode
}

export type LocalVideoSectionProps = {
	videos: VideoItem[]
	description?: LocalizedNode
	heading?: LocalizedNode
	autoPlay?: boolean
	loop?: boolean
	muted?: boolean
	boxRatio?: string
	perPage?: number
}

export const LocalVideoSection: React.FC<LocalVideoSectionProps> = ({
	videos = [],
	description,
	heading,
	autoPlay = false,
	loop = false,
	muted = false,
	boxRatio = '16/9',
	perPage = 3,
}) => {
	const locale = useLocale()
	const items = videos

	const resolveLocalized = React.useCallback(
		(value?: LocalizedNode): React.ReactNode => {
			if (value == null) return null
			if (typeof value === 'string' || typeof value === 'number') return value
			if (Array.isArray(value)) return value
			if (React.isValidElement(value)) return value

			const dict = value as { [key: string]: React.ReactNode | undefined }
			return dict[locale] ?? dict.ru ?? dict.kz ?? Object.values(dict).find(Boolean) ?? null
		},
		[locale]
	)

	const buildMp4Sources = React.useCallback((src: string) => {
		const variants = [src]
		if (/\.mp4$/i.test(src)) {
			variants.push(src.replace(/\.mp4$/i, '.MP4'))
		}
		return Array.from(new Set(variants))
	}, [])

	const safePerPage = Math.max(1, perPage)
	const totalPages = Math.ceil(items.length / safePerPage)
	const [currentPage, setCurrentPage] = React.useState(0)

	React.useEffect(() => {
		setCurrentPage((prev) => Math.min(prev, Math.max(totalPages - 1, 0)))
	}, [totalPages])

	if (items.length === 0) {
		return null
	}

	const start = currentPage * safePerPage
	const pageItems = items.slice(start, start + safePerPage)
	const headingNode = resolveLocalized(heading) ?? 'ZANGER ВИДЕО'
	const descriptionNode = resolveLocalized(description)
	const ratioStyle = { '--ratio': boxRatio } as React.CSSProperties
	const isFirstPage = currentPage === 0
	const isLastPage = currentPage >= totalPages - 1

	const goPrev = () => setCurrentPage((prev) => Math.max(0, prev - 1))
	const goNext = () => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))

	return (
		<section id="videos" className={s.wrapper}>
			<div className={s.container}>
				<div className={s.header}>
					<h2 className={s.title}>{headingNode}</h2>
					{descriptionNode ? <p className={s.description}>{descriptionNode}</p> : null}
				</div>

				<div className={s.cardsWithArrows}>
					<button
						type="button"
						className={`${s.navButton} ${s.sideNavButton}`}
						onClick={goPrev}
						disabled={isFirstPage}
						aria-label="Previous page"
					>
						<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none">
							<path
								d="M15 18L9 12L15 6"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</button>

					<div className={s.grid}>
						{pageItems.map((video, index) => (
							<article key={`${video.src}-${start + index}`} className={s.card}>
								<div className={s.media} style={ratioStyle}>
									<video
										className={s.video}
										poster={video.poster}
										controls
										playsInline
										preload="metadata"
										autoPlay={video.autoPlay ?? autoPlay}
										loop={video.loop ?? loop}
										muted={video.muted ?? muted}
									>
										{buildMp4Sources(video.src).map((source) => (
											<source key={source} src={source} type="video/mp4" />
										))}
										Your browser does not support embedded videos.
									</video>
								</div>
								{video.description ? (
									<p className={s.cardDescription}>{resolveLocalized(video.description)}</p>
								) : null}
							</article>
						))}
					</div>

					<button
						type="button"
						className={`${s.navButton} ${s.sideNavButton}`}
						onClick={goNext}
						disabled={isLastPage}
						aria-label="Next page"
					>
						<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none">
							<path
								d="M9 18L15 12L9 6"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</button>
				</div>

				<div className={s.pagination}>
					<button
						type="button"
						className={`${s.navButton} ${s.mobileNavButton}`}
						onClick={goPrev}
						disabled={isFirstPage}
						aria-label="Previous page"
					>
						<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none">
							<path
								d="M15 18L9 12L15 6"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</button>
					<div className={s.paginationDots} aria-label="Pages">
						{Array.from({ length: Math.max(totalPages, 1) }).map((_, index) => (
							<button
								key={index}
								type="button"
								className={`${s.paginationDot} ${index === currentPage ? s.active : ''}`}
								onClick={() => setCurrentPage(index)}
								aria-label={`Page ${index + 1}`}
							/>
						))}
					</div>
					<button
						type="button"
						className={`${s.navButton} ${s.mobileNavButton}`}
						onClick={goNext}
						disabled={isLastPage}
						aria-label="Next page"
					>
						<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none">
							<path
								d="M9 18L15 12L9 6"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</button>
				</div>
			</div>
		</section>
	)
}
