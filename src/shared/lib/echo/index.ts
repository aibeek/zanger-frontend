import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import { API_URL, PUSHER_KEY, PUSHER_HOST, PUSHER_PORT } from '@/shared/config/env'

// Extend Window interface for Pusher
declare global {
  interface Window {
    Pusher: typeof Pusher
    Echo: Echo<'pusher'>
  }
}

let echoInstance: Echo<'pusher'> | null = null

/**
 * Get or create Laravel Echo instance for WebSocket connections.
 * Uses Soketi as the WebSocket server (Pusher-compatible).
 */
export function getEcho(): Echo<'pusher'> | null {
  // Only run on client side
  if (typeof window === 'undefined') {
    return null
  }

  if (echoInstance) {
    return echoInstance
  }

  const pusherKey = PUSHER_KEY
  const pusherHost = PUSHER_HOST
  const pusherPort = PUSHER_PORT
  const apiUrl = API_URL

  // Check if WebSocket is configured
  if (!pusherKey || !pusherHost) {
    console.warn('[Echo] WebSocket not configured. Falling back to polling.')
    return null
  }

  try {
    // Make Pusher available globally (required by Laravel Echo)
    window.Pusher = Pusher

    echoInstance = new Echo({
      broadcaster: 'pusher',
      key: pusherKey,
      wsHost: pusherHost,
      wsPort: parseInt(pusherPort, 10),
      wssPort: parseInt(pusherPort, 10),
      forceTLS: false,
      encrypted: false,
      disableStats: true,
      enabledTransports: ['ws', 'wss'],
      authEndpoint: `${apiUrl}/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      },
    })

    window.Echo = echoInstance
    console.log('[Echo] WebSocket connected successfully')

    return echoInstance
  } catch (error) {
    console.error('[Echo] Failed to initialize WebSocket:', error)
    return null
  }
}

/**
 * Get auth token from cookies or localStorage
 */
function getAuthToken(): string {
  if (typeof window === 'undefined') return ''
  
  // Try to get from cookie first (same as httpClient)
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'token') {
      return value
    }
  }
  
  // Fallback to localStorage
  return localStorage.getItem('token') || ''
}

/**
 * Update Echo auth token (call after login/refresh)
 */
export function updateEchoAuth(): void {
  if (echoInstance) {
    echoInstance.connector.options.auth = {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    }
  }
}

/**
 * Disconnect Echo WebSocket
 */
export function disconnectEcho(): void {
  if (echoInstance) {
    echoInstance.disconnect()
    echoInstance = null
  }
}

/**
 * Check if WebSocket is available and connected
 */
export function isEchoConnected(): boolean {
  return echoInstance !== null && echoInstance.connector.pusher?.connection?.state === 'connected'
}
