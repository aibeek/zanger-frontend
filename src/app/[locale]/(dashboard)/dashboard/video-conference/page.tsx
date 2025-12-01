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
  const BASE = 'https://api.zanger-app.kz/api/livekit'
  const [scheduledList, setScheduledList] = useState<Array<{ id: string; code: string; topic: string; type: string; planned_time: string }>>([])
  const [mounted, setMounted] = useState(false)
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

  useEffect(() => { loadConferences() }, [])

  async function loadConferences() {
    try {
      const res = await httpClientWithAuth<any>(`${BASE}/conferences`, { method: 'GET' })
      const items = Array.isArray(res?.items) ? res.items : []
      setScheduledList(items.map((i: any) => ({ id: String(i.id), code: String(i.code), topic: i.topic || '', type: String(i.type || ''), planned_time: String(i.planned_time) })))
    } catch {}
  }

  function formatDT(s: string) {
    if (!mounted) return ''
    const d = new Date(s)
    const ds = d.toLocaleDateString(language === 'kz' ? 'kk-KZ' : 'ru-RU', { day: 'numeric', month: 'long' })
    const ts = d.toLocaleTimeString(language === 'kz' ? 'kk-KZ' : 'ru-RU', { hour: '2-digit', minute: '2-digit' })
    return `${ds}, ${ts}`
  }

  

  const plannedItems = scheduledList.filter(i => {
    const t = new Date(i.planned_time).getTime()
    return !isNaN(t) && t >= Date.now()
  }).sort((a,b) => new Date(a.planned_time).getTime() - new Date(b.planned_time).getTime())

  const archivedItems = scheduledList.filter(i => {
    const t = new Date(i.planned_time).getTime()
    return !isNaN(t) && t < Date.now()
  }).sort((a,b) => new Date(b.planned_time).getTime() - new Date(a.planned_time).getTime())

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


  async function joinRoom() {
    if (!conferenceId) {
      setError(t('dashboard.videoConference.enterConferenceId'))
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
      await loadConferences()
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
      await loadConferences()
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
          <button className={`${s.pill} ${s.pillRed}`}> 
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

        {mounted && plannedItems.length > 0 && (
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th className={s.th}>{t('dashboard.videoConference.topic')}</th>
                  <th className={s.th}>{t('dashboard.videoConference.code')}</th>
                  <th className={s.th}>{t('dashboard.videoConference.date')}</th>
                  <th className={s.th}>{t('dashboard.videoConference.type')}</th>
                  <th className={s.th}></th>
                </tr>
              </thead>
              <tbody>
                {plannedItems.map((it, idx) => (
                  <tr key={`t-${idx}`}>
                    <td className={s.td}>{it.topic || t('dashboard.videoConference.withoutTopic')}</td>
                    <td className={s.td}>{(it as any).id || ''}</td>
                    <td className={s.td} suppressHydrationWarning>{formatDT(it.planned_time)}</td>
                    <td className={s.td}>{it.type}</td>
                    <td className={`${s.td} ${s.rowAction}`}>
                      <Button variant="primary" className={s.smallBtn} onClick={() => { const cid = String((it as any).id || ''); if (!cid) return; router.push(`/${language}/dashboard/video-conference/${cid}`); }}>{t('dashboard.videoConference.enter')}</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {mounted && (plannedItems.length > 0 || plannedItems.length === 0) && (
          <div className={s.listsColumns}>
            <div className={s.listColumn}>
              <div className={s.listTitle}>{t('dashboard.videoConference.scheduled')}</div>
              <div className={s.cardsGrid}>
                {plannedItems.length === 0 ? (
                  <div className={s.emptyBox}>{t('dashboard.videoConference.noScheduledMeetings')}</div>
                ) : plannedItems.map((it, idx) => (
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
            </div>

            {/* Архив записей временно скрыт */}
          </div>
        )}


        <div className={s.placeholder}>
          {connectedInfo && (
            <div className={s.videoContainer}>
              <video ref={videoRef} autoPlay muted playsInline />
              <div ref={remoteContainerRef} className={s.remoteGrid}></div>

              <div className={s.status}> Участникs: {String(connectedInfo.is_member)} • Identity: {connectedInfo.identity} • Тема: {connectedInfo.topic}</div>
              {debug && (
                <div className={s.status}>Server: {debug.url} • Token: {debug.tokenLen} символов • Публикация: {String(debug.canPublish)}</div>
              )}
              <div className={s.actions}>
                <Button variant="secondary" onClick={toggleCamera}>{cameraOn ? t('dashboard.videoConference.turnOffCamera') : t('dashboard.videoConference.turnOnCamera')}</Button>
                <Button variant="secondary" onClick={toggleMic}>{micOn ? t('dashboard.videoConference.turnOffMic') : t('dashboard.videoConference.turnOnMic')}</Button>
              </div>

              {showManagePanel && (
                <div className={s.participantsPanel}>
                  <div className={s.fieldRow}>
                    <Button variant="secondary" onClick={loadParticipants}>{t('dashboard.videoConference.updateParticipants')}</Button>
                    <div className={s.field}>
                      <label>kick user_id</label>
                      <input type="number" value={kickUserId} onChange={e => setKickUserId(e.target.value)} />
                    </div>
                    <Button variant="secondary" onClick={kick}>{t('dashboard.videoConference.kick')}</Button>
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
              )}
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
