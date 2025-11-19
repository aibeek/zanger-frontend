'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import Cookies from 'js-cookie'
import { useTranslations } from 'next-intl'
import { Button } from '@/shared/ui-kit'
import { RightWidgets } from '../components/RightWidgets'
import { httpClientWithAuth } from '@/shared/api/httpClient'
import { useLoginStore } from '@/features/auth/login'
import s from './page.module.scss'

export default function VideoConferencePage() {
  const router = useRouter()
  const pathname = usePathname()
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
  const [participants, setParticipants] = useState<any[]>([])
  const [kickUserId, setKickUserId] = useState('')
  const BASE = 'https://api.zanger-app.kz/api/livekit'
  const [joinMode, setJoinMode] = useState<'manual' | 'api'>('manual')
  const [manualUrl, setManualUrl] = useState('wss://video.zanger-app.kz')
  const [manualToken, setManualToken] = useState('')
  const personalData = useLoginStore((s) => s.personalData)

  useEffect(() => {
    const role = Cookies.get('role')
    if (role !== 'lawyer') {
      router.replace(`/${language}/dashboard/main`)
    }
  }, [router, language])

  const isLawyer = Boolean((personalData as any)?.role_id?.code === 'lawyer')

  useEffect(() => {
    const uid = (personalData as any)?.id
    if (uid) setUserId(String(uid))
  }, [personalData])


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
    if (!conferenceId) {
      setError('Введите conference_id')
      return
    }

    setError(null)
    setJoining(true)

    try {
      const data = await httpClientWithAuth<any>(`${BASE}/join`, {
        method: 'POST',
        body: JSON.stringify({ conference_id: conferenceId, user_id: Number(userId || (personalData as any)?.id || 0) }),
      })
      const { token, url, canPublish, identity, topic: tp } = data

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

      if (canPublish) {
        await room.localParticipant.setCameraEnabled(true)
        await room.localParticipant.setMicrophoneEnabled(true)

        const camPub = room.localParticipant.getTrackPublication(Track.Source.Camera)
        if (camPub?.videoTrack && videoRef.current) {
          camPub.videoTrack.attach(videoRef.current)
        }
      }

      setConnectedInfo({ room: room.name, is_member: canPublish, topic: tp, identity })

    } catch (e: any) {
      setError(e?.message || 'Ошибка подключения')
    } finally {
      setJoining(false)
    }
  }

  async function joinByToken() {
    if (!manualUrl || !manualToken) {
      setError('Введите Server URL и Token')
      return
    }
    setError(null)
    setJoining(true)
    try {
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
      await room.connect(manualUrl, manualToken)
      try {
        await room.localParticipant.setCameraEnabled(true)
        await room.localParticipant.setMicrophoneEnabled(true)
        const camPub = room.localParticipant.getTrackPublication(Track.Source.Camera)
        if (camPub?.videoTrack && videoRef.current) {
          camPub.videoTrack.attach(videoRef.current)
        }
      } catch {}
      setConnectedInfo({ room: room.name, is_member: true })
    } catch (e: any) {
      setError(e?.message || 'Ошибка подключения по токену')
    } finally {
      setJoining(false)
    }
  }

  async function createRoom() {
    if (!conferenceId) {
      setError('Введите conference_id')
      return
    }
    setError(null)
    try {
      await httpClientWithAuth(`${BASE}/rooms`, {
        method: 'POST',
        body: JSON.stringify({ conference_id: conferenceId }),
      })
    } catch (e: any) {
      setError(e?.message || 'Ошибка создания комнаты')
    }
  }


  async function loadParticipants() {
    if (!conferenceId) return
    try {
      const query = new URLSearchParams({ conference_id: conferenceId }).toString()
      const res = await httpClientWithAuth<any>(`${BASE}/participants?${query}`, { method: 'GET' })
      const list = Array.isArray(res?.participants) ? res.participants : res?.data || []
      setParticipants(list)
    } catch (e) {}
  }

  async function kick() {
    if (!conferenceId || !kickUserId) return
    try {
      await httpClientWithAuth(`${BASE}/kick`, {
        method: 'POST',
        body: JSON.stringify({ conference_id: conferenceId, user_id: Number(kickUserId) }),
      })
      await loadParticipants()
    } catch (e) {}
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


  useEffect(() => {
    ;(window as any).lkLeave = leaveRoom
  }, [])


  return (
    <div className={s.container}>
      <div className={s.content}>
        <div className={s.titleRow}>
          <h2><Image src="/assets/icons/myconf.svg" alt="Мои конференции" width={20} height={20} />Мои конференции</h2>

          <div className={s.actions}>
            {connectedInfo && <Button variant="primary" onClick={leaveRoom}>Выйти</Button>}
          </div>
        </div>

        <div className={s.actionBar}>
          <button className={`${s.pill} ${s.pillRed}`}> 
            <span className={s.pillIconLive}></span>
            <span className={s.pillText}>Запустить эфир</span>
          </button>
          <button className={`${s.pill} ${s.pillGreen}`}> 
            <span className={s.pillIconPlus}></span>
            <span className={s.pillText}>Создать встречу</span>
          </button>
          <div className={s.codeInput}>
            <input type="text" placeholder="Введите код или ссылку" />
            <button className={s.sendBtn} aria-label="Отправить"></button>
          </div>
        </div>


        <div className={s.placeholder}>
          {!connectedInfo ? (
            <div className={s.joinForm}>
              <div className={s.segmented}>
                <button className={joinMode === 'manual' ? s.segmentActive : s.segment} onClick={() => setJoinMode('manual')}>Войти по токену</button>
                <button className={joinMode === 'api' ? s.segmentActive : s.segment} onClick={() => setJoinMode('api')}>Войти через API</button>
              </div>

              {joinMode === 'manual' ? (
                <>
                  <div className={s.fieldRow}>
                    <div className={s.field}>
                      <label>Server URL</label>
                      <input type="text" value={manualUrl} onChange={e => setManualUrl(e.target.value)} />
                    </div>
                    <div className={s.field}>
                      <label>Token</label>
                      <input type="text" value={manualToken} onChange={e => setManualToken(e.target.value)} />
                    </div>
                  </div>
                  <div className={s.fieldRow}>
                    <Button variant="primary" disabled={joining} onClick={joinByToken}>{joining ? 'Подключение...' : 'Войти'}</Button>
                  </div>
                </>
              ) : (
                <>
                  <div className={s.fieldRow}>
                    <div className={s.field}>
                      <label>conference_id (UUID)</label>
                      <input type="text" value={conferenceId} onChange={e => setConferenceId(e.target.value)} />
                    </div>
                    {!isLawyer && (
                      <div className={s.field}>
                        <label>user_id (число)</label>
                        <input type="number" value={userId} onChange={e => setUserId(e.target.value)} />
                      </div>
                    )}
                  </div>
                  <div className={s.fieldRow}>
                    <Button variant="secondary" onClick={createRoom}>Создать комнату</Button>
                    <Button variant="primary" disabled={joining} onClick={joinRoom}>{joining ? 'Подключение...' : 'Войти в комнату'}</Button>
                  </div>
                </>
              )}

              {error && <div className={s.error}>{error}</div>}
            </div>
          ) : (
            <div className={s.videoContainer}>
              <video ref={videoRef} autoPlay muted playsInline />
              <div ref={remoteContainerRef} className={s.remoteGrid}></div>

              <div className={s.status}>Комната: {connectedInfo.room} • Участник: {String(connectedInfo.is_member)} • Identity: {connectedInfo.identity} • Тема: {connectedInfo.topic}</div>

              <div className={s.participantsPanel}>
                <div className={s.fieldRow}>
                  <Button variant="secondary" onClick={loadParticipants}>Обновить участников</Button>
                  <div className={s.field}>
                    <label>kick user_id</label>
                    <input type="number" value={kickUserId} onChange={e => setKickUserId(e.target.value)} />
                  </div>
                  <Button variant="secondary" onClick={kick}>Кикнуть</Button>
                </div>
                {participants.length > 0 && (
                  <div className={s.participantsList}>
                    {participants.map((p: any, idx: number) => (
                      <div key={idx} className={s.participantItem}>
                        <span>{String(p.identity || p.name || p.user_id || '')}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={s.rightWidgets}>
        <RightWidgets />
      </div>
    </div>
  )
}
