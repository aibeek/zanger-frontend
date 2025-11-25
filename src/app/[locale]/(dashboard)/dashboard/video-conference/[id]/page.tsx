'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, usePathname, useParams, useSearchParams } from 'next/navigation'
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
  const searchParams = useSearchParams()
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
  const [addUserId, setAddUserId] = useState('')
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedCam, setSelectedCam] = useState('')
  const [selectedMic, setSelectedMic] = useState('')
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [participants, setParticipants] = useState<any[]>([])

  const { personalData } = useLoginStore()

  useEffect(() => {
    const role = Cookies.get('role')
    if (role !== 'lawyer') {
      router.replace(`/${language}/dashboard/main`)
    }
    getDevices()
  }, [router, language])

  async function getDevices() {
    try {
      const devs = await navigator.mediaDevices.enumerateDevices()
      setDevices(devs)
      const cams = devs.filter(d => d.kind === 'videoinput')
      const mics = devs.filter(d => d.kind === 'audioinput')
      if (cams.length > 0 && !selectedCam) setSelectedCam(cams[0].deviceId)
      if (mics.length > 0 && !selectedMic) setSelectedMic(mics[0].deviceId)
    } catch {}
  }

  useEffect(() => {
    const uid = (personalData as any)?.id
    if (uid) setUserId(String(uid))
  }, [personalData])

  useEffect(() => {
    const cid = String(params?.id || '')
    if (cid) setConferenceId(cid)
    
    const t = sessionStorage.getItem('meet_topic')
    if (t) {
      setConf(prev => ({ ...prev, topic: t }))
      sessionStorage.removeItem('meet_topic')
    }
  }, [params])

  useEffect(() => { if (conferenceId) { loadConference(); probeMembership(); } }, [conferenceId, userId])

  useEffect(() => {
    if (conferenceId && userId && !joining && !connectedInfo) {
      handleAutoStart()
    }
  }, [conferenceId, userId])

  async function handleAutoStart() {
    try {
      // Ensure room exists
      await httpClientWithAuth(`${BASE}/rooms`, { method: 'POST', body: JSON.stringify({ conference_id: conferenceId }) })
      await joinRoom()
    } catch (e) {
      console.error(e)
    }
  }

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
        ;(el as any).muted = false
        ;(el as any).play?.().catch(() => {})
        remoteContainerRef.current?.appendChild(el)
      })

      room.on(RoomEvent.TrackUnsubscribed, track => {
        track.detach().forEach((el: any) => el.remove())
      })

      await room.connect(url, token)

      const sVideo = sessionStorage.getItem('meet_video')
      const sAudio = sessionStorage.getItem('meet_audio')
      const sCam = sessionStorage.getItem('meet_cam')
      const sMic = sessionStorage.getItem('meet_mic')

      const autoVideo = sVideo === '1' || searchParams.get('video') === '1'
      const autoAudio = sAudio === '1' || searchParams.get('audio') === '1'
      const camId = sCam || searchParams.get('cam')
      const micId = sMic || searchParams.get('mic')

      // Очищаем, чтобы не влияло на будущие входы
      sessionStorage.removeItem('meet_video')
      sessionStorage.removeItem('meet_audio')
      sessionStorage.removeItem('meet_cam')
      sessionStorage.removeItem('meet_mic')

      if (camId) setSelectedCam(camId)
      if (micId) setSelectedMic(micId)

      if (autoVideo) {
        await room.localParticipant.setCameraEnabled(true, camId ? { deviceId: camId } : undefined)
        setCameraOn(true)
      }
      if (autoAudio) {
        await room.localParticipant.setMicrophoneEnabled(true, micId ? { deviceId: micId } : undefined)
        setMicOn(true)
      }

      setConnectedInfo({ room: room.name, is_member: canPublish, topic: tp, identity })
    } catch (e: any) {
      setError(e?.message || 'Ошибка подключения')
    } finally {
      setJoining(false)
    }
  }

  // Effect to attach local video when camera is turned on
  useEffect(() => {
    if (cameraOn && roomRef.current) {
      // Small timeout to ensure video element is mounted
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

  // отключено авто-подключение — соответствуем дизайну (кнопка «Присоединиться»/«Запустить прямой эфир»)

  async function toggleCamera() {
    try {
      const room = roomRef.current
      if (!room) return
      const newState = !cameraOn
      await room.localParticipant.setCameraEnabled(newState, newState && selectedCam ? { deviceId: selectedCam } : undefined)
      setCameraOn(newState)
    } catch {}
  }

  async function toggleMic() {
    try {
      const room = roomRef.current
      if (!room) return
      const newState = !micOn
      await room.localParticipant.setMicrophoneEnabled(newState, newState && selectedMic ? { deviceId: selectedMic } : undefined)
      setMicOn(newState)
    } catch {}
  }

  async function changeMic(deviceId: string) {
    setSelectedMic(deviceId)
    if (micOn && roomRef.current) {
       await roomRef.current.localParticipant.setMicrophoneEnabled(false)
       await roomRef.current.localParticipant.setMicrophoneEnabled(true, { deviceId })
    }
  }

  async function changeCam(deviceId: string) {
    setSelectedCam(deviceId)
    if (cameraOn && roomRef.current) {
       await roomRef.current.localParticipant.setCameraEnabled(false)
       await roomRef.current.localParticipant.setCameraEnabled(true, { deviceId })
    }
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
    <div className={s.meetingCard}>
      <div className={s.header}>
        <Image src="/assets/icons/myconf.svg" alt="" width={24} height={24} />
        <span className={s.title}>{conf?.topic || 'Конференция'}</span>
      </div>

      <div className={s.layout}>
        <div className={s.leftPanel}>
          <div className={s.videoArea}>
            {cameraOn && <video ref={videoRef} autoPlay muted playsInline className={s.video} />}
            {!cameraOn && (
               <div className={s.videoPlaceholder}>
                 <Image src="/assets/icons/camera.svg" alt="" width={64} height={64} style={{ opacity: 0.2 }} />
               </div>
            )}
            <div ref={remoteContainerRef} className={s.remoteGrid} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: 10 }}></div>
          </div>

          <div className={s.deviceControls}>
             <div className={s.deviceSelect}>
               <div className={s.selectIcon}>
                 <Image src="/assets/icons/micro..svg" alt="" width={16} height={16} />
               </div>
               <div style={{ flex: 1 }}>
                 {!micOn ? (
                   <div className={s.placeholderText} onClick={toggleMic}>Включить микрофон</div>
                 ) : (
                   <select className={s.select} value={selectedMic} onChange={e => changeMic(e.target.value)}>
                     {devices.filter(d => d.kind === 'audioinput').map(d => (
                       <option key={d.deviceId} value={d.deviceId}>{d.label || 'Microphone'}</option>
                     ))}
                     {devices.filter(d => d.kind === 'audioinput').length === 0 && <option>Микрофон (Устройство)</option>}
                   </select>
                 )}
               </div>
               <div className={`${s.toggle} ${micOn ? s.toggleActive : ''}`} onClick={toggleMic}>
                 <div className={s.toggleKnob} />
               </div>
             </div>
             <div className={s.deviceSelect}>
               <div className={s.selectIcon}>
                 <Image src="/assets/icons/camera.svg" alt="" width={16} height={16} />
               </div>
               <div style={{ flex: 1 }}>
                 {!cameraOn ? (
                   <div className={s.placeholderText} onClick={toggleCamera}>Включить камеру</div>
                 ) : (
                   <select className={s.select} value={selectedCam} onChange={e => changeCam(e.target.value)}>
                     {devices.filter(d => d.kind === 'videoinput').map(d => (
                       <option key={d.deviceId} value={d.deviceId}>{d.label || 'Camera'}</option>
                     ))}
                     {devices.filter(d => d.kind === 'videoinput').length === 0 && <option>Камера (Устройство)</option>}
                   </select>
                 )}
               </div>
               <div className={`${s.toggle} ${cameraOn ? s.toggleActive : ''}`} onClick={toggleCamera}>
                 <div className={s.toggleKnob} />
               </div>
             </div>
          </div>
        </div>

        <div className={s.rightPanel}>
          <div className={s.infoBlock}>
            <div className={s.infoRow}>
              <span>Код конференции:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className={s.codeValue}>{conf?.code ? conf.code.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3') : conferenceId}</span>
                <button className={s.copyBtn} onClick={() => navigator.clipboard.writeText(conf?.code || conferenceId)}>
                  <Image src="/assets/icons/copy.svg" alt="copy" width={16} height={16} />
                </button>
              </div>
            </div>
            <div className={s.infoRow} style={{ justifyContent: 'center', fontSize: 12, color: '#64748b' }}>
              или
            </div>
            <div className={s.infoRow}>
              <span>Пригласить по ссылке:</span>
              <span className={s.linkAction} onClick={() => navigator.clipboard.writeText(window.location.href)}>скопировать</span>
            </div>
          </div>

          {canPublish && (
            <div className={s.infoBlock} style={{ marginTop: 20 }}>
               <input 
                 className={s.input} 
                 placeholder="user_id участника" 
                 value={addUserId} 
                 onChange={e => setAddUserId(e.target.value)} 
               />
               <button className={s.startBtn} onClick={async () => { 
                    if (!addUserId) return;
                    try { 
                      const body = { conference_id: conferenceId, user_id: Number(addUserId) }; 
                      await httpClientWithAuth(`${BASE}/add-member`, { method: 'POST', body: JSON.stringify(body) }); 
                      setAddUserId('');
                      const qs = new URLSearchParams({ conference_id: conferenceId }).toString(); 
                      const res = await httpClientWithAuth<any>(`${BASE}/participants?${qs}`, { method: 'GET' }); 
                      setParticipants(Array.isArray(res?.participants) ? res.participants : []); 
                      alert('Участник добавлен');
                    } catch (e) {
                      console.error(e);
                      alert('Ошибка добавления участника');
                    } 
                  }}>
                 Добавить участника
               </button>
            </div>
          )}

          <div className={s.actions}>
            {canPublish ? (
               <button className={s.exitBtn} style={{ color: '#ef4444', borderColor: '#ef4444' }} onClick={() => { try { roomRef.current?.disconnect(); } catch {}; router.push(`/${language}/dashboard/video-conference`) }}>
                 Завершить встречу
               </button>
            ) : (
               <button className={s.exitBtn} onClick={() => { try { roomRef.current?.disconnect(); } catch {}; router.push(`/${language}/dashboard/video-conference`) }}>
                 Выйти
               </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

