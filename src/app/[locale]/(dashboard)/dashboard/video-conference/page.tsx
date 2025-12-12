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
  const t = useTranslations()

  const [conferenceId, setConferenceId] = useState('')
  const [codeInput, setCodeInput] = useState('')
  const [userId, setUserId] = useState('')
  const [joining, setJoining] = useState(false)
  const [connectedInfo, setConnectedInfo] = useState<null | { room: string; is_member: boolean; topic?: string; identity?: string }>(null)
  const [error, setError] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const remoteContainerRef = useRef<HTMLDivElement | null>(null)

  const roomRef = useRef<any>(null)
  const [participants, setParticipants] = useState<any[]>([])
  const [kickUserId, setKickUserId] = useState('')
  const BASE = 'https://video.zanger-app.kz/api/java-api/'
  const [scheduledList, setScheduledList] = useState<Array<{ id: string; code: string; topic: string; type: string; planned_time: string }>>([])
  const [mounted, setMounted] = useState(false)
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(false)
  const [cameraOn, setCameraOn] = useState(false)
  const [micOn, setMicOn] = useState(false)
  const [debug, setDebug] = useState<{ url?: string; tokenLen?: number; canPublish?: boolean } | null>(null)
  const [showManagePanel] = useState(false)
  const personalData = useLoginStore((s) => s.personalData)

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => {
    const role = Cookies.get('role')
    if (role !== 'lawyer') {
      router.replace(`/${language}/dashboard/main`)
    }
  }, [router, language])

  const isLawyer = Boolean((personalData as any)?.role_id?.code === 'lawyer')

  function extractConferenceId(input: string) {
    const trimmed = (input || '').trim()
    const m = trimmed.match(/(?:video-conference|vks)\/(\w[\w-]+)/i)
    if (m && m[1]) return m[1]
    return trimmed
  }

  function handleCodeChange(v: string) {
    setCodeInput(v)
    const cid = extractConferenceId(v)
    setConferenceId(cid)
  }

  function handleCodeSubmit() {
    if (!conferenceId) {
      setError(t('dashboard.videoConference.enterCodeOrLink'))
      return
    }
    router.push(`/${language}/dashboard/video-conference/${conferenceId}`)
  }

  function handleCreateClick() {
    router.push(`/${language}/dashboard/video-conference/createmeeting`)
  }

  useEffect(() => { loadConferences() }, [page, size])

  useEffect(() => {
    const handler = () => {
      // Reset to first page and reload when a new conference is scheduled
      setPage(0)
      // Load with page 0 explicitly
      loadConferences(0, size)
    }
    window.addEventListener('vc-conference-scheduled', handler)
    return () => window.removeEventListener('vc-conference-scheduled', handler)
  }, [size])

  async function loadConferences(pageToLoad?: number, sizeToLoad?: number) {
    const currentPage = pageToLoad !== undefined ? pageToLoad : page
    const currentSize = sizeToLoad !== undefined ? sizeToLoad : size
    setLoading(true)
    try {
      const queryParams = new URLSearchParams({
        page: String(currentPage),
        size: String(currentSize),
      }).toString()
      const res = await httpClientWithAuth<any>(`${BASE}video-conferences?${queryParams}`, { method: 'GET' })
      const items = Array.isArray(res?.content) ? res.content : []
      const mappedItems = items.map((i: any) => {
        const plannedTime = i.plannedTime || i.planned_time || ''
        return {
          id: String(i.id), 
          code: String(i.code || ''), 
          topic: i.topic || '', 
          type: String(i.type || ''), 
          planned_time: String(plannedTime)
        }
      })
      setScheduledList(mappedItems)
      setTotalPages(res?.totalPages || 0)
      setTotalElements(res?.totalElements || 0)
    } catch (e) {
      console.error('Failed to load conferences:', e)
    } finally {
      setLoading(false)
    }
  }

  function formatDT(s: string) {
    if (!mounted) return ''
    const d = new Date(s)
    const ds = d.toLocaleDateString(language === 'kz' ? 'kk-KZ' : 'ru-RU', { day: 'numeric', month: 'long' })
    const ts = d.toLocaleTimeString(language === 'kz' ? 'kk-KZ' : 'ru-RU', { hour: '2-digit', minute: '2-digit' })
    return `${ds}, ${ts}`
  }

  

  // Show all conferences from the API, sorted by planned_time (newest first)
  const plannedItems = scheduledList
    .filter(i => i.planned_time) // Only filter out items without dates
    .sort((a, b) => {
      const timeA = new Date(a.planned_time).getTime()
      const timeB = new Date(b.planned_time).getTime()
      // Sort descending (newest first)
      return timeB - timeA
    })

  // Separate future and past conferences for display purposes
  const futureItems = plannedItems.filter(i => {
    const t = new Date(i.planned_time).getTime()
    return !isNaN(t) && t >= Date.now()
  })

  const archivedItems = plannedItems.filter(i => {
    const t = new Date(i.planned_time).getTime()
    return !isNaN(t) && t < Date.now()
  })

  function joinScheduled(it: any) {
    const cid = String((it as any).id || it.conference_id || '')
    if (!cid) return
    setConferenceId(cid)
    joinRoom()
  }

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


  async function startStream() {
    setError(null)
    setJoining(true)

    try {
      // Call stream/start endpoint - no body needed, only Authorization header
      const streamData = await httpClientWithAuth<any>(`${BASE}stream/start`, {
        method: 'POST',
      })

      // Response contains: liveKitToken (or token), conferenceId, identity, code
      const token = streamData.liveKitToken || streamData.token || streamData.livekitToken
      const newConferenceId = streamData.conferenceId || streamData.id
      const identity = streamData.identity
      const code = streamData.code

      if (!token) {
        throw new Error('Token not found in stream/start response')
      }

      if (!newConferenceId) {
        throw new Error('Conference ID not found in stream/start response')
      }

      // Store token and stream info in sessionStorage for the conference page
      sessionStorage.setItem('meet_token', token)
      sessionStorage.setItem('meet_stream_started', 'true')
      sessionStorage.setItem('meet_can_publish', 'true')
      if (identity) {
        sessionStorage.setItem('meet_identity', identity)
      }

      // Navigate to the conference page
      router.push(`/${language}/dashboard/video-conference/${newConferenceId}`)

      // Reload conferences list to show the new stream
      await loadConferences(0, size)

    } catch (e: any) {
      console.error('Error starting stream:', e)
      setError(e?.message || 'Failed to start stream')
      setJoining(false)
    }
  }

  async function joinRoom() {
    if (!conferenceId) {
      setError(t('dashboard.videoConference.enterConferenceId'))
      return
    }

    setError(null)
    setJoining(true)

    try {
      const data = await httpClientWithAuth<any>(`${BASE}join`, {
        method: 'POST',
        body: JSON.stringify({ conference_id: conferenceId, user_id: Number(userId || (personalData as any)?.id || 0) }),
      })
      const { token, url, canPublish, identity, topic: tp } = data
      setDebug({ url, tokenLen: token ? String(token).length : 0, canPublish })

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
      setError(e?.message || t('dashboard.videoConference.errorConnection'))
    } finally {
      setJoining(false)
    }
  }

  async function toggleCamera() {
    try {
      const room = roomRef.current
      if (!room) return
      const newState = !cameraOn
      await room.localParticipant.setCameraEnabled(newState)
      setCameraOn(newState)
      
      // Attach video track to video element when camera is enabled
      if (newState) {
      const LKC = (window as any).LivekitClient || (window as any).LiveKit
        if (!LKC) return
      const { Track } = LKC
        // Small delay to ensure track is ready
        setTimeout(() => {
      const camPub = room.localParticipant.getTrackPublication(Track.Source.Camera)
      if (camPub?.videoTrack && videoRef.current) {
        camPub.videoTrack.attach(videoRef.current)
      }
        }, 100)
      } else {
        // Clear video when camera is disabled
        if (videoRef.current) {
          videoRef.current.srcObject = null
        }
      }
    } catch (e) {
      console.error('Error toggling camera:', e)
    }
  }

  async function toggleMic() {
    try {
      const room = roomRef.current
      if (!room) return
      await room.localParticipant.setMicrophoneEnabled(!micOn)
      setMicOn(!micOn)
    } catch {}
  }

  async function createRoom() {
    if (!conferenceId) {
      setError(t('dashboard.videoConference.enterConferenceId'))
      return
    }
    setError(null)
    try {
      const payload = {
        type: 'consultation',
        topic: codeInput ? `${t('dashboard.videoConference.meeting')}: ${codeInput}` : t('dashboard.videoConference.meeting'),
        planned_time: new Date(Date.now() + 60_000).toISOString(),
        user_id: Number(userId || (personalData as any)?.id || 0),
      }
      await httpClientWithAuth(`${BASE}/schedule`, {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      await loadConferences(page, size)
    } catch (e: any) {
      setError(e?.message || t('dashboard.videoConference.errorCreateRoom'))
    }
  }

  async function scheduleConf() {
    setError(null)
    try {
      const payload = {
        type: 'consultation',
        topic: codeInput ? `${t('dashboard.videoConference.meeting')}: ${codeInput}` : t('dashboard.videoConference.meeting'),
        planned_time: new Date(Date.now() + 60_000).toISOString(),
        user_id: Number(userId || (personalData as any)?.id || 0),
      }
      const data = await httpClientWithAuth<any>(`${BASE}/schedule`, {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      await loadConferences(page, size)
      const cid = String(data?.conference_id || '')
      if (cid) setConferenceId(cid)
    } catch (e: any) {
      setError(e?.message || t('dashboard.videoConference.errorCreateMeeting'))
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

  // Effect to attach local video when camera is turned on
  useEffect(() => {
    if (cameraOn && roomRef.current && videoRef.current) {
      const timer = setTimeout(() => {
        if (videoRef.current && roomRef.current) {
          const LKC = (window as any).LivekitClient || (window as any).LiveKit
          if (!LKC) return
          const { Track } = LKC
          const camPub = roomRef.current.localParticipant.getTrackPublication(Track.Source.Camera)
          if (camPub?.videoTrack) {
            camPub.videoTrack.attach(videoRef.current)
          }
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [cameraOn])


  return (
    <div className={s.container}>
      <div className={s.content}>
        <div className={s.titleRow}>
          <h2><Image src="/assets/icons/myconf.svg" alt={t('dashboard.videoConference.myConferences')} width={20} height={20} />{t('dashboard.videoConference.myConferences')}</h2>

          <div className={s.actions}>
            {connectedInfo && <Button variant="primary" onClick={leaveRoom}>{t('dashboard.videoConference.exit')}</Button>}
          </div>
        </div>

        <div className={s.actionBar}>
          <button className={`${s.pill} ${s.pillRed}`} onClick={startStream} > 
            <span className={s.pillIconLive}></span>
            <span className={s.pillText}>{t('dashboard.videoConference.startStream')}</span>
          </button>
          <button className={`${s.pill} ${s.pillGreen}`} onClick={handleCreateClick}> 
            <span className={s.pillIconPlus}></span>
            <span className={s.pillText}>{t('dashboard.videoConference.createMeeting')}</span>
          </button>
          <div className={s.codeInput}>
            <input type="text" placeholder={t('dashboard.videoConference.enterLinkOrId')} value={codeInput} onChange={e => handleCodeChange(e.target.value)} />
            <button className={s.sendBtn} aria-label="Отправить" onClick={handleCodeSubmit}></button>
          </div>
        </div>

        {mounted && (
          <div className={s.listsColumns}>
            <div className={s.listColumn}>
              <div className={s.listTitle}>{t('dashboard.videoConference.scheduled')}</div>
              <div className={s.cardsGrid}>
                {scheduledList.length === 0 ? (
                  <div className={s.emptyBox}>{t('dashboard.videoConference.noScheduledMeetings')}</div>
                ) : scheduledList.map((it, idx) => (
                  <div key={`p-${idx}`} className={s.card}>
                    <div className={s.cardHeader}>{t('dashboard.videoConference.conference')}</div>
                    <div className={s.cardBody}>
                      <div className={s.cardTitle}>{it.topic || t('dashboard.videoConference.withoutTopic')}</div>
                      <div className={s.cardMeta} suppressHydrationWarning>{t('dashboard.videoConference.date')}: {formatDT(it.planned_time)}</div>
                      <div className={s.cardMeta}>{t('dashboard.videoConference.type')}: {it.type}</div>
                    </div>
                    <div className={s.cardFooter}>
                      <button className={s.watchBtn} onClick={() => window.open(String(it.code || '').replace(/`/g, '').trim(), '_blank')}>{t('dashboard.videoConference.openPage')}</button>
                    </div>
                  </div>
                ))}
              </div>
              {totalPages > 1 && (
                <div className={s.pagination}>
                  <div className={s.paginationInfo}>
                    Стр. {page + 1} из {totalPages} · Всего: {totalElements}
                  </div>
                  <div className={s.paginationControls}>
                    <button 
                      onClick={() => setPage(p => Math.max(0, p - 1))} 
                      disabled={page === 0 || loading}
                      className={s.paginationBtn}
                    >
                      Назад
                    </button>
                    <button 
                      onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} 
                      disabled={page >= totalPages - 1 || loading}
                      className={s.paginationBtn}
                    >
                      Вперёд
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Архив записей временно скрыт */}
          </div>
        )}


      </div>

      <div className={s.rightWidgets}>
        <RightWidgets />
      </div>
    </div>
  )
}
