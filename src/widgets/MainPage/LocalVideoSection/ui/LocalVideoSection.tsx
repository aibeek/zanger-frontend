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
  // New: optional heading displayed above the grid
  heading?: LocalizedNode
  // Default behavior applied to all videos when per-item settings aren't provided
  autoPlay?: boolean
  loop?: boolean
  muted?: boolean
  // Visual container aspect ratio for each video card (e.g., '9/16', '16/9', '1/1')
  boxRatio?: string
  // New: items per page for pagination (default 3)
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

  const resolveLocalized = React.useCallback(
    (value?: LocalizedNode): React.ReactNode => {
      if (value == null) return null
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value as any
      if (Array.isArray(value)) return value as any
      if (React.isValidElement(value)) return value
      if (typeof value === 'object') {
        const dict = value as { [k: string]: React.ReactNode | undefined }
        // Preferred locale
        if (dict[locale]) return dict[locale]
        // Fallbacks: ru -> kz -> first available
        if (dict['ru']) return dict['ru']
        if (dict['kz']) return dict['kz']
        const firstKey = Object.keys(dict)[0]
        return firstKey ? dict[firstKey] ?? null : null
      }
      return null
    },
    [locale]
  )
  // Ensure erzhan.mp4 is FIRST: move to front if provided, otherwise prepend
  const items = React.useMemo(() => {
    const list = [...videos]
    const idx = list.findIndex(v => v.src?.toLowerCase().includes('erzhan.mp4'))
    if (idx >= 0) {
      const [erzhan] = list.splice(idx, 1)
      return [erzhan, ...list]
    }
    // Fallback path from current project usage
    const erzhanFallback: VideoItem = { src: '/assets/images/erzhan.mp4' }
    return [erzhanFallback, ...list]
  }, [videos])

  // Build a few common fallbacks for potential path/case issues
  const buildMp4Sources = React.useCallback((src: string) => {
    const list = [
      src,
      src.replace(/\.mp4$/i, '.MP4'),
      src.replace('/assets/videos/', '/videos/'),
      src.replace('/assets/videos/', '/assets/'),
    ]
    return Array.from(new Set(list))
  }, [])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(items.length / perPage))
  const [currentPage, setCurrentPage] = React.useState(0)
  React.useEffect(() => {
    setCurrentPage(p => Math.min(p, totalPages - 1))
  }, [totalPages])
  const start = currentPage * perPage
  const pageItems = items.slice(start, start + perPage)

  return (
    <section className={s.wrapper}>
      <div className={s.inner}>
        {/* Top header (first): title + small text */}
        {(heading || description) && (
          <div className={s.header}>
            {heading ? <h2 className={s.title}>{resolveLocalized(heading)}</h2> : null}
            {description ? <p className={s.description}>{resolveLocalized(description)}</p> : null}
          </div>
        )}

        <div className={s.grid}>
          {pageItems.map((v, idx) => (
            <div key={`${currentPage}-${idx}`} className={s.card}>
              <div
                className={s.box}
                style={{ ['--ratio' as any]: boxRatio }}
              >
                <video
                  className={s.video}
                  // src removed in favor of explicit <source> tags with proper MIME
                  poster={v.poster}
                  controls
                  playsInline
                  preload="metadata"
                  autoPlay={v.autoPlay ?? autoPlay}
                  loop={v.loop ?? loop}
                  muted={v.muted ?? muted}
                  onError={(e) => {
                    // Helps identify 404/MIME/codec problems in DevTools
                    const el = e.currentTarget as HTMLVideoElement
                    console.warn('Video failed to load:', { src: v.src, currentSrc: el.currentSrc })
                  }}
                >
                  {buildMp4Sources(v.src).map((srcVar) => (
                    <source key={srcVar} src={srcVar} type="video/mp4" />
                  ))}
                  Your browser does not support embedded videos.
                </video>
              </div>
              {v.description ? (
                <p className={s.cardDescription}>{resolveLocalized(v.description)}</p>
              ) : null}
            </div>
          ))}
        </div>

        {/* Pagination controls with normal buttons */}
        {totalPages > 1 && (
          <div className={s.pagination}>
            <button
              type="button"
              className={s.pageBtn}
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              aria-label="Previous page"
            >
              Назад
            </button>
            <span className={s.pageInfo}>
              {currentPage + 1} / {totalPages}
            </span>
            <button
              type="button"
              className={s.pageBtn}
              onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage === totalPages - 1}
              aria-label="Next page"
            >
              Далее
            </button>
          </div>
        )}

        {/* Bottom description removed to keep text first */}
        {/* ...existing code... */}
      </div>
    </section>
  )
}
