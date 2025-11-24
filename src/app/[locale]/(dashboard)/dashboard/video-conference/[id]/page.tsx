'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, usePathname, useParams } from 'next/navigation'
import Image from 'next/image'
import Cookies from 'js-cookie'
import { useTranslations } from 'next-intl'
import { Button } from '@/shared/ui-kit'
import { httpClientWithAuth } from '@/shared/api/httpClient'
import { useLoginStore } from '@/features/auth/login'
import s from '../page.module.scss'

export default function VideoConferenceLinkPage() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams() as { id?: string }
  const languageMatch = pathname.match(/^\/(\w{2})\//)
  const language = (languageMatch?.[1] || 'ru') as string
  const t = useTranslations('footer.sections')

  const [conferenceId, setConferenceId] = useState('')
  const [userId, setUserId] = useState('')
  const [joining, setJoining] = useState(false)
  const [connectedInfo, setConnectedInfo] = useState<null | { room: string; is_member: boolean; topic?: string; identity?: string }>(null)
  const [error, setError] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const remoteContainerRef = useRef<HTMLDivElement | null>(null)

  const roomRef = useRef<any>(null)
  const BASE = 'https://api.zanger-app.kz/api/livekit'
  const [cameraOn, setCameraOn] = useState(false)
  const [micOn, setMicOn] = useState(false)
  const [canPublish, setCanPublish] = useState(false)
  const [conf, setConf] = useState<{ topic?: string; planned_time?: string; code?: string } | null>(null)
  const personalData = useLoginStore((s) => s.personalData)

  useEffect(() => {
    const role = Cookies.get('role')
    if (role !== 'lawyer') {
      router.replace(`/${language}/dashboard/main`)
    }
  }, [router, language])

  useEffect(() => {
    const uid = (personalData as any)?.id
    if (uid) setUserId(String(uid))
  }, [personalData])

  useEffect(() => {
    const cid = String(params?.id || '')
    if (cid) setConferenceId(cid)
  }, [params])

  useEffect(() => { if (conferenceId) { loadConference(); probeMembership(); } }, [conferenceId, userId])

  async function loadConference() {
    try {
      const res = await httpClientWithAuth<any>(`${BASE}/conferences`, { method: 'GET' })
      const items = Array.isArray(res?.items) ? res.items : []
      const found = items.find((i: any) => String(i.id) === conferenceId)
      if (found) setConf({ topic: found.topic, planned_time: String(found.planned_time), code: String(found.code || '') })
    } catch {}
  }

  async function probeMembership() {
    if (!conferenceId || !userId) return
    try {
      const data = await httpClientWithAuth<any>(`${BASE}/join`, {
        method: 'POST',
        body: JSON.stringify({ conference_id: conferenceId, user_id: Number(userId) }),
      })
      setCanPublish(Boolean(data?.canPublish))
    } catch {}
  }

  async function ensureLiveKit() {
    const w = window as any
    if (w.LivekitClient || w.LiveKit) return
    await new Promise<void>((resolve, reject) => {
      const s = document.createElement('script')
      s.src = 'https://cdn.jsdelivr.net/npm/livekit-client@latest/dist/livekit-client.umd.min.js'
      s.onload = () => resolve()
      s.onerror = () => reject(new Error('Failed to load LiveKit SDK'))
      document.body.appendChild(s)
    })
  }

  async function joinRoom() {
    if (!conferenceId) return
    setError(null)
    setJoining(true)
    try {
      const data = await httpClientWithAuth<any>(`${BASE}/join`, {
        method: 'POST',
        body: JSON.stringify({ conference_id: conferenceId, user_id: Number(userId || (personalData as any)?.id || 0) }),
      })
      const { token, url, canPublish: canPub, identity, topic: tp } = data
      setCanPublish(Boolean(canPub))

      await ensureLiveKit()
      const LKC = (window as any).LivekitClient || (window as any).LiveKit
      const { Room, RoomEvent, Track } = LKC

      const room = new Room()
      roomRef.current = room

      room.on(RoomEvent.TrackSubscribed, (track: any) => {
        const el = track.attach()
        el.autoplay = true
        el.playsInline = true
        remoteContainerRef.current?.appendChild(el)
      })

      room.on(RoomEvent.TrackUnsubscribed, track => {
        track.detach().forEach((el: any) => el.remove())
      })

      await room.connect(url, token)

      setConnectedInfo({ room: room.name, is_member: canPublish, topic: tp, identity })
    } catch (e: any) {
      setError(e?.message || 'Ошибка подключения')
    } finally {
      setJoining(false)
    }
  }

  // отключено авто-подключение — соответствуем дизайну (кнопка «Присоединиться»/«Запустить прямой эфир»)

  async function toggleCamera() {
    try {
      const room = roomRef.current
      if (!room) return
      await room.localParticipant.setCameraEnabled(!cameraOn)
      setCameraOn(!cameraOn)
      const LKC = (window as any).LivekitClient || (window as any).LiveKit
      const { Track } = LKC
      const camPub = room.localParticipant.getTrackPublication(Track.Source.Camera)
      if (camPub?.videoTrack && videoRef.current) {
        camPub.videoTrack.attach(videoRef.current)
      }
    } catch {}
  }

  async function toggleMic() {
    try {
      const room = roomRef.current
      if (!room) return
      await room.localParticipant.setMicrophoneEnabled(!micOn)
      setMicOn(!micOn)
    } catch {}
  }

  function leaveRoom() {
    try {
      roomRef.current?.disconnect()
    } catch {}
    roomRef.current = null
    setConnectedInfo(null)
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    if (remoteContainerRef.current) {
      remoteContainerRef.current.innerHTML = ''
    }
  }

  return (
    <div className={s.container}>
      <div className={s.content}>
        <div className={s.titleRow}>
          <h2><Image src="/assets/icons/myconf.svg" alt={canPublish ? 'Создайте встречу' : 'Вход в конференцию'} width={20} height={20} />{canPublish ? 'Создайте встречу' : 'Вход в конференцию'}</h2>
        </div>

        <div className={s.placeholder}>
          {connectedInfo ? (
            <div className={s.videoContainer}>
              <video ref={videoRef} autoPlay muted playsInline />
              <div ref={remoteContainerRef} className={s.remoteGrid}></div>
              <div className={s.actions}>
                <Button variant="secondary" onClick={toggleCamera}>{cameraOn ? 'Выключить камеру' : 'Включить камеру'}</Button>
                <Button variant="secondary" onClick={toggleMic}>{micOn ? 'Выключить микрофон' : 'Включить микрофон'}</Button>
              </div>
            </div>
          ) : (
            <div className={s.videoContainer}>
            </div>
          )}
        </div>
        <div className={s.vcLayoutRow}>
          <div></div>
          <aside className={s.vcRight}>
            <div className={s.vcFieldBlock}>
              <input className={s.vcInput} placeholder="Тема конференции" defaultValue={conf?.topic || ''} />
            </div>
            <div className={s.vcInfo}>
              <div className={s.vcInfoRow}>Код конференции: <b>{conferenceId}</b> <button className={s.vcCopy} onClick={() => navigator.clipboard.writeText(conferenceId)} aria-label="copy" /></div>
              <div className={s.vcInfoRow}>или</div>
              <div className={s.vcInfoRow}>Пригласить по ссылке: <a className={s.vcLink} onClick={() => navigator.clipboard.writeText(String(conf?.code || ''))}>скопировать</a></div>
            </div>
            <div className={s.vcActionsRight}>
              {canPublish ? (
                <Button variant="primary" onClick={async () => { try { await httpClientWithAuth(`${BASE}/rooms`, { method: 'POST', body: JSON.stringify({ conference_id: conferenceId }) }); await joinRoom(); } catch (e) {} }}>Запустить прямой эфир</Button>
              ) : (
                <Button variant="primary" onClick={joinRoom}>Присоединиться</Button>
              )}
              <Button variant="secondary" onClick={() => { try { roomRef.current?.disconnect(); } catch {}; router.push(`/${language}/dashboard/video-conference`) }}>Выйти</Button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

