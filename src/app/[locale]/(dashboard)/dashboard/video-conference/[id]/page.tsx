'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { useRouter, usePathname, useParams, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Cookies from 'js-cookie'
import { useTranslations } from 'next-intl'
import { Button } from '@/shared/ui-kit'
import { httpClientWithAuth } from '@/shared/api/httpClient'
import { useLoginStore } from '@/features/auth/login'
import { VIDEO_API_BASE_URL } from '@/shared/config'
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
  const [connectedInfo, setConnectedInfo] = useState<null | { room: string; is_member: boolean; topic?: string; identity?: string; name?: string, userName?: string }>(null)
  const [error, setError] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const remoteContainerRef = useRef<HTMLDivElement | null>(null)
  const remoteVideosContainerRef = useRef<HTMLDivElement | null>(null)
  const audioContainerRef = useRef<HTMLDivElement | null>(null)
  const chatMessagesRef = useRef<HTMLDivElement | null>(null)

  const videoAreaRef = useRef<HTMLDivElement | null>(null)

  const roomRef = useRef<any>(null)
  const livekitUrlRef = useRef<string>('wss://video.zanger-app.kz')
  const livekitTokenRef = useRef<string>('')
  const BASE = 'https://api.zanger-app.kz/api/livekit'
  const BASE_API = `${VIDEO_API_BASE_URL}/java-api/video-conferences`
  const MEMBERS_API = `${VIDEO_API_BASE_URL}/java-api/conference-members`
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
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; identity: string; message: string; timestamp: number; msgName?: string }>>([])
  const [chatInput, setChatInput] = useState('')
  const [participantPermissions, setParticipantPermissions] = useState<Record<string, { canPublishAudio: boolean; canPublishVideo: boolean }>>({})
  const [cameraRequestNotification, setCameraRequestNotification] = useState<{ show: boolean; from?: string; fromIdentity?: string; requestId?: string }>({ show: false })
  
  // Debug: Log when notification state changes
  useEffect(() => {
    console.log('Camera request notification state changed:', cameraRequestNotification)
  }, [cameraRequestNotification])
  
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
      
      // Update permissions based on remote participants
      const newPermissions: Record<string, { canPublishAudio: boolean; canPublishVideo: boolean }> = {}
      
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
        
        // Get permissions from remote participant
        const canPublish = p.permissions?.canPublish ?? false
        newPermissions[p.identity] = {
          canPublishAudio: canPublish,
          canPublishVideo: canPublish
        }
      })
      
      // Update permissions state
      setParticipantPermissions(prev => {
        return {
          ...prev,
          ...newPermissions
        }
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

  // Helper function to remove remote video
  function removeRemoteVideo(identity: string) {
    if (remoteVideosContainerRef.current) {
      const wrapper = remoteVideosContainerRef.current.querySelector(`#remote-video-${identity}`)
      if (wrapper) {
        wrapper.remove()
        updateRemoteVideosGrid()
        
        // Recalculate video layout after removal
        if (canPublish) {
          // Count remaining remote videos by checking DOM
          let activeRemoteVideosCount = 0
          if (remoteVideosContainerRef.current) {
            remoteVideosContainerRef.current.querySelectorAll('[data-participant]').forEach((wrapper) => {
              const videoElement = wrapper.querySelector('video')
              if (videoElement) {
                activeRemoteVideosCount++
              }
            })
          }
          const hasLocalVideo = cameraOn
          const totalActiveVideos = activeRemoteVideosCount + (hasLocalVideo ? 1 : 0)
          
          // If only local video remains, move it to main area
          if (totalActiveVideos === 1 && hasLocalVideo && videoRef.current) {
            const isLocalVideo = !videoRef.current.hasAttribute('data-participant')
            if (isLocalVideo) {
              const localWrapper = remoteContainerRef.current?.querySelector('#video-local')
              if (localWrapper && localWrapper.contains(videoRef.current)) {
                videoRef.current.remove()
                videoRef.current.style.position = 'absolute'
                videoRef.current.style.width = '100%'
                videoRef.current.style.height = '100%'
                videoRef.current.style.objectFit = 'cover'
                videoRef.current.style.top = '0'
                videoRef.current.style.left = '0'
                videoRef.current.style.zIndex = '1'
                videoRef.current.style.transform = 'scaleX(-1)'
                if (videoAreaRef.current) {
                  videoAreaRef.current.appendChild(videoRef.current)
                }
                localWrapper.remove()
              }
            }
          }
        }
      }
    }
  }

  // Helper function to render remote video
  function renderRemoteVideo(track: any, pub: any, participant: any) {
    if (!remoteVideosContainerRef.current) return

    // If muted -> don't show (prevents black blocks)
    if (pub?.isMuted) {
      removeRemoteVideo(participant.identity)
      return
    }

    // Remove existing video for this participant
    removeRemoteVideo(participant.identity)

    // Create wrapper for remote video
    const wrapper = document.createElement('div')
    wrapper.id = `remote-video-${participant.identity}`
    wrapper.setAttribute('data-participant', participant.identity)

    // Attach track to element
    const el = track.attach()
    el.autoplay = true
    el.playsInline = true
    el.muted = true // IMPORTANT: allow autoplay reliably for remote videos
    el.style.width = '100%'
    el.style.height = '100%'
    el.style.objectFit = 'cover'
    el.style.display = 'block'
    el.setAttribute('data-participant', participant.identity)

    // Add event listener to ensure video plays when ready
    el.addEventListener('loadedmetadata', () => {
      el.play?.().catch(() => {})
    }, { once: true })

    wrapper.appendChild(el)
    remoteVideosContainerRef.current.appendChild(wrapper)
    updateRemoteVideosGrid()

    // After adding remote video, check if local video should move to bottom right
    if (canPublish) {
      // Count current remote videos by checking DOM
      let activeRemoteVideosCount = 0
      if (remoteVideosContainerRef.current) {
        remoteVideosContainerRef.current.querySelectorAll('[data-participant]').forEach((wrapper) => {
          const videoElement = wrapper.querySelector('video')
          if (videoElement) {
            activeRemoteVideosCount++
          }
        })
      }
      const hasLocalVideo = cameraOn && videoRef.current
      
      // If there are remote videos and local video is on, ensure local is in bottom right
      if (activeRemoteVideosCount > 0 && hasLocalVideo && videoRef.current && remoteContainerRef.current) {
        // Verify this is actually the local video element (should not have data-participant attribute)
        const isLocalVideo = !videoRef.current.hasAttribute('data-participant')
        
        if (isLocalVideo) {
          // Get or create local video wrapper in bottom right grid
          let localWrapper = remoteContainerRef.current.querySelector('#video-local') as HTMLElement
          
          if (!localWrapper) {
            localWrapper = document.createElement('div')
            localWrapper.id = 'video-local'
            localWrapper.style.position = 'relative'
            localWrapper.style.width = '100%'
            localWrapper.style.height = '100%'
            localWrapper.style.aspectRatio = '16/9'
            localWrapper.style.cursor = 'grab'
            localWrapper.style.touchAction = 'none'
            localWrapper.style.zIndex = '100' // Higher z-index to be on top
            localWrapper.style.borderRadius = '6px'
            localWrapper.style.overflow = 'hidden'
            localWrapper.style.background = '#f1f5f9'
            
            remoteContainerRef.current.appendChild(localWrapper)
            attachDragHandlers(localWrapper as HTMLDivElement, 'local')
          }
          
          // Only move if local video is currently in main area
          if (videoRef.current.parentNode === videoAreaRef.current) {
            // Remove video from main area
            videoRef.current.remove()
            
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
            
            localWrapper.appendChild(videoRef.current)
          } else if (videoRef.current.parentNode !== localWrapper) {
            // Video is somewhere else, move it to wrapper
            videoRef.current.remove()
            videoRef.current.style.position = 'relative'
            videoRef.current.style.width = '100%'
            videoRef.current.style.height = '100%'
            videoRef.current.style.objectFit = 'cover'
            videoRef.current.style.top = '0'
            videoRef.current.style.left = '0'
            videoRef.current.style.zIndex = '1'
            videoRef.current.style.transform = 'scaleX(-1)'
            videoRef.current.style.display = 'block'
            localWrapper.appendChild(videoRef.current)
          }
        }
      }
    }
  }

  function updateRemoteVideosGrid() {
    if (!remoteVideosContainerRef.current) return
    
    const videoCount = remoteVideosContainerRef.current.children.length
    
    // Update grid layout based on number of videos - maintain rectangle (16:9) aspect ratio
    if (videoCount === 0) {
      remoteVideosContainerRef.current.style.display = 'none'
    } else {
      remoteVideosContainerRef.current.style.display = 'grid'
      remoteVideosContainerRef.current.style.gridAutoFlow = 'row' // Fill rows first (horizontally)
      
      // Calculate optimal grid layout based on video count
      // Aim for a layout that maintains 16:9 aspect ratio for each video
      if (videoCount === 1) {
        // Single video: full width, maintain aspect ratio
        remoteVideosContainerRef.current.style.gridTemplateColumns = '1fr'
        remoteVideosContainerRef.current.style.gridTemplateRows = '1fr'
      } else if (videoCount === 2) {
        // 2 videos: side by side
        remoteVideosContainerRef.current.style.gridTemplateColumns = 'repeat(2, 1fr)'
        remoteVideosContainerRef.current.style.gridTemplateRows = '1fr'
      } else if (videoCount === 3) {
        // 3 videos: 3 columns, 1 row
        remoteVideosContainerRef.current.style.gridTemplateColumns = 'repeat(3, 1fr)'
        remoteVideosContainerRef.current.style.gridTemplateRows = '1fr'
      } else if (videoCount === 4) {
        // 4 videos: 2x2 grid
        remoteVideosContainerRef.current.style.gridTemplateColumns = 'repeat(2, 1fr)'
        remoteVideosContainerRef.current.style.gridTemplateRows = 'repeat(2, 1fr)'
      } else if (videoCount === 5) {
        // 5 videos: 3 columns, 2 rows (3 on top, 2 on bottom)
        remoteVideosContainerRef.current.style.gridTemplateColumns = 'repeat(3, 1fr)'
        remoteVideosContainerRef.current.style.gridTemplateRows = 'repeat(2, 1fr)'
      } else if (videoCount === 6) {
        // 6 videos: 3x2 grid
        remoteVideosContainerRef.current.style.gridTemplateColumns = 'repeat(3, 1fr)'
        remoteVideosContainerRef.current.style.gridTemplateRows = 'repeat(2, 1fr)'
      } else if (videoCount === 7) {
        // 7 videos: 4 columns, 2 rows (4 on top, 3 on bottom)
        remoteVideosContainerRef.current.style.gridTemplateColumns = 'repeat(4, 1fr)'
        remoteVideosContainerRef.current.style.gridTemplateRows = 'repeat(2, 1fr)'
      } else if (videoCount === 8) {
        // 8 videos: 4x2 grid
        remoteVideosContainerRef.current.style.gridTemplateColumns = 'repeat(4, 1fr)'
        remoteVideosContainerRef.current.style.gridTemplateRows = 'repeat(2, 1fr)'
      } else if (videoCount === 9) {
        // 9 videos: 3x3 grid
        remoteVideosContainerRef.current.style.gridTemplateColumns = 'repeat(3, 1fr)'
        remoteVideosContainerRef.current.style.gridTemplateRows = 'repeat(3, 1fr)'
      } else if (videoCount <= 12) {
        // 10-12 videos: 4 columns, 3 rows
        remoteVideosContainerRef.current.style.gridTemplateColumns = 'repeat(4, 1fr)'
        remoteVideosContainerRef.current.style.gridTemplateRows = 'repeat(3, 1fr)'
      } else if (videoCount <= 16) {
        // 13-16 videos: 4x4 grid
        remoteVideosContainerRef.current.style.gridTemplateColumns = 'repeat(4, 1fr)'
        remoteVideosContainerRef.current.style.gridTemplateRows = 'repeat(4, 1fr)'
      } else if (videoCount <= 20) {
        // 17-20 videos: 5 columns, 4 rows
        remoteVideosContainerRef.current.style.gridTemplateColumns = 'repeat(5, 1fr)'
        remoteVideosContainerRef.current.style.gridTemplateRows = 'repeat(4, 1fr)'
      } else {
        // For more than 20 videos, use auto-fit with minimum width
        remoteVideosContainerRef.current.style.gridTemplateColumns = 'repeat(auto-fit, minmax(240px, 1fr))'
        remoteVideosContainerRef.current.style.gridAutoRows = 'minmax(135px, 1fr)' // Maintain 16:9 aspect ratio (240/1.777 = 135)
      }
    }
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
        setCreatorUserId(data.creatorUserId)
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
        // Store participant reference
        let updatedRemoteParticipants: Map<string, any> = new Map()
        setRemoteParticipants(prev => {
          updatedRemoteParticipants = new Map(prev)
          if (!updatedRemoteParticipants.has(participant.identity)) {
            updatedRemoteParticipants.set(participant.identity, { participant, tracks: [] })
          }
          const pData = updatedRemoteParticipants.get(participant.identity)!
          // Store track and publication for status checking
          pData.tracks.push({ track, pub })
          return updatedRemoteParticipants
        })
        
        if (track.kind === 'video') {
          // Use helper function to render remote video (handles muted state)
          renderRemoteVideo(track, pub, participant)
          } else {
          // Audio track
          const el = track.attach()
          el.autoplay = true
          ;(el as any).muted = false
          ;(el as any).play?.().catch(() => {})
          audioContainerRef.current?.appendChild(el)
        }
      })

      room.on(RoomEvent.TrackUnsubscribed, (track: any, pub: any, participant: any) => {
        // Fix: TrackUnsubscribed signature is (track, publication, participant)
        if (track.kind === 'video') {
          removeRemoteVideo(participant.identity)
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
        
        // Detach track elements
        track.detach().forEach((el: any) => {
          el?.remove()
        })
      })

      // Handle when user turns camera off (TrackMuted)
      room.on(RoomEvent.TrackMuted, (pub: any, participant: any) => {
        // TrackMuted args: (TrackPublication, Participant)
        if (pub?.kind === 'video' || pub?.track?.kind === 'video') {
          // User turned off camera - remove video element to prevent black screen
          removeRemoteVideo(participant.identity)
        }
      })

      // Handle when user turns camera on (TrackUnmuted)
      room.on(RoomEvent.TrackUnmuted, (pub: any, participant: any) => {
        // TrackUnmuted args: (TrackPublication, Participant)
        if (pub?.kind !== 'video' && pub?.track?.kind !== 'video') return

        // If we already have the track, re-render immediately
        const vtrack = pub?.videoTrack || pub?.track
        if (vtrack) {
          renderRemoteVideo(vtrack, pub, participant)
              return
            }

        // Otherwise ask to subscribe (will trigger TrackSubscribed)
        pub?.setSubscribed?.(true)
      })

      // Handle SFU pause/resume (helps with black screens after refresh)
      room.on(RoomEvent.TrackStreamStateChanged, (pub: any, streamState: any, participant: any) => {
        // args: (pub, streamState, participant)
        if (pub?.kind !== 'video') return
        
        const LKC = (window as any).LivekitClient || (window as any).LiveKit
        const { Track } = LKC
        
        if (streamState === (Track?.StreamState?.Paused ?? 'paused')) {
          // Stream paused by SFU - remove video to prevent black screen
          removeRemoteVideo(participant.identity)
        } else if (!pub.isMuted && (pub.videoTrack || pub.track)) {
          // Stream resumed and not muted - re-render video
          renderRemoteVideo(pub.videoTrack || pub.track, pub, participant)
        }
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
        if (remoteVideosContainerRef.current) {
          const wrapper = remoteVideosContainerRef.current.querySelector(`#remote-video-${p.identity}`)
          if (wrapper) {
            wrapper.remove()
            updateRemoteVideosGrid()
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
              timestamp: messageData.timestamp || Date.now(),
              msgName: participant?.name || messageData.name || participant?.identity || messageData.identity || 'Unknown'
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
              const currentIdentity = String(connectedInfo?.identity || (personalData as any)?.id || '')
              const targetIdentityStr = String(targetIdentity)
              const isCurrentUser = targetIdentityStr === currentIdentity
              
              // Check previous permissions before updating (read from state, not from parameter)
              const previousPermissions = participantPermissions[targetIdentityStr]
              
              // Check if permissions were granted (both true now, weren't both true before)
              const justGotFullPermission = isCurrentUser && 
                canPublishAudio && canPublishVideo && 
                (!previousPermissions?.canPublishAudio || !previousPermissions?.canPublishVideo)
              
              // Check if permissions were revoked
              // Simplified: if both are false and user is the target, it's a revocation
              // We handle it regardless of previous state to ensure devices are disabled
              const permissionsRevoked = isCurrentUser && 
                !canPublishAudio && 
                !canPublishVideo
              
              
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
                  // If user just got full connection permission, regenerate token and reconnect
                  if (justGotFullPermission) {
                    reconnectWithNewToken()
                  }
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
                  
                  
                }
              }
            } 
          } else if (messageData.type === 'camera_request') {
            // Handle camera request - show notification to stream owner
            const currentIdentity = String(connectedInfo?.identity || (personalData as any)?.id || '')
            const targetIdentity = String(messageData.targetIdentity || '')
            const fromIdentity = String(messageData.fromIdentity || '')
            
            // Show notification to stream owner if they are the target
            // Check if current user is stream owner by comparing with creatorUserId
            const currentUserId = Number(userId || (personalData as any)?.id || 0)
            const isCurrentUserStreamOwner = creatorUserId !== null && creatorUserId === currentUserId

            
            // Check if targetIdentity matches currentIdentity (exact match)
            // OR if targetIdentity matches creatorUserId (as string)
            const targetMatchesCurrent = targetIdentity === currentIdentity
            const targetMatchesCreatorId = creatorUserId !== null && targetIdentity === String(creatorUserId)
            
            console.log('Camera request received:', {
              targetIdentity,
              currentIdentity,
              creatorUserId,
              currentUserId,
              isCurrentUserStreamOwner,
              targetMatchesCurrent,
              targetMatchesCreatorId,
              messageData,
              connectedInfo
            })
            
            // Show notification to stream owner if targetIdentity matches their identity
            // Check multiple ways to match:
            // 1. Exact match with currentIdentity
            // 2. Match with creatorUserId (as string)
            // 3. Match with creatorUserId (as number comparison)
            const targetMatchesCreatorIdAsString = creatorUserId !== null && targetIdentity === String(creatorUserId)
            const targetMatchesCreatorIdAsNumber = creatorUserId !== null && Number(targetIdentity) === creatorUserId

            console.log('targetMatchesCreatorIdAsString', targetMatchesCreatorIdAsString)
            console.log('targetMatchesCreatorIdAsNumber', targetMatchesCreatorIdAsNumber)
            console.log('targetMatchesCurrent', targetMatchesCurrent)
            console.log('isCurrentUserStreamOwner', isCurrentUserStreamOwner)
            
            const shouldShow = currentIdentity == targetIdentity;
            
            console.log('Should show notification:', {
              shouldShow,
              isCurrentUserStreamOwner,
              targetMatchesCurrent,
              targetMatchesCreatorIdAsString,
              targetMatchesCreatorIdAsNumber,
              targetIdentity,
              currentIdentity,
              creatorUserId,
              'targetIdentity type': typeof targetIdentity,
              'currentIdentity type': typeof currentIdentity,
              'creatorUserId type': typeof creatorUserId
            })
            
            if (shouldShow) {
              console.log('✅ Setting camera request notification to show')
              const notificationData = {
                show: true,
                from: messageData.fromName || messageData.fromIdentity || 'Участник',
                fromIdentity: fromIdentity,
                requestId: messageData.requestId
              }
              console.log('Notification data:', notificationData)
              setCameraRequestNotification(notificationData)
            } else {
              console.log('❌ NOT showing notification - conditions not met')
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
            // Store participant reference
            setRemoteParticipants(prev => {
              const updated = new Map(prev)
              if (!updated.has(participant.identity)) {
                updated.set(participant.identity, { participant, tracks: [] })
              }
              const pData = updated.get(participant.identity)!
              // Store track and publication for status checking
              pData.tracks.push({ track, pub })
              return updated
            })

            // Use helper function to render remote video (handles muted state)
            renderRemoteVideo(track, pub, participant)
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

      const localParticipantName = room.localParticipant?.name || undefined
      setConnectedInfo({ room: room.name, is_member: canPublish, topic: topic, identity, userName: localParticipantName })
      
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
      
      // Clear remote videos container
      if (remoteVideosContainerRef.current) {
        remoteVideosContainerRef.current.innerHTML = ''
      }
      
      // Clear videoAreaRef but preserve the video element
      if (videoAreaRef.current) {
        // Remove all remote video elements but keep local video
        // (remote videos are now in remoteVideosContainerRef, so this is just for safety)
        
        // Ensure local video element is in DOM (React should handle this, but double-check)
        const videoElement = videoRef.current
        if (videoElement && !videoAreaRef.current.contains(videoElement)) {
          videoElement.style.display = 'none'
          videoAreaRef.current.appendChild(videoElement)
        }
      }
      
      if (audioContainerRef.current) {
        audioContainerRef.current.innerHTML = ''
      }
      
      // Reset video ref if element was lost
      if (videoRef.current && !document.body.contains(videoRef.current)) {
        // Element was removed, React will recreate it on next render
        // But we need to ensure it exists - wait for next render cycle
        setTimeout(() => {
          if (!videoRef.current && videoAreaRef.current) {
            // React should recreate it, but if not, we'll handle in useEffect
          }
        }, 0)
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
      setCreatorUserId(data.creatorUserId)

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
        // Store participant reference
        setRemoteParticipants(prev => {
          const updated = new Map(prev)
          if (!updated.has(participant.identity)) {
            updated.set(participant.identity, { participant, tracks: [] })
          }
          const pData = updated.get(participant.identity)!
          // Store track and publication for status checking
          pData.tracks.push({ track, pub })
          return updated
        })
        
        if (track.kind === 'video') {
          // Use helper function to render remote video (handles muted state)
          renderRemoteVideo(track, pub, participant)
          } else {
          // Audio track
          const el = track.attach()
          el.autoplay = true
          ;(el as any).muted = false
          ;(el as any).play?.().catch(() => {})
          audioContainerRef.current?.appendChild(el)
        }
      })
      
      room.on(RoomEvent.TrackUnsubscribed, (track: any, pub: any, participant: any) => {
        // Fix: TrackUnsubscribed signature is (track, publication, participant)
        if (track.kind === 'video') {
          removeRemoteVideo(participant.identity)
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
        
        // Detach track elements
        track.detach().forEach((el: any) => {
          el?.remove()
        })
      })

      // Handle when user turns camera off (TrackMuted)
      room.on(RoomEvent.TrackMuted, (pub: any, participant: any) => {
        // TrackMuted args: (TrackPublication, Participant)
        if (pub?.kind === 'video' || pub?.track?.kind === 'video') {
          // User turned off camera - remove video element to prevent black screen
          removeRemoteVideo(participant.identity)
        }
      })

      // Handle when user turns camera on (TrackUnmuted)
      room.on(RoomEvent.TrackUnmuted, (pub: any, participant: any) => {
        // TrackUnmuted args: (TrackPublication, Participant)
        if (pub?.kind !== 'video' && pub?.track?.kind !== 'video') return

        // If we already have the track, re-render immediately
        const vtrack = pub?.videoTrack || pub?.track
        if (vtrack) {
          renderRemoteVideo(vtrack, pub, participant)
          return
        }

        // Otherwise ask to subscribe (will trigger TrackSubscribed)
        pub?.setSubscribed?.(true)
      })

      // Handle SFU pause/resume (helps with black screens after refresh)
      room.on(RoomEvent.TrackStreamStateChanged, (pub: any, streamState: any, participant: any) => {
        // args: (pub, streamState, participant)
        if (pub?.kind !== 'video') return
        
        const LKC = (window as any).LivekitClient || (window as any).LiveKit
        const { Track } = LKC
        
        if (streamState === (Track?.StreamState?.Paused ?? 'paused')) {
          // Stream paused by SFU - remove video to prevent black screen
          removeRemoteVideo(participant.identity)
        } else if (!pub.isMuted && (pub.videoTrack || pub.track)) {
          // Stream resumed and not muted - re-render video
          renderRemoteVideo(pub.videoTrack || pub.track, pub, participant)
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
        if (remoteVideosContainerRef.current) {
          const wrapper = remoteVideosContainerRef.current.querySelector(`#remote-video-${p.identity}`)
          if (wrapper) {
            wrapper.remove()
            updateRemoteVideosGrid()
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
              timestamp: messageData.timestamp || Date.now(),
              msgName: participant?.name || messageData.name || participant?.identity || messageData.identity || 'Unknown'
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
              const currentIdentity = String(identity || (personalData as any)?.id || '')
              const targetIdentityStr = String(targetIdentity)
              const isCurrentUser = targetIdentityStr === currentIdentity
              
              const previousPermissions = participantPermissions[targetIdentityStr]
              
              // Check if permissions were granted (both true now, weren't both true before)
              const justGotFullPermission = isCurrentUser && 
                canPublishAudio && canPublishVideo && 
                (!previousPermissions?.canPublishAudio || !previousPermissions?.canPublishVideo)
              
              // Check if permissions were revoked
              // Simplified: if both are false and user is the target, it's a revocation
              // We handle it regardless of previous state to ensure devices are disabled
              const permissionsRevoked = isCurrentUser && 
                !canPublishAudio && 
                !canPublishVideo
              
              
              setParticipantPermissions(prev => {
                const updated = {
                  ...prev,
                  [targetIdentityStr]: {
                    canPublishAudio: canPublishAudio ?? prev[targetIdentityStr]?.canPublishAudio ?? false,
                    canPublishVideo: canPublishVideo ?? prev[targetIdentityStr]?.canPublishVideo ?? false
                  }
                }
                return updated
              })
              
              if (isCurrentUser) {
                if (permissionsRevoked) {
                  // Permissions were revoked
                  
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
                // Store participant reference
            setRemoteParticipants(prev => {
              const updated = new Map(prev)
              if (!updated.has(participant.identity)) {
                updated.set(participant.identity, { participant, tracks: [] })
              }
              const pData = updated.get(participant.identity)!
                  // Store track and publication for status checking
                  pData.tracks.push({ track, pub })
              return updated
            })
            
                // Use helper function to render remote video (handles muted state)
                renderRemoteVideo(track, pub, participant)
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
      
      const localParticipantName = room.localParticipant?.name || undefined
      setConnectedInfo({ room: room.name, is_member: canPub, topic: topic, identity, userName: localParticipantName })
      
    } catch (e: any) {
      console.error('Error reconnecting with new token:', e)
      setError(e?.message || 'Ошибка переподключения')
      alert('Ошибка при переподключении. Пожалуйста, обновите страницу.')
    }
  }

  // Effect to attach local video when camera is turned on
  useEffect(() => {
    if (roomRef.current && videoRef.current) {
      const timer = setTimeout(() => {
        if (!videoRef.current || !roomRef.current) return
        
        // Check if video element is still in DOM
        if (!document.body.contains(videoRef.current)) {
          console.warn('Video element not in DOM, skipping attach')
          return
        }
        
        const LKC = (window as any).LivekitClient || (window as any).LiveKit
        if (!LKC) return
        
        const { Track } = LKC
        const camPub = roomRef.current.localParticipant.getTrackPublication(Track.Source.Camera)
        
        // Attach video track if camera is on and track is available
        // Only attach if element is in DOM and not already attached
        if (cameraOn && camPub?.videoTrack && videoRef.current) {
          try {
            // Detach any existing track first to avoid conflicts
            const existingTrack = camPub.videoTrack
            if (existingTrack) {
              existingTrack.detach()
            }
            // Small delay to ensure detach is complete
            setTimeout(() => {
              if (videoRef.current && document.body.contains(videoRef.current) && camPub?.videoTrack) {
                camPub.videoTrack.attach(videoRef.current)
              }
            }, 50)
          } catch (e) {
            console.error('Error attaching video track:', e)
          }
        }
        
        // When user can publish, manage video placement
        if (canPublish && videoAreaRef.current && remoteContainerRef.current && remoteVideosContainerRef.current) {
          // Count active remote videos by checking if video elements exist in DOM
          // This is more accurate than checking tracks, since tracks might exist but be disabled
          // We only add video elements to DOM when tracks are actually subscribed and active
          let activeRemoteVideosCount = 0
          if (remoteVideosContainerRef.current) {
            remoteVideosContainerRef.current.querySelectorAll('[data-participant]').forEach((wrapper) => {
              const videoElement = wrapper.querySelector('video')
              // If video element exists in DOM, the video is active
              if (videoElement) {
                activeRemoteVideosCount++
              }
            })
          }
          const totalActiveVideos = activeRemoteVideosCount + (cameraOn ? 1 : 0)
          
          // Get existing local video wrapper in grid
          let existingLocalInGrid = remoteContainerRef.current.querySelector('#video-local') as HTMLElement | null
          
          // ✅ If camera is OFF — remove local tile ALWAYS (even if remote videos exist)
          if (!cameraOn) {
            if (existingLocalInGrid) {
              existingLocalInGrid.remove()
            }
            
            // Optional: keep the video element in main area but hidden (so attach is stable)
            if (videoRef.current && videoAreaRef.current && videoRef.current.parentNode !== videoAreaRef.current) {
              videoRef.current.remove()
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
            if (videoRef.current) {
              videoRef.current.style.display = 'none'
            }
            
            return // Exit early when camera is off
          }
          
          // ✅ Camera is ON — create local tile ONLY when there is at least 1 remote video
          if (!existingLocalInGrid && activeRemoteVideosCount > 0 && remoteContainerRef.current) {
            existingLocalInGrid = document.createElement('div')
            existingLocalInGrid.id = 'video-local'
            existingLocalInGrid.style.position = 'relative'
            existingLocalInGrid.style.width = '100%'
            existingLocalInGrid.style.height = '100%'
            existingLocalInGrid.style.aspectRatio = '16/9'
            existingLocalInGrid.style.cursor = 'grab'
            existingLocalInGrid.style.touchAction = 'none'
            existingLocalInGrid.style.zIndex = '100'
            existingLocalInGrid.style.borderRadius = '6px'
            existingLocalInGrid.style.overflow = 'hidden'
            existingLocalInGrid.style.background = '#f1f5f9'
            
            remoteContainerRef.current.appendChild(existingLocalInGrid)
            attachDragHandlers(existingLocalInGrid as HTMLDivElement, 'local')
          }
          
          // Handle camera on/off state
          // IMPORTANT: Only handle local video element (videoRef.current), not remote videos
          if (cameraOn && videoRef.current) {
            // Verify this is actually the local video element (should not have data-participant attribute)
            const isLocalVideo = !videoRef.current.hasAttribute('data-participant')
            if (isLocalVideo) {
            // If only local video is active, show it in main area
            if (totalActiveVideos === 1) {
              // Remove wrapper from grid entirely when only one video
              if (existingLocalInGrid && existingLocalInGrid.parentNode) {
                if (videoRef.current.parentNode === existingLocalInGrid) {
                  videoRef.current.remove()
                }
                existingLocalInGrid.remove()
              }
              
              // Move to main area
              if (videoRef.current.parentNode !== videoAreaRef.current) {
                videoRef.current.style.position = 'absolute'
                videoRef.current.style.width = '100%'
                videoRef.current.style.height = '100%'
                videoRef.current.style.objectFit = 'cover'
                videoRef.current.style.top = '0'
                videoRef.current.style.left = '0'
                videoRef.current.style.zIndex = '1'
                videoRef.current.style.transform = 'scaleX(-1)'
                videoRef.current.style.display = 'block'
                videoAreaRef.current.appendChild(videoRef.current)
              }
            } else {
              // Multiple videos - put local video in grid
              if (videoRef.current.parentNode === videoAreaRef.current) {
                videoRef.current.remove()
              }
              
              if (videoRef.current.parentNode !== existingLocalInGrid) {
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
              }
            }
          }
        } else if (!canPublish && videoAreaRef.current && videoRef.current) {
          // When user cannot publish, keep local video in main area
          const existingLocalInGrid = remoteContainerRef.current?.querySelector('#video-local')
          if (existingLocalInGrid) {
            const video = existingLocalInGrid.querySelector('video')
            if (video && video === videoRef.current) {
              video.remove()
            }
            existingLocalInGrid.remove()
          }
          
          // Attach track if camera is on
          if (cameraOn && camPub?.videoTrack && videoRef.current && document.body.contains(videoRef.current)) {
            try {
              // Detach any existing track first
              camPub.videoTrack.detach()
              setTimeout(() => {
                if (videoRef.current && document.body.contains(videoRef.current) && camPub?.videoTrack) {
                  camPub.videoTrack.attach(videoRef.current)
                }
              }, 50)
            } catch (e) {
              console.error('Error attaching video track:', e)
            }
          }
          
          // Ensure video is in main area
          if (videoRef.current && videoRef.current.parentNode !== videoAreaRef.current) {
            videoRef.current.style.position = 'absolute'
            videoRef.current.style.width = '100%'
            videoRef.current.style.height = '100%'
            videoRef.current.style.objectFit = 'cover'
            videoRef.current.style.top = '0'
            videoRef.current.style.left = '0'
            videoRef.current.style.zIndex = '1'
            videoRef.current.style.transform = 'scaleX(-1)'
            videoRef.current.style.display = cameraOn ? 'block' : 'none'
            videoAreaRef.current.appendChild(videoRef.current)
          }
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [cameraOn, canPublish, remoteParticipants])

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
      
      // Ensure video element exists in DOM before enabling camera
      if (!videoRef.current || !document.body.contains(videoRef.current)) {
        // Video element not in DOM, wait for it to be created
        if (videoAreaRef.current) {
          // Find the local video element (should not have data-participant attribute)
          // Query all videos and find the one without data-participant (local video)
          const allVideos = videoAreaRef.current.querySelectorAll('video')
          let existingVideo: HTMLVideoElement | null = null
          
          for (const video of Array.from(allVideos)) {
            // Local video should not have data-participant attribute
            if (!video.hasAttribute('data-participant')) {
              existingVideo = video as HTMLVideoElement
              break
            }
          }
          
          if (existingVideo) {
            // Use existing local video element
            // IMPORTANT: Ensure it doesn't have data-participant (should never have it)
            if (existingVideo.hasAttribute('data-participant')) {
              existingVideo.removeAttribute('data-participant')
            }
            videoRef.current = existingVideo
          } else {
            // Create new video element
            const newVideo = document.createElement('video')
            newVideo.autoplay = true
            newVideo.muted = true
            newVideo.playsInline = true
            newVideo.className = s.video
            newVideo.style.display = 'none'
            // IMPORTANT: Do NOT set data-participant on local video
            videoAreaRef.current.appendChild(newVideo)
            videoRef.current = newVideo
          }
          
          // Final safeguard: Ensure videoRef.current never has data-participant
          if (videoRef.current && videoRef.current.hasAttribute('data-participant')) {
            console.warn('Local video element had data-participant attribute, removing it')
            videoRef.current.removeAttribute('data-participant')
          }
        } else {
          console.error('videoAreaRef not available')
          return
        }
      }
      
      const newState = !cameraOn
      
      if (newState) {
        try {
          // Ensure video element is in DOM before attaching
          if (!videoRef.current || !document.body.contains(videoRef.current)) {
            console.error('Video element not in DOM, cannot enable camera')
            return
          }
          await room.localParticipant.setCameraEnabled(true, selectedCam ? { deviceId: selectedCam } : undefined)
        } catch (e) {
          console.warn('Failed with specific device, trying default', e)
          if (videoRef.current && document.body.contains(videoRef.current)) {
            await room.localParticipant.setCameraEnabled(true)
          }
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

  async function requestCameraFromParticipant(targetIdentity: string) {
    if (!roomRef.current) return
    
    try {
      const message = {
        type: 'camera_request',
        targetIdentity: targetIdentity,
        fromIdentity: connectedInfo?.identity || String((personalData as any)?.id || ''),
        fromName: connectedInfo?.name || connectedInfo?.userName || 'Участник',
        timestamp: Date.now(),
        requestId: `camera_req_${Date.now()}_${targetIdentity}`
      }
      
      // Check if room is connected before sending data
      if (roomRef.current.state !== 'connected') {
        console.warn('Cannot send camera request, room not ready')
        return
      }
      
      const encoder = new TextEncoder()
      const data = encoder.encode(JSON.stringify(message))
      
      try {
        await roomRef.current.localParticipant.publishData(data, {
          reliable: true,
          destinationIdentities: [targetIdentity] // Send only to target participant
        })
      } catch (e) {
        console.warn('Failed to send camera request:', e)
      }
    } catch (e) {
      console.error('Error sending camera request:', e)
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
        targetIdentity: String(targetIdentity), // Ensure it's a string for comparison
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
    const userName = roomRef.current?.localParticipant?.name || connectedInfo?.userName || (personalData as any)?.name || identity
    const messageText = chatInput.trim()
    
    const message = {
      type: 'chat',
      id: Date.now().toString(),
      identity,
      name: userName,
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
        timestamp: message.timestamp,
        msgName: userName
      }])
      setChatInput('')
    } catch (e) {
      console.error('Error sending message:', e)
      // Still add to local state even if send fails
      setChatMessages(prev => [...prev, {
        id: message.id,
        identity,
        message: messageText,
        timestamp: message.timestamp,
        msgName: userName
      }])
      setChatInput('')
    }
  }

  async function handleCameraRequestResponse(accept: boolean) {
    if (accept && cameraRequestNotification.fromIdentity && conferenceId) {
      // Grant permissions to the requester
      await toggleParticipantConnection(cameraRequestNotification.fromIdentity, true)
    }
    setCameraRequestNotification({ show: false })
  }

  return (
    <div className={s.meetingCard}>
      {cameraRequestNotification.show && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#fff',
          border: '2px solid #3b82f6',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 10000,
          minWidth: '300px',
          maxWidth: '400px'
        }}>
          <div style={{ marginBottom: '12px', fontWeight: 600, fontSize: 14, color: '#1e293b' }}>
            Запрос на разрешение камеры и микрофона
          </div>
          <div style={{ marginBottom: '16px', fontSize: 13, color: '#64748b' }}>
            {cameraRequestNotification.from} просит разрешение на использование камеры и микрофона
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => handleCameraRequestResponse(false)}
              style={{
                padding: '8px 16px',
                fontSize: 13,
                backgroundColor: '#f1f5f9',
                color: '#64748b',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              Отклонить
            </button>
            <button
              onClick={() => handleCameraRequestResponse(true)}
              style={{
                padding: '8px 16px',
                fontSize: 13,
                backgroundColor: '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              Разрешить
            </button>
          </div>
        </div>
      )}
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
        <div className={s.infoRow} style={{ fontSize: 12, color: '#64748b', justifyContent: 'flex-start', gap: 8, marginBottom: 12 }}>
          <span>Пригласить по ссылке:</span>
          <span className={s.linkAction} onClick={() => navigator.clipboard.writeText(window.location.href)}>скопировать</span>
        </div>
        {!isStreamOwner && creatorUserId !== null && !hasDevicePermissions && (() => {
          // Stream owner's identity should be the creatorUserId as string
          // The stream owner might be in participants list or might be the local participant
          // Try to find in participants first, otherwise use creatorUserId directly
          const streamOwnerParticipant = participants.find(p => Number(p.identity) === creatorUserId)
          const streamOwnerIdentity = streamOwnerParticipant?.identity || String(creatorUserId)
          
          console.log('Camera request button - creatorUserId:', creatorUserId, 'streamOwnerIdentity:', streamOwnerIdentity, 'connectedInfo.identity:', connectedInfo?.identity, 'participants:', participants.map(p => ({ identity: p.identity, name: p.name })))
          
          return (
            <button
              onClick={() => {
                console.log('Sending camera request to:', streamOwnerIdentity, 'from:', connectedInfo?.identity || (personalData as any)?.id)
                requestCameraFromParticipant(streamOwnerIdentity)
              }}
              style={{
                padding: '8px 12px',
                fontSize: 13,
                backgroundColor: '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 500,
                width: '100%',
                marginTop: '8px'
              }}
            >
              Запросить камеру у владельца
            </button>
          )
        })()}
      </div>

      <div className={s.layout}>
        <div className={s.leftPanel}>
          <div className={s.videoArea} ref={videoAreaRef}>
            <div ref={remoteVideosContainerRef} className={s.remoteVideosGrid}></div>
            <div ref={remoteContainerRef} className={s.remoteGrid}></div>
            <video 
              ref={videoRef} 
              autoPlay 
              muted 
              playsInline 
              className={s.video}
              style={{ display: cameraOn ? 'block' : 'none' }}
            />
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
                              {isOwnMessage ? 'Вы' : (msg.msgName || msg.identity)}
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
                        <span style={{ fontSize: 12, color: '#64748b' }}>
                          {creatorUserId !== null && Number(p.identity) === creatorUserId ? 'Владелец стрима' : 'Участник'}
                        </span>
                      </div>
                      {isStreamOwner && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', marginTop: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
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

