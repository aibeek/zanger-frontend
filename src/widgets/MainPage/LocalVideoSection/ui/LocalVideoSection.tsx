"use client"

import React from 'react'
import s from './LocalVideoSection.module.scss'

type VideoItem = {
  src: string
  poster?: string
  autoPlay?: boolean
  loop?: boolean
  muted?: boolean
  description?: React.ReactNode
}

export type LocalVideoSectionProps = {
  videos: VideoItem[]
  description?: React.ReactNode
  // Default behavior applied to all videos when per-item settings aren't provided
  autoPlay?: boolean
  loop?: boolean
  muted?: boolean
  // Visual container aspect ratio for each video card (e.g., '9/16', '16/9', '1/1')
  boxRatio?: string
}

export const LocalVideoSection: React.FC<LocalVideoSectionProps> = ({
  videos = [],
  description,
  autoPlay = false,
  loop = false,
  muted = false,
  boxRatio = '16/9',
}) => {
  return (
    <section className={s.wrapper}>
      <div className={s.inner}>
        <div className={s.grid}>
          {videos.map((v, idx) => (
            <div key={idx} className={s.card}>
              <div
                className={s.box}
                style={{ ['--ratio' as any]: boxRatio }}
              >
                <video
                  className={s.video}
                  src={v.src}
                  poster={v.poster}
                  controls
                  playsInline
                  preload="metadata"
                  autoPlay={v.autoPlay ?? autoPlay}
                  loop={v.loop ?? loop}
                  muted={v.muted ?? muted}
                >
                  Your browser does not support embedded videos.
                </video>
              </div>
              {v.description ? (
                <p className={s.cardDescription}>{v.description}</p>
              ) : null}
            </div>
          ))}
        </div>
        {description ? <p className={s.description}>{description}</p> : null}
      </div>
    </section>
  )
}
