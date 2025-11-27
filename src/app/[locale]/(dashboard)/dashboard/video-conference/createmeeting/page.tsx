'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import { httpClientWithAuth } from '@/shared/api/httpClient'
import { useLoginStore } from '@/features/auth/login'
import s from './page.module.scss'

export default function CreateMeetingPage() {
  const router = useRouter()
  const pathname = usePathname()
  const languageMatch = pathname.match(/^\/(\w{2})\//)
  const language = (languageMatch?.[1] || 'ru') as string
  
  const [topic, setTopic] = useState('')
  const [code, setCode] = useState('')
  const [conferenceId, setConferenceId] = useState('')
  const [loading, setLoading] = useState(true)
  const [cameraOn, setCameraOn] = useState(false)
  const [micOn, setMicOn] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedCam, setSelectedCam] = useState('')
  const [selectedMic, setSelectedMic] = useState('')
  const [stream, setStream] = useState<MediaStream | null>(null)

  const { personalData } = useLoginStore()
  const BASE = 'https://api.zanger-app.kz/api/livekit'

  useEffect(() => {
    createDraft()
    getDevices()
    
    return () => {
      stopStream()
    }
  }, [])

  useEffect(() => {
    if (cameraOn) startCamera()
    else stopStream()
  }, [cameraOn, selectedCam])

  async function getDevices() {
    try {
      const devs = await navigator.mediaDevices.enumerateDevices()
      setDevices(devs)
      const cams = devs.filter(d => d.kind === 'videoinput')
      const mics = devs.filter(d => d.kind === 'audioinput')
      if (cams.length > 0) setSelectedCam(cams[0].deviceId)
      if (mics.length > 0) setSelectedMic(mics[0].deviceId)
    } catch {}
  }

  async function startCamera() {
    stopStream()
    try {
      const constraints = {
        video: selectedCam ? { deviceId: { exact: selectedCam } } : true,
        audio: false
      }
      const s = await navigator.mediaDevices.getUserMedia(constraints)
      setStream(s)
      if (videoRef.current) {
        videoRef.current.srcObject = s
      }
    } catch (e) {
      console.error(e)
      setCameraOn(false)
    }
  }

  function stopStream() {
    if (stream) {
      stream.getTracks().forEach(t => t.stop())
      setStream(null)
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  async function createDraft() {
    try {
      const uid = (personalData as any)?.id
      if (!uid) return
      
      const payload = {
        type: 'consultation',
        topic: 'Встреча',
        planned_time: new Date().toISOString(),
        user_id: uid,
      }
      const data = await httpClientWithAuth<any>(`${BASE}/schedule`, {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      
      if (data) {
        setConferenceId(String(data.conference_id))
        setCode(String(data.conference_id))
        setTopic(data.topic || '')
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function handleStart() {
    if (!conferenceId) return
    
    // Пытаемся обновить тему на сервере
    try {
      await httpClientWithAuth(`${BASE}/conferences/${conferenceId}`, {
        method: 'PUT',
        body: JSON.stringify({ topic })
      })
    } catch (e) {
      console.error(e)
    }

    // Сохраняем настройки в sessionStorage, чтобы не засорять URL
    sessionStorage.setItem('meet_cam', selectedCam)
    sessionStorage.setItem('meet_mic', selectedMic)
    sessionStorage.setItem('meet_video', cameraOn ? '1' : '0')
    sessionStorage.setItem('meet_audio', micOn ? '1' : '0')
    sessionStorage.setItem('meet_topic', topic)
    
    router.push(`/${language}/dashboard/video-conference/${conferenceId}`)
  }

  function handleExit() {
    router.push(`/${language}/dashboard/video-conference`)
  }

  const displayCode = code ? (code.match(/^\d{9}$/) ? code.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3') : code) : 'Загрузка...'

  return (
    <div className={s.container}>
      <div className={s.header}>
        <Image src="/assets/icons/plus.svg" alt="" width={24} height={24} />
        <span className={s.title}>Создайте встречу</span>
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
            <button className={s.menuBtn} style={{ position: 'absolute', top: 10, right: 10 }}>
               {/* Three dots icon if needed */}
            </button>
          </div>

          <div className={s.deviceControls}>
             <div className={s.deviceSelect}>
               <div className={s.selectIcon}>
                 <Image src="/assets/icons/micro..svg" alt="" width={16} height={16} />
               </div>
               <div style={{ flex: 1 }}>
                 {!micOn ? (
                   <div className={s.placeholderText} onClick={() => setMicOn(true)}>Включить микрофон</div>
                 ) : (
                   <select className={s.select} value={selectedMic} onChange={e => setSelectedMic(e.target.value)}>
                     {devices.filter(d => d.kind === 'audioinput').map(d => (
                       <option key={d.deviceId} value={d.deviceId}>{d.label || 'Microphone'}</option>
                     ))}
                     {devices.filter(d => d.kind === 'audioinput').length === 0 && <option>Микрофон (Устройство)</option>}
                   </select>
                 )}
               </div>
               <div className={`${s.toggle} ${micOn ? s.toggleActive : ''}`} onClick={() => setMicOn(!micOn)}>
                 <div className={s.toggleKnob} />
               </div>
             </div>
             <div className={s.deviceSelect}>
               <div className={s.selectIcon}>
                 <Image src="/assets/icons/camera.svg" alt="" width={16} height={16} />
               </div>
               <div style={{ flex: 1 }}>
                 {!cameraOn ? (
                   <div className={s.placeholderText} onClick={() => setCameraOn(true)}>Включить камеру</div>
                 ) : (
                   <select className={s.select} value={selectedCam} onChange={e => setSelectedCam(e.target.value)}>
                     {devices.filter(d => d.kind === 'videoinput').map(d => (
                       <option key={d.deviceId} value={d.deviceId}>{d.label || 'Camera'}</option>
                     ))}
                     {devices.filter(d => d.kind === 'videoinput').length === 0 && <option>Камера (Устройство)</option>}
                   </select>
                 )}
               </div>
               <div className={`${s.toggle} ${cameraOn ? s.toggleActive : ''}`} onClick={() => setCameraOn(!cameraOn)}>
                 <div className={s.toggleKnob} />
               </div>
             </div>
          </div>
        </div>

        <div className={s.rightPanel}>
          <input 
            className={s.input} 
            placeholder="Тема конференции" 
            value={topic} 
            onChange={e => setTopic(e.target.value)} 
          />

          <div className={s.infoBlock}>
            <div className={s.infoRow}>
              <span>Идентификатор:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className={s.codeValue}>{displayCode}</span>
                <button className={s.copyBtn} onClick={() => navigator.clipboard.writeText(code)}>
                  <Image src="/assets/icons/copy.svg" alt="copy" width={16} height={16} />
                </button>
              </div>
            </div>
            <div className={s.infoRow} style={{ justifyContent: 'center', fontSize: 12, color: '#64748b' }}>
              или
            </div>
            <div className={s.infoRow}>
              <span>Пригласить по ссылке:</span>
              <span className={s.linkAction} onClick={() => navigator.clipboard.writeText(`https://zanger-app.kz/ru/dashboard/video-conference/${conferenceId}`)}>скопировать</span>
            </div>
          </div>

          <div className={s.actions}>
            <button className={s.startBtn} onClick={handleStart} disabled={loading}>
              Запустить конференцию
            </button>
            <button className={s.exitBtn} onClick={handleExit}>
              Выйти
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
