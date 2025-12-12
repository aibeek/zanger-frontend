'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
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
  const [connectedInfo, setConnectedInfo] = useState<null | { room: string; is_member: boolean; topic?: string; identity?: string; name?: string }>(null)
  const [error, setError] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const remoteContainerRef = useRef<HTMLDivElement | null>(null)
  const audioContainerRef = useRef<HTMLDivElement | null>(null)
  const chatMessagesRef = useRef<HTMLDivElement | null>(null)

  const videoAreaRef = useRef<HTMLDivElement | null>(null)

  const roomRef = useRef<any>(null)
  const livekitUrlRef = useRef<string>('wss://video.zanger-app.kz')
  const livekitTokenRef = useRef<string>('')
  const BASE = 'https://api.zanger-app.kz/api/livekit'
  const BASE_API = 'http://10.202.100.68:8080/java-api/video-conferences'
  const MEMBERS_API = 'http://10.202.100.68:8080/java-api/conference-members'
  const [cameraOn, setCameraOn] = useState(false)
  const [micOn, setMicOn] = useState(false)
  const [canPublish, setCanPublish] = useState(false)
  const [isStream, setIsStream] = useState(false)
  const [creatorUserId, setCreatorUserId] = useState<number | null>(null)
  const [conf, setConf] = useState<{ topic?: string; planned_time?: string; code?: string } | null>(null)
  const [addUserId, setAddUserId] = useState('')
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedCam, setSelectedCam] = useState('')
  const [selectedMic, setSelectedMic] = useState('')
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [participants, setParticipants] = useState<any[]>([])
  const [remoteParticipants, setRemoteParticipants] = useState<Map<string, any>>(new Map())
  const [videoPositions, setVideoPositions] = useState<Record<string, { x: number; y: number }>>({})
  const [activeTab, setActiveTab] = useState<'chat' | 'participants'>('chat')
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; identity: string; message: string; timestamp: number }>>([])
  const [chatInput, setChatInput] = useState('')
  const [participantPermissions, setParticipantPermissions] = useState<Record<string, { canPublishAudio: boolean; canPublishVideo: boolean }>>({})
  const dragState = useRef<{ isDragging: boolean; elementId: string | null; startX: number; startY: number; initialX: number; initialY: number }>({
    isDragging: false,
    elementId: null,
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
  })

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

  // Cleanup: disconnect from room when component unmounts or user navigates away
  useEffect(() => {
    // Handle page unload (closing tab, navigating away)
    const handleBeforeUnload = () => {
      if (roomRef.current) {
        try {
          roomRef.current.disconnect()
        } catch (e) {
          console.error('Error disconnecting on beforeunload:', e)
        }
      }
    }

    // Handle visibility change (tab switching)
    const handleVisibilityChange = () => {
      if (document.hidden && roomRef.current) {
        // Optional: you can disconnect here if needed, or keep connection
        // For now, we'll only disconnect on actual unmount
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Cleanup function - runs when component unmounts
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      
      // Disconnect from room
      if (roomRef.current) {
        try {
          roomRef.current.disconnect()
          console.log('Disconnected from room on component unmount')
        } catch (e) {
          console.error('Error disconnecting on unmount:', e)
        }
        roomRef.current = null
      }
      
      // Clean up video tracks
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
      
      // Clear containers
      if (remoteContainerRef.current) {
        remoteContainerRef.current.innerHTML = ''
      }
      if (audioContainerRef.current) {
        audioContainerRef.current.innerHTML = ''
      }
      
      // Clear session storage flags
      sessionStorage.removeItem('meet_token')
      sessionStorage.removeItem('meet_stream_started')
      sessionStorage.removeItem('meet_can_publish')
      sessionStorage.removeItem('meet_identity')
      sessionStorage.removeItem('meet_topic')
    }
  }, []) // Empty dependency array - runs once on mount and cleanup on unmount

  useEffect(() => { if (conferenceId) { loadConference(); probeMembership(); } }, [conferenceId, userId])

  useEffect(() => {
    if (conferenceId && userId && !joining && !connectedInfo) {
      handleAutoStart()
    }
  }, [conferenceId, userId])

  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatMessagesRef.current && activeTab === 'chat') {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight
    }
  }, [chatMessages, activeTab])

  // Check if current user is the stream owner
  const isStreamOwner = useMemo(() => {
    const currentUserId = Number(userId || (personalData as any)?.id || 0)
    return creatorUserId !== null && creatorUserId === currentUserId
  }, [creatorUserId, userId, personalData])

  // Check if user has permissions to use mic/camera
  const hasDevicePermissions = useMemo(() => {
    if (canPublish) return true
    const identity = connectedInfo?.identity || String((personalData as any)?.id || '')
    const permissions = participantPermissions[identity]
    return permissions && (permissions.canPublishAudio || permissions.canPublishVideo)
  }, [canPublish, connectedInfo?.identity, participantPermissions, personalData])

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
      const data = await httpClientWithAuth<any>(`${BASE_API}/join`, {
        method: 'POST',
        body: JSON.stringify({ conferenceId: conferenceId, userId: Number(userId) }),
      })
      setCanPublish(Boolean(data?.canPublish))
    } catch {}
  }

  function loadParticipantsFromRoom(room: any) {
    if (!room) return
    
    try {
      const local = room.localParticipant
      const others = Array.from(room.remoteParticipants.values())
      
      // Only show remote participants (exclude local participant)
      const remoteParticipants: Array<{ identity: string; name: string }> = []
      
      // Add remote participants only (excluding local)
      others.forEach((p: any) => {
        // Double-check: exclude local participant if it somehow appears in remoteParticipants
        if (local && p.identity === local.identity) {
          return
        }
        remoteParticipants.push({
          identity: p.identity,
          name: p.name || p.identity
        })
      })
      
      setParticipants(remoteParticipants)
      return remoteParticipants
    } catch (e) {
      console.warn('Failed to load participants from room:', e)
      return []
    }
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

  function attachDragHandlers(element: HTMLDivElement, elementId: string) {
    const onMouseDown = (e: MouseEvent) => {
      // Only drag on left mouse button
      if (e.button !== 0) return
      
      dragState.current.isDragging = true
      dragState.current.elementId = elementId
      dragState.current.startX = e.clientX
      dragState.current.startY = e.clientY
      
      // Get position relative to videoArea
      const rect = element.getBoundingClientRect()
      const videoAreaRect = videoAreaRef.current?.getBoundingClientRect()
      
      if (videoAreaRect) {
        dragState.current.initialX = rect.left - videoAreaRect.left
        dragState.current.initialY = rect.top - videoAreaRect.top
      } else {
        dragState.current.initialX = 0
        dragState.current.initialY = 0
      }
      
      element.style.cursor = 'grabbing'
      element.style.userSelect = 'none'
      
      // Prevent text selection while dragging
      e.preventDefault()
    }
    
    element.addEventListener('mousedown', onMouseDown)
    ;(element as any)._dragHandler = onMouseDown
  }

  useEffect(() => {
    if (!dragState.current.isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragState.current.isDragging || !dragState.current.elementId) return

      const deltaX = e.clientX - dragState.current.startX
      const deltaY = e.clientY - dragState.current.startY

      const newX = Math.max(0, dragState.current.initialX + deltaX)
      const newY = Math.max(0, dragState.current.initialY + deltaY)

      const wrapper = document.getElementById(`video-${dragState.current.elementId}`)
      if (wrapper) {
        wrapper.style.position = 'absolute'
        wrapper.style.left = `${newX}px`
        wrapper.style.top = `${newY}px`
        wrapper.style.width = '280px'
        wrapper.style.height = '157px'
        wrapper.style.aspectRatio = 'unset'
        wrapper.style.zIndex = '1001'
      }

      setVideoPositions(prev => ({
        ...prev,
        [dragState.current.elementId!]: { x: newX, y: newY }
      }))
    }

    const handleMouseUp = () => {
      if (dragState.current.elementId) {
        const wrapper = document.getElementById(`video-${dragState.current.elementId}`)
        if (wrapper) {
          wrapper.style.cursor = 'grab'
        }
      }
      dragState.current.isDragging = false
      dragState.current.elementId = null
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  async function joinRoom() {
    if (!conferenceId) return
    setError(null)
    setJoining(true)
    try {
      // Check if this is a stream started via stream/start
      const streamToken = sessionStorage.getItem('meet_token')
      const isStreamStarted = sessionStorage.getItem('meet_stream_started') === 'true'
      const streamCanPublish = sessionStorage.getItem('meet_can_publish') === 'true'
      
      let token: string
      let url: string
      let identity: string
      let canPub: boolean

      if (isStreamStarted && streamToken) {
        // Use stream token and set stream mode
        token = streamToken
        url = 'wss://video.zanger-app.kz'
        identity = sessionStorage.getItem('meet_identity') || String((personalData as any)?.id || '')
        canPub = streamCanPublish
        setIsStream(true)
        
        // Clear sessionStorage after use
        sessionStorage.removeItem('meet_token')
        sessionStorage.removeItem('meet_stream_started')
        sessionStorage.removeItem('meet_can_publish')
        sessionStorage.removeItem('meet_identity')
      } else {
        // Normal join flow
        const data = await httpClientWithAuth<any>(`${BASE_API}/join`, {
        method: 'POST',
          body: JSON.stringify({ conferenceId: conferenceId, userId: Number(userId || (personalData as any)?.id || 0) }),
        })
        token = data.token
        // Use LiveKit URL - use from API response if available, otherwise use default
        url = data.url || 'wss://video.zanger-app.kz'
        identity = data.identity
        canPub = Boolean(data.canPublish)
        setIsStream(false)
        // Store creatorUserId if available
        if (data.creatorUserId !== undefined) {
          setCreatorUserId(data.creatorUserId)
        }
      }
      
      // Ensure we always use the correct LiveKit URL
      url = url || 'wss://video.zanger-app.kz'
      
      // Store URL and token in refs for use in event handlers
      livekitUrlRef.current = url
      livekitTokenRef.current = token
      
      setCanPublish(Boolean(canPub))

      await ensureLiveKit()
      const LKC = (window as any).LivekitClient || (window as any).LiveKit
      const { Room, RoomEvent, Track } = LKC

      const room = new Room()
      roomRef.current = room

      room.on(RoomEvent.TrackSubscribed, (track: any, pub: any, participant: any) => {
        const el = track.attach()
        el.autoplay = true
        el.playsInline = true
        ;(el as any).muted = false
        ;(el as any).play?.().catch(() => {})
        
        // Store participant reference
        setRemoteParticipants(prev => {
          const updated = new Map(prev)
          if (!updated.has(participant.identity)) {
            updated.set(participant.identity, { participant, tracks: [] })
          }
          const pData = updated.get(participant.identity)!
          pData.tracks.push({ track, el })
          return updated
        })
        
        if (track.kind === 'video') {
          // When user can publish: remote videos go to main area, local video goes to bottom right
          // When user cannot publish: remote videos go to main area, local video is hidden
          if (canPublish) {
            // If user can publish, remote videos fill the main video area
            if (videoAreaRef.current) {
              // Remove placeholder if exists
              const placeholder = videoAreaRef.current.querySelector(`.${s.videoPlaceholder}`)
              if (placeholder) placeholder.remove()
              
              // Make sure remote videos are not in grid
              const existingInGrid = remoteContainerRef.current?.querySelector(`#video-${participant.identity}`)
              if (existingInGrid) {
                existingInGrid.remove()
              }
              
              // Fill main video area with remote video
              el.style.width = '100%'
              el.style.height = '100%'
              el.style.objectFit = 'cover'
              el.style.position = 'absolute'
              el.style.top = '0'
              el.style.left = '0'
              el.style.zIndex = '1'
              el.setAttribute('data-participant', participant.identity)
              videoAreaRef.current.appendChild(el)
            }
          } else {
            // If user cannot publish, also fill main area with remote video
            if (videoAreaRef.current) {
              // Hide local video if exists
              if (videoRef.current) {
                videoRef.current.style.display = 'none'
              }
              
              // Clear existing remote videos from grid
              if (remoteContainerRef.current) {
                remoteContainerRef.current.innerHTML = ''
              }
              
              // Fill main video area with remote video
              el.style.width = '100%'
              el.style.height = '100%'
              el.style.objectFit = 'cover'
              el.style.position = 'absolute'
              el.style.top = '0'
              el.style.left = '0'
              el.style.zIndex = '1'
              el.setAttribute('data-participant', participant.identity)
              videoAreaRef.current.appendChild(el)
            }
          }
        } else {
          audioContainerRef.current?.appendChild(el)
        }
      })

      room.on(RoomEvent.TrackUnsubscribed, (track: any) => {
        // Find which participant this track belongs to
        let participantIdentity: string | null = null
        setRemoteParticipants(prev => {
          const updated = new Map(prev)
          for (const [identity, data] of updated.entries()) {
            const trackIndex = data.tracks.findIndex((t: any) => t.track === track)
            if (trackIndex !== -1) {
              participantIdentity = identity
            data.tracks = data.tracks.filter((t: any) => t.track !== track)
            if (data.tracks.length === 0) {
              updated.delete(identity)
              }
            }
          }
          return updated
        })
        
        // Detach and remove video elements
        track.detach().forEach((el: any) => {
          // When user can publish or cannot publish, remote videos are in main area
          if (videoAreaRef.current && participantIdentity) {
            const videoElement = videoAreaRef.current.querySelector(`video[data-participant="${participantIdentity}"]`)
            if (videoElement === el) {
              el.remove()
              // If no more remote videos and user cannot publish, show placeholder or local video
              if (!canPublish) {
                const remainingVideos = videoAreaRef.current.querySelectorAll('video[data-participant]')
                if (remainingVideos.length === 0) {
                  if (videoRef.current) {
                    videoRef.current.style.display = 'block'
                  }
                }
              }
              return
            }
          }
          el.remove()
        })
      })

      room.on(RoomEvent.ParticipantConnected, (participant: any) => {
        // Skip local participant - only track remote participants
        if (participant.identity === room.localParticipant?.identity) {
          return
        }
        // Reload participants from room to get accurate list
        if (roomRef.current) {
          setTimeout(() => loadParticipantsFromRoom(roomRef.current), 500)
        }
      })

      room.on(RoomEvent.ParticipantDisconnected, (p: any) => {
        setRemoteParticipants(prev => {
          const updated = new Map(prev)
          updated.delete(p.identity)
          return updated
        })
        // Remove from participants list
        setParticipants(prev => prev.filter(part => part.identity !== p.identity))
        
        // Reload participants from room
        if (roomRef.current) {
          setTimeout(() => loadParticipantsFromRoom(roomRef.current), 500)
        }
        
        // Clean up video elements safely
        if (canPublish && videoAreaRef.current) {
          // When user can publish, remote videos are in main area
          const videoElement = videoAreaRef.current.querySelector(`video[data-participant="${p.identity}"]`)
          videoElement?.remove()
        } else if (!canPublish && videoAreaRef.current) {
          // When user cannot publish, remote videos are also in main area
          const videoElement = videoAreaRef.current.querySelector(`video[data-participant="${p.identity}"]`)
          videoElement?.remove()
          // If no more remote videos, show placeholder or local video
          const remainingVideos = videoAreaRef.current.querySelectorAll('video[data-participant]')
          if (remainingVideos.length === 0 && videoRef.current) {
            videoRef.current.style.display = 'block'
          }
        }
      })

      // Listen for chat messages and permission updates via LiveKit data channel
      room.on(RoomEvent.DataReceived, (payload: Uint8Array, participant: any, kind: any, topic: string | undefined) => {
        try {
          const decoder = new TextDecoder()
          const messageText = decoder.decode(payload)
          const messageData = JSON.parse(messageText)
          if (messageData.type === 'chat' && messageData.message) {
            const chatMessage = {
              id: messageData.id || Date.now().toString(),
              identity: participant?.identity || messageData.identity || 'Unknown',
              message: messageData.message,
              timestamp: messageData.timestamp || Date.now()
            }
            setChatMessages(prev => {
              // Avoid duplicates
              const exists = prev.find(m => m.id === chatMessage.id)
              if (!exists) {
                return [...prev, chatMessage]
              }
              return prev
            })
          } else if (messageData.type === 'permission_update') {
            // Handle permission updates
            const { targetIdentity, canPublishAudio, canPublishVideo } = messageData
            if (targetIdentity) {
              const currentIdentity = connectedInfo?.identity || String((personalData as any)?.id || '')
              const isCurrentUser = targetIdentity === currentIdentity
              
              // Check previous permissions before updating
              const previousPermissions = participantPermissions[targetIdentity]
              const justGotFullPermission = isCurrentUser && 
                canPublishAudio && canPublishVideo && 
                (!previousPermissions?.canPublishAudio || !previousPermissions?.canPublishVideo)
              
              const permissionsRevoked = isCurrentUser && 
                (!canPublishAudio && !canPublishVideo) && 
                (previousPermissions?.canPublishAudio || previousPermissions?.canPublishVideo)
              
              setParticipantPermissions(prev => {
                const updated = {
                  ...prev,
                  [targetIdentity]: {
                    canPublishAudio: canPublishAudio ?? prev[targetIdentity]?.canPublishAudio ?? false,
                    canPublishVideo: canPublishVideo ?? prev[targetIdentity]?.canPublishVideo ?? false
                  }
                }
                return updated
              })
              
              // Show notification to the target participant
              if (isCurrentUser) {
                if (permissionsRevoked) {
                  // Permissions were revoked
                  alert('Вам отозвали разрешение на использование камеры и микрофона')
                  
                  // Disable camera and microphone if they are on
                  if (roomRef.current) {
                    try {
                      if (cameraOn) {
                        roomRef.current.localParticipant.setCameraEnabled(false)
                        setCameraOn(false)
                      }
                      if (micOn) {
                        roomRef.current.localParticipant.setMicrophoneEnabled(false)
                        setMicOn(false)
                      }
                    } catch (e) {
                      console.error('Error disabling devices:', e)
                    }
                  }
                  
                  // Regenerate token and reconnect (new token will have canPublish=false)
                  reconnectWithNewToken()
                } else {
                  // Permissions were granted
                  const messages = []
                  if (canPublishAudio && !previousPermissions?.canPublishAudio) {
                    messages.push('Вам разрешили использовать микрофон')
                  }
                  if (canPublishVideo && !previousPermissions?.canPublishVideo) {
                    messages.push('Вам разрешили использовать камеру')
                  }
                  if (messages.length > 0) {
                    alert(messages.join('\n'))
                  }
                  
                  // If user just got full connection permission, regenerate token and reconnect
                  if (justGotFullPermission) {
                    reconnectWithNewToken()
                  }
                }
              }
            }
          }
        } catch (e) {
          console.error('Error parsing message:', e)
        }
      })

      await room.connect(url, token)

      const topic = conf?.topic || ''

      // Load participants from room immediately after connection
      loadParticipantsFromRoom(room)
      
      // Also update after a short delay to catch any late-loading participants
      setTimeout(() => {
        loadParticipantsFromRoom(room)
      }, 1000)

      // Subscribe to existing participants already in the room
      if (room.participants && typeof room.participants.forEach === 'function') {
      room.participants.forEach((participant: any) => {
          if (!participant) return
          
          if (participant.videoTracks && typeof participant.videoTracks.forEach === 'function') {
        participant.videoTracks.forEach((pub: any) => {
          const track = pub.videoTrack
          if (track) {
            const el = track.attach()
            el.autoplay = true
            el.playsInline = true
            ;(el as any).muted = false
            ;(el as any).play?.().catch(() => {})

            // Store participant reference
            setRemoteParticipants(prev => {
              const updated = new Map(prev)
              if (!updated.has(participant.identity)) {
                updated.set(participant.identity, { participant, tracks: [] })
              }
              const pData = updated.get(participant.identity)!
              pData.tracks.push({ track, el })
              return updated
            })

            // When user can publish: remote videos go to main area, local video goes to bottom right
            // When user cannot publish: remote videos go to main area, local video is hidden
            if (canPublish) {
              // If user can publish, remote videos fill the main video area
              if (videoAreaRef.current) {
                // Remove placeholder if exists
                const placeholder = videoAreaRef.current.querySelector(`.${s.videoPlaceholder}`)
                if (placeholder) placeholder.remove()
                
                // Make sure remote videos are not in grid
                const existingInGrid = remoteContainerRef.current?.querySelector(`#video-${participant.identity}`)
                if (existingInGrid) {
                  existingInGrid.remove()
                }
                
                // Fill main video area with remote video
                el.style.width = '100%'
                el.style.height = '100%'
                el.style.objectFit = 'cover'
                el.style.position = 'absolute'
                el.style.top = '0'
                el.style.left = '0'
                el.style.zIndex = '1'
                el.setAttribute('data-participant', participant.identity)
                videoAreaRef.current.appendChild(el)
              }
            } else {
              // If user cannot publish, also fill main area with remote video
              if (videoAreaRef.current) {
                // Hide local video if exists
                if (videoRef.current) {
                  videoRef.current.style.display = 'none'
                }
                
                // Clear existing remote videos from grid
                if (remoteContainerRef.current) {
                  remoteContainerRef.current.innerHTML = ''
                }
                
                // Fill main video area with remote video
                el.style.width = '100%'
                el.style.height = '100%'
                el.style.objectFit = 'cover'
                el.style.position = 'absolute'
                el.style.top = '0'
                el.style.left = '0'
                el.style.zIndex = '1'
                el.setAttribute('data-participant', participant.identity)
                videoAreaRef.current.appendChild(el)
              }
            }
          }
        })
          }
          
          if (participant.audioTracks && typeof participant.audioTracks.forEach === 'function') {
        participant.audioTracks.forEach((pub: any) => {
          const track = pub.audioTrack
          if (track) {
            const el = track.attach()
            ;(el as any).muted = false
            ;(el as any).play?.().catch(() => {})
            audioContainerRef.current?.appendChild(el)
          }
        })
          }
        })
      }
      
      // Reload participants from room after processing all existing participants
      // This ensures we have the complete list
      setTimeout(() => {
        loadParticipantsFromRoom(room)
      }, 1000)

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
        try {
          await room.localParticipant.setCameraEnabled(true, camId ? { deviceId: camId } : undefined)
          setCameraOn(true)
        } catch (e) {
          console.error('Auto video failed', e)
        }
      }
      if (autoAudio) {
        try {
          await room.localParticipant.setMicrophoneEnabled(true, micId ? { deviceId: micId } : undefined)
          setMicOn(true)
        } catch (e) {
          console.error('Auto audio failed', e)
        }
      }

      setConnectedInfo({ room: room.name, is_member: canPublish, topic: topic, identity })
      
      // If user can publish, ensure local video wrapper exists in grid (with placeholder if camera is off)
      if (canPublish && remoteContainerRef.current) {
        setTimeout(() => {
          let existingLocalInGrid = remoteContainerRef.current?.querySelector('#video-local') as HTMLElement
          
          if (!existingLocalInGrid) {
            // Create wrapper for local video
            existingLocalInGrid = document.createElement('div')
            existingLocalInGrid.id = 'video-local'
            existingLocalInGrid.style.position = 'relative'
            existingLocalInGrid.style.width = '100%'
            existingLocalInGrid.style.height = '100%'
            existingLocalInGrid.style.aspectRatio = '16/9'
            existingLocalInGrid.style.cursor = 'grab'
            existingLocalInGrid.style.touchAction = 'none'
            existingLocalInGrid.style.zIndex = '100' // Higher z-index to be on top
            existingLocalInGrid.style.borderRadius = '6px'
            existingLocalInGrid.style.overflow = 'hidden'
            existingLocalInGrid.style.background = '#f1f5f9'
            
            remoteContainerRef.current.appendChild(existingLocalInGrid)
            
            // Attach drag handlers
            attachDragHandlers(existingLocalInGrid as HTMLDivElement, 'local')
          }
          
          // If camera is off, show placeholder
          if (!cameraOn) {
            const existingPlaceholder = existingLocalInGrid.querySelector('.local-video-placeholder')
            if (!existingPlaceholder) {
              // Remove video if exists
              const existingVideo = existingLocalInGrid.querySelector('video')
              if (existingVideo) existingVideo.remove()
              
              // Create placeholder
              const placeholder = document.createElement('div')
              placeholder.className = 'local-video-placeholder'
              placeholder.style.display = 'flex'
              placeholder.style.flexDirection = 'column'
              placeholder.style.alignItems = 'center'
              placeholder.style.justifyContent = 'center'
              placeholder.style.width = '100%'
              placeholder.style.height = '100%'
              placeholder.style.color = '#94a3b8'
              
              const icon = document.createElement('img')
              icon.src = '/assets/icons/camera.svg'
              icon.style.width = '48px'
              icon.style.height = '48px'
              icon.style.opacity = '0.3'
              
              placeholder.appendChild(icon)
              existingLocalInGrid.appendChild(placeholder)
            }
          }
        }, 200)
      }
    } catch (e: any) {
      setError(e?.message || 'Ошибка подключения')
    } finally {
      setJoining(false)
    }
  }

  async function reconnectWithNewToken() {
    if (!conferenceId || !roomRef.current) return
    
    try {
      
      // Disconnect from current room
      const currentRoom = roomRef.current
      if (currentRoom) {
        await currentRoom.disconnect()
        roomRef.current = null
      }
      
      // Clear remote participants and tracks
      setRemoteParticipants(new Map())
      setParticipants([])
      if (remoteContainerRef.current) {
        remoteContainerRef.current.innerHTML = ''
      }
      if (videoAreaRef.current) {
        videoAreaRef.current.innerHTML = ''
      }
      if (audioContainerRef.current) {
        audioContainerRef.current.innerHTML = ''
      }
      
      // Reset connection state
      setConnectedInfo(null)
      setCameraOn(false)
      setMicOn(false)
      
      // Regenerate token by calling join API again
      const data = await httpClientWithAuth<any>(`${BASE_API}/join`, {
        method: 'POST',
        body: JSON.stringify({ 
          conferenceId: conferenceId, 
          userId: Number(userId || (personalData as any)?.id || 0) 
        }),
      })
      
      const newToken = data.token
      const url = data.url || 'wss://video.zanger-app.kz'
      const identity = data.identity
      const canPub = Boolean(data.canPublish)
      // Store creatorUserId if available
      if (data.creatorUserId !== undefined) {
        setCreatorUserId(data.creatorUserId)
      }
      
      // Store new token and URL
      livekitTokenRef.current = newToken
      livekitUrlRef.current = url
      setCanPublish(canPub)
      
      // Reconnect to room with new token
      await ensureLiveKit()
      const LKC = (window as any).LivekitClient || (window as any).LiveKit
      const { Room, RoomEvent, Track } = LKC
      
      const room = new Room()
      roomRef.current = room
      
      // Reattach all event handlers (same as in joinRoom)
      room.on(RoomEvent.TrackSubscribed, (track: any, pub: any, participant: any) => {
        const el = track.attach()
        el.autoplay = true
        el.playsInline = true
        ;(el as any).muted = false
        ;(el as any).play?.().catch(() => {})
        
        setRemoteParticipants(prev => {
          const updated = new Map(prev)
          if (!updated.has(participant.identity)) {
            updated.set(participant.identity, { participant, tracks: [] })
          }
          const pData = updated.get(participant.identity)!
          pData.tracks.push({ track, el })
          return updated
        })
        
        if (track.kind === 'video') {
          // When user can publish: remote videos go to main area, local video goes to bottom right
          // When user cannot publish: remote videos go to main area, local video is hidden
          if (canPub) {
            // If user can publish, remote videos fill the main video area
            if (videoAreaRef.current) {
              // Remove placeholder if exists
              const placeholder = videoAreaRef.current.querySelector(`.${s.videoPlaceholder}`)
              if (placeholder) placeholder.remove()
              
              // Make sure remote videos are not in grid
              const existingInGrid = remoteContainerRef.current?.querySelector(`#video-${participant.identity}`)
              if (existingInGrid) {
                existingInGrid.remove()
              }
              
              // Fill main video area with remote video
              el.style.width = '100%'
              el.style.height = '100%'
              el.style.objectFit = 'cover'
              el.style.position = 'absolute'
              el.style.top = '0'
              el.style.left = '0'
              el.style.zIndex = '1'
              el.setAttribute('data-participant', participant.identity)
              videoAreaRef.current.appendChild(el)
            }
          } else {
            // If user cannot publish, also fill main area with remote video
            if (videoAreaRef.current) {
              // Hide local video if exists
              if (videoRef.current) {
                videoRef.current.style.display = 'none'
              }
              
              // Clear existing remote videos from grid
              if (remoteContainerRef.current) {
                remoteContainerRef.current.innerHTML = ''
              }
              
              // Fill main video area with remote video
              el.style.width = '100%'
              el.style.height = '100%'
              el.style.objectFit = 'cover'
              el.style.position = 'absolute'
              el.style.top = '0'
              el.style.left = '0'
              el.style.zIndex = '1'
              el.setAttribute('data-participant', participant.identity)
              videoAreaRef.current.appendChild(el)
            }
          }
        } else {
          audioContainerRef.current?.appendChild(el)
        }
      })
      
      room.on(RoomEvent.TrackUnsubscribed, (track: any, pub: any, participant: any) => {
        // Detach track elements safely
        const elements = track.detach()
        if (elements && Array.isArray(elements)) {
          elements.forEach((el: any) => {
            // Safe remove - works even if element is already detached or moved
      console.log("IAM HERE 2")

            el?.remove()
          })
        }
        
        // Clean up state map
        setRemoteParticipants(prev => {
          const updated = new Map(prev)
          const data = updated.get(participant.identity)
          if (data) {
            data.tracks = data.tracks.filter((t: any) => t.track !== track)
            if (data.tracks.length === 0) {
              updated.delete(participant.identity)
            }
          }
          return updated
        })
        
        // Clean up video elements safely
        if (track.kind === 'video') {
          if (canPub && videoAreaRef.current) {
            // When user can publish, remote videos are in main area
            const videoElement = videoAreaRef.current.querySelector(`video[data-participant="${participant.identity}"]`)
            videoElement?.remove()
          } else if (!canPub && videoAreaRef.current) {
            // When user cannot publish, remote videos are also in main area
            const videoElement = videoAreaRef.current.querySelector(`video[data-participant="${participant.identity}"]`)
            videoElement?.remove()
            const remainingVideos = videoAreaRef.current?.querySelectorAll('video[data-participant]')
            if (remainingVideos && remainingVideos.length === 0 && videoRef.current) {
              videoRef.current.style.display = 'block'
            }
          }
        }
      })
      
      room.on(RoomEvent.ParticipantConnected, (participant: any) => {
        if (participant.identity === room.localParticipant?.identity) {
          return
        }
        loadParticipantsFromRoom(room)
      })
      
      room.on(RoomEvent.ParticipantDisconnected, (p: any) => {
        setRemoteParticipants(prev => {
          const updated = new Map(prev)
          updated.delete(p.identity)
          return updated
        })
        setParticipants(prev => prev.filter(part => part.identity !== p.identity))
        
        if (roomRef.current) {
          loadParticipantsFromRoom(roomRef.current)
        }
        
        // Clean up video elements safely
        if (canPub && videoAreaRef.current) {
          // When user can publish, remote videos are in main area
          const videoElement = videoAreaRef.current.querySelector(`video[data-participant="${p.identity}"]`)
          videoElement?.remove()
        } else if (!canPub && videoAreaRef.current) {
          // When user cannot publish, remote videos are also in main area
          const videoElement = videoAreaRef.current.querySelector(`video[data-participant="${p.identity}"]`)
          videoElement?.remove()
          const remainingVideos = videoAreaRef.current?.querySelectorAll('video[data-participant]')
          if (remainingVideos && remainingVideos.length === 0 && videoRef.current) {
            videoRef.current.style.display = 'block'
          }
        }
      })
      
      room.on(RoomEvent.DataReceived, (payload: Uint8Array, participant: any, kind: any, topic: string | undefined) => {
        try {
          const decoder = new TextDecoder()
          const messageText = decoder.decode(payload)
          const messageData = JSON.parse(messageText)
          if (messageData.type === 'chat' && messageData.message) {
            const chatMessage = {
              id: messageData.id || Date.now().toString(),
              identity: participant?.identity || messageData.identity || 'Unknown',
              message: messageData.message,
              timestamp: messageData.timestamp || Date.now()
            }
            setChatMessages(prev => {
              const exists = prev.find(m => m.id === chatMessage.id)
              if (!exists) {
                return [...prev, chatMessage]
              }
              return prev
            })
          } else if (messageData.type === 'permission_update') {
            const { targetIdentity, canPublishAudio, canPublishVideo } = messageData
            if (targetIdentity) {
              const currentIdentity = identity || String((personalData as any)?.id || '')
              const isCurrentUser = targetIdentity === currentIdentity
              
              const previousPermissions = participantPermissions[targetIdentity]
              const justGotFullPermission = isCurrentUser && 
                canPublishAudio && canPublishVideo && 
                (!previousPermissions?.canPublishAudio || !previousPermissions?.canPublishVideo)
              
              const permissionsRevoked = isCurrentUser && 
                (!canPublishAudio && !canPublishVideo) && 
                (previousPermissions?.canPublishAudio || previousPermissions?.canPublishVideo)
              
              setParticipantPermissions(prev => {
                const updated = {
                  ...prev,
                  [targetIdentity]: {
                    canPublishAudio: canPublishAudio ?? prev[targetIdentity]?.canPublishAudio ?? false,
                    canPublishVideo: canPublishVideo ?? prev[targetIdentity]?.canPublishVideo ?? false
                  }
                }
                return updated
              })
              
              if (isCurrentUser) {
                if (permissionsRevoked) {
                  // Permissions were revoked
                  alert('Вам отозвали разрешение на использование камеры и микрофона')
                  
                  // Disable camera and microphone if they are on
                  if (roomRef.current) {
                    try {
                      if (cameraOn) {
                        roomRef.current.localParticipant.setCameraEnabled(false)
                        setCameraOn(false)
                      }
                      if (micOn) {
                        roomRef.current.localParticipant.setMicrophoneEnabled(false)
                        setMicOn(false)
                      }
                    } catch (e) {
                      console.error('Error disabling devices:', e)
                    }
                  }
                  
                  // Regenerate token and reconnect (new token will have canPublish=false)
                  reconnectWithNewToken()
                } else {
                  // Permissions were granted
                  const messages = []
                  if (canPublishAudio && !previousPermissions?.canPublishAudio) {
                    messages.push('Вам разрешили использовать микрофон')
                  }
                  if (canPublishVideo && !previousPermissions?.canPublishVideo) {
                    messages.push('Вам разрешили использовать камеру')
                  }
                  if (messages.length > 0) {
                    alert(messages.join('\n'))
                  }
                  
                  if (justGotFullPermission) {
                    reconnectWithNewToken()
                  }
                }
              }
            }
          }
        } catch (e) {
          console.error('Error parsing message:', e)
        }
      })
      
      await room.connect(url, newToken)
      
      const topic = conf?.topic || ''
      loadParticipantsFromRoom(room)
      
      setTimeout(() => {
        loadParticipantsFromRoom(room)
      }, 1000)
      
      if (room.participants && typeof room.participants.forEach === 'function') {
        room.participants.forEach((participant: any) => {
          if (!participant) return
          
          if (participant.videoTracks && typeof participant.videoTracks.forEach === 'function') {
            participant.videoTracks.forEach((pub: any) => {
          const track = pub.videoTrack
          if (track) {
            const el = track.attach()
            el.autoplay = true
            el.playsInline = true
            ;(el as any).muted = false
            ;(el as any).play?.().catch(() => {})
            
            setRemoteParticipants(prev => {
              const updated = new Map(prev)
              if (!updated.has(participant.identity)) {
                updated.set(participant.identity, { participant, tracks: [] })
              }
              const pData = updated.get(participant.identity)!
              pData.tracks.push({ track, el })
              return updated
            })
            
            if (track.kind === 'video') {
              // When user can publish: remote videos go to main area, local video goes to bottom right
              // When user cannot publish: remote videos go to main area, local video is hidden
              if (canPub) {
                // If user can publish, remote videos fill the main video area
                if (videoAreaRef.current) {
                  // Remove placeholder if exists
                  const placeholder = videoAreaRef.current.querySelector(`.${s.videoPlaceholder}`)
                  if (placeholder) placeholder.remove()
                  
                  // Make sure remote videos are not in grid
                  const existingInGrid = remoteContainerRef.current?.querySelector(`#video-${participant.identity}`)
                  if (existingInGrid) {
                    existingInGrid.remove()
                  }
                  
                  // Fill main video area with remote video
                  el.style.width = '100%'
                  el.style.height = '100%'
                  el.style.objectFit = 'cover'
                  el.style.position = 'absolute'
                  el.style.top = '0'
                  el.style.left = '0'
                  el.style.zIndex = '1'
                  el.setAttribute('data-participant', participant.identity)
                  videoAreaRef.current.appendChild(el)
                }
              } else {
                // If user cannot publish, also fill main area with remote video
                if (videoAreaRef.current) {
                  // Hide local video if exists
                  if (videoRef.current) {
                    videoRef.current.style.display = 'none'
                  }
                  
                  // Clear existing remote videos from grid
                  if (remoteContainerRef.current) {
                    remoteContainerRef.current.innerHTML = ''
                  }
                  
                  // Fill main video area with remote video
                  el.style.width = '100%'
                  el.style.height = '100%'
                  el.style.objectFit = 'cover'
                  el.style.position = 'absolute'
                  el.style.top = '0'
                  el.style.left = '0'
                  el.style.zIndex = '1'
                  el.setAttribute('data-participant', participant.identity)
                  videoAreaRef.current.appendChild(el)
                }
              }
            } else {
              audioContainerRef.current?.appendChild(el)
            }
          }
        })
          }
          
          if (participant.audioTracks && typeof participant.audioTracks.forEach === 'function') {
            participant.audioTracks.forEach((pub: any) => {
              const track = pub.audioTrack
              if (track) {
                const el = track.attach()
                el.autoplay = true
                ;(el as any).muted = false
                ;(el as any).play?.().catch(() => {})
                audioContainerRef.current?.appendChild(el)
              }
            })
          }
        })
      }
      
      setConnectedInfo({ room: room.name, is_member: canPub, topic: topic, identity })
      
      // If user can publish, ensure local video wrapper exists in grid (with placeholder if camera is off)
      if (canPub && remoteContainerRef.current) {
        setTimeout(() => {
          let existingLocalInGrid = remoteContainerRef.current?.querySelector('#video-local') as HTMLElement
          
          if (!existingLocalInGrid) {
            // Create wrapper for local video
            existingLocalInGrid = document.createElement('div')
            existingLocalInGrid.id = 'video-local'
            existingLocalInGrid.style.position = 'relative'
            existingLocalInGrid.style.width = '100%'
            existingLocalInGrid.style.height = '100%'
            existingLocalInGrid.style.aspectRatio = '16/9'
            existingLocalInGrid.style.cursor = 'grab'
            existingLocalInGrid.style.touchAction = 'none'
            existingLocalInGrid.style.zIndex = '100' // Higher z-index to be on top
            existingLocalInGrid.style.borderRadius = '6px'
            existingLocalInGrid.style.overflow = 'hidden'
            existingLocalInGrid.style.background = '#f1f5f9'
            
            remoteContainerRef.current.appendChild(existingLocalInGrid)
            
            // Attach drag handlers
            attachDragHandlers(existingLocalInGrid as HTMLDivElement, 'local')
          }
          
          // If camera is off, show placeholder
          if (!cameraOn) {
            const existingPlaceholder = existingLocalInGrid.querySelector('.local-video-placeholder')
            if (!existingPlaceholder) {
              // Remove video if exists
              const existingVideo = existingLocalInGrid.querySelector('video')
              if (existingVideo) existingVideo.remove()
              
              // Create placeholder
              const placeholder = document.createElement('div')
              placeholder.className = 'local-video-placeholder'
              placeholder.style.display = 'flex'
              placeholder.style.flexDirection = 'column'
              placeholder.style.alignItems = 'center'
              placeholder.style.justifyContent = 'center'
              placeholder.style.width = '100%'
              placeholder.style.height = '100%'
              placeholder.style.color = '#94a3b8'
              
              const icon = document.createElement('img')
              icon.src = '/assets/icons/camera.svg'
              icon.style.width = '48px'
              icon.style.height = '48px'
              icon.style.opacity = '0.3'
              
              placeholder.appendChild(icon)
              existingLocalInGrid.appendChild(placeholder)
            }
          }
        }, 200)
      }
    } catch (e: any) {
      console.error('Error reconnecting with new token:', e)
      setError(e?.message || 'Ошибка переподключения')
      alert('Ошибка при переподключении. Пожалуйста, обновите страницу.')
    }
  }

  // Effect to attach local video when camera is turned on and manage placeholder
  useEffect(() => {
    if (roomRef.current) {
      // Small timeout to ensure video element is mounted
      const timer = setTimeout(() => {
        if (videoRef.current && roomRef.current) {
          const LKC = (window as any).LivekitClient || (window as any).LiveKit
          if (!LKC) return
          const { Track } = LKC
          const camPub = roomRef.current.localParticipant.getTrackPublication(Track.Source.Camera)
          if (camPub?.videoTrack) {
            camPub.videoTrack.attach(videoRef.current)
            
            // When user can publish, move local video to remote grid (right bottom)
            if (canPublish && remoteContainerRef.current) {
              // Check if local video wrapper is already in grid
              let existingLocalInGrid = remoteContainerRef.current.querySelector('#video-local') as HTMLElement
              
              if (!existingLocalInGrid) {
                // Create wrapper for local video
                existingLocalInGrid = document.createElement('div')
                existingLocalInGrid.id = 'video-local'
                existingLocalInGrid.style.position = 'relative'
                existingLocalInGrid.style.width = '100%'
                existingLocalInGrid.style.height = '100%'
                existingLocalInGrid.style.aspectRatio = '16/9'
                existingLocalInGrid.style.cursor = 'grab'
                existingLocalInGrid.style.touchAction = 'none'
                existingLocalInGrid.style.zIndex = '100' // Higher z-index to be on top
                existingLocalInGrid.style.borderRadius = '6px'
                existingLocalInGrid.style.overflow = 'hidden'
                existingLocalInGrid.style.background = '#f1f5f9'
                
                remoteContainerRef.current.appendChild(existingLocalInGrid)
                
                // Attach drag handlers
                attachDragHandlers(existingLocalInGrid as HTMLDivElement, 'local')
              }
              
              // Update wrapper content based on camera state
              if (cameraOn && videoRef.current) {
                // Remove placeholder if exists
                const placeholder = existingLocalInGrid.querySelector('.local-video-placeholder')
                if (placeholder) placeholder.remove()
                
                // Remove from main area if it's there
                if (videoRef.current.parentNode === videoAreaRef.current) {
                  videoRef.current.remove()
                }
                
                // Add video to wrapper if not already there
                if (videoRef.current.parentNode !== existingLocalInGrid) {
                  // Update video styles for grid
                  videoRef.current.style.position = 'relative'
                  videoRef.current.style.width = '100%'
                  videoRef.current.style.height = '100%'
                  videoRef.current.style.objectFit = 'cover'
                  videoRef.current.style.top = '0'
                  videoRef.current.style.left = '0'
                  videoRef.current.style.zIndex = '1'
                  videoRef.current.style.transform = 'scaleX(-1)'
                  videoRef.current.style.display = 'block'
                  
                  existingLocalInGrid.appendChild(videoRef.current)
                }
              } else {
                // Camera is off - show placeholder
                const existingPlaceholder = existingLocalInGrid.querySelector('.local-video-placeholder')
                if (!existingPlaceholder) {
                  // Remove video if exists
                  const existingVideo = existingLocalInGrid.querySelector('video')
                  if (existingVideo) existingVideo.remove()
                  
                  // Create placeholder
                  const placeholder = document.createElement('div')
                  placeholder.className = 'local-video-placeholder'
                  placeholder.style.display = 'flex'
                  placeholder.style.flexDirection = 'column'
                  placeholder.style.alignItems = 'center'
                  placeholder.style.justifyContent = 'center'
                  placeholder.style.width = '100%'
                  placeholder.style.height = '100%'
                  placeholder.style.color = '#94a3b8'
                  
                  const icon = document.createElement('img')
                  icon.src = '/assets/icons/camera.svg'
                  icon.style.width = '48px'
                  icon.style.height = '48px'
                  icon.style.opacity = '0.3'
                  
                  placeholder.appendChild(icon)
                  existingLocalInGrid.appendChild(placeholder)
                }
              }
            } else if (!canPublish && videoAreaRef.current && videoRef.current) {
              // When user cannot publish, keep local video in main area (but it will be hidden when remote video appears)
              const existingLocalInGrid = remoteContainerRef.current?.querySelector('#video-local')
              if (existingLocalInGrid) {
                const wrapper = existingLocalInGrid
                const video = wrapper.querySelector('video')
                if (video && video === videoRef.current) {
                  wrapper.remove()
                  // Restore video styles for main area
                  videoRef.current.style.position = 'absolute'
                  videoRef.current.style.width = '100%'
                  videoRef.current.style.height = '100%'
                  videoRef.current.style.objectFit = 'cover'
                  videoRef.current.style.top = '0'
                  videoRef.current.style.left = '0'
                  videoRef.current.style.zIndex = '1'
                  videoRef.current.style.transform = 'scaleX(-1)'
                  videoAreaRef.current.appendChild(videoRef.current)
                }
              }
            }
          }
        }
        
        // Also handle when camera is off but canPublish is true - show placeholder in grid
        if (!cameraOn && canPublish && remoteContainerRef.current) {
          let existingLocalInGrid = remoteContainerRef.current.querySelector('#video-local') as HTMLElement
          
          if (!existingLocalInGrid) {
            // Create wrapper for local video placeholder
            existingLocalInGrid = document.createElement('div')
            existingLocalInGrid.id = 'video-local'
            existingLocalInGrid.style.position = 'relative'
            existingLocalInGrid.style.width = '100%'
            existingLocalInGrid.style.height = '100%'
            existingLocalInGrid.style.aspectRatio = '16/9'
            existingLocalInGrid.style.cursor = 'grab'
            existingLocalInGrid.style.touchAction = 'none'
            existingLocalInGrid.style.zIndex = '100' // Higher z-index to be on top
            existingLocalInGrid.style.borderRadius = '6px'
            existingLocalInGrid.style.overflow = 'hidden'
            existingLocalInGrid.style.background = '#f1f5f9'
            
            remoteContainerRef.current.appendChild(existingLocalInGrid)
            
            // Attach drag handlers
            attachDragHandlers(existingLocalInGrid as HTMLDivElement, 'local')
          }
          
          // Show placeholder
          const existingPlaceholder = existingLocalInGrid.querySelector('.local-video-placeholder')
          if (!existingPlaceholder) {
            // Remove video if exists
            const existingVideo = existingLocalInGrid.querySelector('video')
            if (existingVideo) existingVideo.remove()
            
            // Create placeholder
            const placeholder = document.createElement('div')
            placeholder.className = 'local-video-placeholder'
            placeholder.style.display = 'flex'
            placeholder.style.flexDirection = 'column'
            placeholder.style.alignItems = 'center'
            placeholder.style.justifyContent = 'center'
            placeholder.style.width = '100%'
            placeholder.style.height = '100%'
            placeholder.style.color = '#94a3b8'
            
            const icon = document.createElement('img')
            icon.src = '/assets/icons/camera.svg'
            icon.style.width = '48px'
            icon.style.height = '48px'
            icon.style.opacity = '0.3'
            
            placeholder.appendChild(icon)
            existingLocalInGrid.appendChild(placeholder)
          }
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [cameraOn, canPublish])

  // отключено авто-подключение — соответствуем дизайну (кнопка «Присоединиться»/«Запустить прямой эфир»)

  async function toggleCamera() {
    try {
      const room = roomRef.current
      if (!room) return
      
      // If user is not the owner, check if they have permission
      if (!canPublish) {
        const identity = connectedInfo?.identity || String((personalData as any)?.id || '')
        const permissions = participantPermissions[identity]
        if (!permissions?.canPublishVideo && !cameraOn) {
          alert('Владелец стрима не разрешил вам включать камеру')
          return
        }
      }
      const newState = !cameraOn
      
      if (newState) {
        try {
          await room.localParticipant.setCameraEnabled(true, selectedCam ? { deviceId: selectedCam } : undefined)
        } catch (e) {
          console.warn('Failed with specific device, trying default', e)
          await room.localParticipant.setCameraEnabled(true)
        }
        // Refresh devices to get labels if this was the first permission grant
        getDevices()
      } else {
        await room.localParticipant.setCameraEnabled(false)
      }

      setCameraOn(newState)
    } catch (e) {
      console.error(e)
      alert('Не удалось получить доступ к камере. Проверьте настройки браузера.')
    }
  }

  async function toggleMic() {
    try {
      const room = roomRef.current
      if (!room) return
      
      // If user is not the owner, check if they have permission
      if (!canPublish) {
        const identity = connectedInfo?.identity || String((personalData as any)?.id || '')
        const permissions = participantPermissions[identity]
        if (!permissions?.canPublishAudio && !micOn) {
          alert('Владелец стрима не разрешил вам включать микрофон')
          return
        }
      }
      
      const newState = !micOn
      
      if (newState) {
        try {
          await room.localParticipant.setMicrophoneEnabled(true, selectedMic ? { deviceId: selectedMic } : undefined)
        } catch (e) {
          console.warn('Failed with specific mic, trying default', e)
          await room.localParticipant.setMicrophoneEnabled(true)
        }
        getDevices()
      } else {
        await room.localParticipant.setMicrophoneEnabled(false)
      }
      setMicOn(newState)
    } catch (e) {
      console.error(e)
      alert('Не удалось получить доступ к микрофону. Проверьте настройки браузера.')
    }
  }

  async function updateParticipantPermission(targetIdentity: string, permissionType: 'audio' | 'video', granted: boolean) {
    if (!roomRef.current || !isStreamOwner) return
    
    try {
      const currentPermissions = participantPermissions[targetIdentity] || { canPublishAudio: false, canPublishVideo: false }
      const message = {
        type: 'permission_update',
        targetIdentity,
        canPublishAudio: permissionType === 'audio' ? granted : currentPermissions.canPublishAudio,
        canPublishVideo: permissionType === 'video' ? granted : currentPermissions.canPublishVideo
      }
      
      
      // Send permission update via LiveKit data channel
      // Check if room is connected before sending data
      if (!roomRef.current || roomRef.current.state !== 'connected') {
        console.warn('Cannot send data, room not ready')
        return
      }
      
      const encoder = new TextEncoder()
      const data = encoder.encode(JSON.stringify(message))
      
      try {
        await roomRef.current.localParticipant.publishData(data, {
          reliable: true,
          destinationIdentities: [] // Broadcast to all participants
        })
      } catch (e) {
        console.warn('Failed to publish data:', e)
      }
      
      // Update local state immediately
      setParticipantPermissions(prev => {
        const updated = {
          ...prev,
          [targetIdentity]: {
            canPublishAudio: message.canPublishAudio,
            canPublishVideo: message.canPublishVideo
          }
        }
        return updated
      })
    } catch (e) {
      console.error('Error updating participant permission:', e)
    }
  }

  async function toggleParticipantConnection(targetIdentity: string, allow: boolean) {
    if (!roomRef.current || !isStreamOwner || !conferenceId) return
    
    try {
      // Parse userId from identity (identity is typically the userId as string)
      const targetUserId = Number(targetIdentity)
      if (isNaN(targetUserId)) {
        console.error('Invalid userId from identity:', targetIdentity)
        return
      }

      // Add or remove member via API
      if (allow) {
        // Add member
        await httpClientWithAuth(`${MEMBERS_API}/add`, {
          method: 'POST',
          body: JSON.stringify({
            conferenceId: conferenceId,
            userId: targetUserId
          })
        })
      } else {
        // Remove member
        await httpClientWithAuth(`${MEMBERS_API}/remove`, {
          method: 'DELETE',
          body: JSON.stringify({
            conferenceId: conferenceId,
            userId: targetUserId
          })
        })
      }

      // Update local state immediately (before sending notification)
      setParticipantPermissions(prev => {
        const updated = {
          ...prev,
          [targetIdentity]: {
            canPublishAudio: allow,
            canPublishVideo: allow
          }
        }
        return updated
      })

      // If permissions are being revoked, check if target user is in the room and disable their devices
      if (!allow && roomRef.current && roomRef.current.state === 'connected') {
        const targetParticipant = Array.from(roomRef.current.remoteParticipants.values())
          .find((p: any) => p.identity === targetIdentity)
        
        if (targetParticipant) {
          // Note: We can't directly control remote participant's devices, but we send notification
          // The participant will receive the permission_update and handle it themselves
        }
      }
      
      const message = {
        type: 'permission_update',
        targetIdentity,
        canPublishAudio: allow,
        canPublishVideo: allow,
        notification: allow 
          ? 'Вам разрешили подключить микрофон и камеру'
          : 'Вам отозвали разрешение на использование камеры и микрофона'
      }
      
      // Send permission update via LiveKit data channel
      // Check if room is connected before sending data
      if (!roomRef.current || roomRef.current.state !== 'connected') {
        console.warn('Cannot send data, room not ready')
        return
      }
      
      const encoder = new TextEncoder()
      const data = encoder.encode(JSON.stringify(message))
      
      try {
        await roomRef.current.localParticipant.publishData(data, {
          reliable: true,
          destinationIdentities: [] // Broadcast to all participants
        })
      } catch (e) {
        console.warn('Failed to publish data:', e)
      }
    } catch (e) {
      console.error('Error updating participant connection permission:', e)
      alert('Ошибка при обновлении разрешений участника')
    }
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
    if (audioContainerRef.current) {
      audioContainerRef.current.innerHTML = ''
    }
  }

  async function sendChatMessage() {
    if (!chatInput.trim() || !roomRef.current) return
    
    // Check if room is connected before sending data
    if (roomRef.current.state !== 'connected') {
      console.warn('Cannot send message, room not ready')
      return
    }
    
    const identity = connectedInfo?.identity || String((personalData as any)?.id || '')
    const messageText = chatInput.trim()
    
    const message = {
      type: 'chat',
      id: Date.now().toString(),
      identity,
      message: messageText,
      timestamp: Date.now()
    }
    
    // Check if room is connected before sending data
    if (roomRef.current.state !== 'connected') {
      console.warn('Cannot send message, room not ready')
      return
    }
    
    try {
      // Send message via LiveKit data channel
      const encoder = new TextEncoder()
      const data = encoder.encode(JSON.stringify(message))
      
      await roomRef.current.localParticipant.publishData(data, {
        reliable: true,
        destinationIdentities: [] // Empty array means broadcast to all participants
      })
      
      // Add message to local state immediately for better UX
      setChatMessages(prev => [...prev, {
        id: message.id,
        identity,
        message: messageText,
        timestamp: message.timestamp
      }])
      setChatInput('')
    } catch (e) {
      console.error('Error sending message:', e)
      // Still add to local state even if send fails
      setChatMessages(prev => [...prev, {
        id: message.id,
        identity,
        message: messageText,
        timestamp: message.timestamp
      }])
      setChatInput('')
    }
  }

  return (
    <div className={s.meetingCard}>
      <div className={s.header}>
        <Image src="/assets/icons/myconf.svg" alt="" width={24} height={24} />
        <span className={s.title}>{conf?.topic || 'Конференция'}</span>
      </div>

      <div className={s.infoBlock} style={{ marginBottom: 16, padding: '12px 16px', background: '#f8fafc', borderRadius: 8 }}>
        <div className={s.infoRow} style={{ marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: '#64748b' }}>Идентификатор:</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className={s.codeValue} style={{ fontSize: 14 }}>{conferenceId}</span>
            <button className={s.copyBtn} onClick={() => navigator.clipboard.writeText(conf?.code || conferenceId)}>
              <Image src="/assets/icons/copy.svg" alt="copy" width={16} height={16} />
            </button>
          </div>
        </div>
        <div className={s.infoRow} style={{ fontSize: 12, color: '#64748b', justifyContent: 'flex-start', gap: 8 }}>
          <span>Пригласить по ссылке:</span>
          <span className={s.linkAction} onClick={() => navigator.clipboard.writeText(window.location.href)}>скопировать</span>
        </div>
      </div>

      <div className={s.layout}>
        <div className={s.leftPanel}>
          <div className={s.videoArea} ref={videoAreaRef}>
            <video 
              ref={videoRef} 
              autoPlay 
              muted 
              playsInline 
              className={s.video}
              style={{ display: cameraOn ? 'block' : 'none' }}
            />
            {!cameraOn && (
               <div className={s.videoPlaceholder}>
                 <Image src="/assets/icons/camera.svg" alt="" width={64} height={64} style={{ opacity: 0.2 }} />
               </div>
            )}
            <div ref={remoteContainerRef} className={s.remoteGrid}></div>
            <div ref={audioContainerRef} style={{ display: 'none' }}></div>
          </div>

          {hasDevicePermissions && (
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
          )}
        </div>

        <div className={s.rightPanel}>
          <div className={s.tabsContainer}>
            <div className={s.tabs}>
              <button 
                className={`${s.tab} ${activeTab === 'chat' ? s.tabActive : ''}`}
                onClick={() => setActiveTab('chat')}
              >
                Чат
              </button>
              <button 
                className={`${s.tab} ${activeTab === 'participants' ? s.tabActive : ''}`}
                onClick={() => setActiveTab('participants')}
              >
                Участники ({participants.length + 1})
                </button>
              </div>

            {activeTab === 'chat' && (
              <div className={s.chatContainer}>
                <div className={s.chatMessages} ref={chatMessagesRef}>
                  {chatMessages.length === 0 ? (
                    <div style={{ padding: 20, textAlign: 'center', color: '#64748b', fontSize: 14 }}>
                      Нет сообщений
            </div>
                  ) : (
                    chatMessages.map((msg) => {
                      const isOwnMessage = msg.identity === (connectedInfo?.identity || String((personalData as any)?.id || ''))
                      return (
                        <div 
                          key={msg.id} 
                          className={`${s.chatMessage} ${isOwnMessage ? s.chatMessageOwn : s.chatMessageOther}`}
                          style={{
                            alignSelf: isOwnMessage ? 'flex-end' : 'flex-start',
                            maxWidth: '80%',
                            marginBottom: '8px'
                          }}
                        >
                          <div className={s.chatMessageHeader}>
                            <span className={s.chatMessageAuthor}>
                              {isOwnMessage ? 'Вы' : msg.identity}
                            </span>
                            <span className={s.chatMessageTime}>
                              {new Date(msg.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                            </span>
            </div>
                          <div 
                            className={s.chatMessageText}
                            style={{
                              backgroundColor: isOwnMessage ? '#3b82f6' : '#f1f5f9',
                              color: isOwnMessage ? '#ffffff' : '#1e293b',
                              padding: '8px 12px',
                              borderRadius: '12px',
                              wordWrap: 'break-word'
                            }}
                          >
                            {msg.message}
            </div>
          </div>
                      )
                    })
                  )}
                </div>
                <div className={s.chatInputContainer}>
               <input 
                    className={s.chatInput}
                    placeholder="Введите сообщение..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        sendChatMessage()
                      }
                    }}
                  />
                  <button className={s.chatSendBtn} onClick={sendChatMessage}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
               </button>
                </div>
            </div>
          )}

            {activeTab === 'participants' && (
              <div className={s.participantsContainer}>
                <div className={s.participantItem} style={{ fontWeight: 600 }}>
                  <span>{connectedInfo?.identity || 'Вы'}</span>
                  <span style={{ fontSize: 12, color: '#64748b' }}>{isStreamOwner ? 'Владелец стрима' : 'Вы'}</span>
                </div>
                {participants.map((p, idx) => {
                  const permissions = participantPermissions[p.identity] || { canPublishAudio: false, canPublishVideo: false }
                  const currentIdentity = connectedInfo?.identity || String((personalData as any)?.id || '')
                  const isCurrentUser = p.identity === currentIdentity
                  const hasConnectionPermission = permissions.canPublishAudio && permissions.canPublishVideo
                  
                  return (
                    <div key={idx} className={s.participantItem} style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <span>{p.name || p.identity}</span>
                        <span style={{ fontSize: 12, color: '#64748b' }}>Участник</span>
                      </div>
                      {isStreamOwner && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', marginTop: '8px' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: 13 }}>
                            <input
                              type="checkbox"
                              checked={hasConnectionPermission}
                              onChange={(e) => toggleParticipantConnection(p.identity, e.target.checked)}
                              style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                            />
                            <span>Разрешить подключиться</span>
                          </label>
                          {hasConnectionPermission && (
                            <span style={{ fontSize: 11, color: '#10b981', marginLeft: '4px' }}>✓</span>
                          )}
                        </div>
                      )}
                      {!isStreamOwner && isCurrentUser && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', marginTop: '8px', fontSize: 12, color: '#64748b' }}>
                          {hasConnectionPermission ? (
                            <span style={{ color: '#10b981' }}>✓ Вам разрешено подключить микрофон и камеру</span>
                          ) : (
                            <span>✗ Подключение микрофона и камеры не разрешено</span>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
                {participants.length === 0 && (
                  <div style={{ padding: 20, textAlign: 'center', color: '#64748b', fontSize: 14 }}>
                    Нет других участников
                  </div>
                )}
              </div>
            )}
          </div>

          <div className={s.actions}>
            {isStream ? (
               <button className={s.exitBtn} style={{ color: '#ef4444', borderColor: '#ef4444' }} onClick={() => { leaveRoom(); router.push(`/${language}/dashboard/video-conference`) }}>
                 Завершить стрим
               </button>
            ) : canPublish ? (
               <button className={s.exitBtn} style={{ color: '#ef4444', borderColor: '#ef4444' }} onClick={() => { leaveRoom(); router.push(`/${language}/dashboard/video-conference`) }}>
                 Завершить встречу
               </button>
            ) : (
               <button className={s.exitBtn} onClick={() => { leaveRoom(); router.push(`/${language}/dashboard/video-conference`) }}>
                 Выйти
               </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

