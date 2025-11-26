import { authService } from '@/features/auth'

const te = new TextEncoder()
const td = new TextDecoder()

const b64u = {
  enc: (ab: ArrayBuffer | Uint8Array) => {
    const bytes = ab instanceof Uint8Array ? ab : new Uint8Array(ab)
    let s = ''
    for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i])
    return btoa(s).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')
  },
  dec: (s: string) => {
    const pad = s.length % 4 === 0 ? s : s + '='.repeat(4 - (s.length % 4))
    const b = atob(pad.replaceAll('-', '+').replaceAll('_', '/'))
    const arr = new Uint8Array(b.length)
    for (let i = 0; i < b.length; i++) arr[i] = b.charCodeAt(i)
    return arr.buffer
  },
}

async function hkdf(token: string, salt: string, info: string, length = 32): Promise<ArrayBuffer> {
  const keyMaterial = await crypto.subtle.importKey('raw', te.encode(token), 'HKDF', false, ['deriveBits'])
  return await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt: te.encode(salt), info: te.encode(info) },
    keyMaterial,
    length * 8,
  )
}

async function aesGcmEncrypt(plaintext: any, keyBytes: any): Promise<{ iv: Uint8Array; ctTag: Uint8Array }> {
  const subtle: any = (globalThis as any).crypto?.subtle
  const iv = (globalThis as any).crypto.getRandomValues(new Uint8Array(12))
  const cryptoKey = await subtle.importKey('raw', keyBytes, { name: 'AES-GCM' }, false, ['encrypt'])
  const ct = await subtle.encrypt({ name: 'AES-GCM', iv }, cryptoKey, plaintext)
  return { iv, ctTag: new Uint8Array(ct) }
}

async function aesGcmDecrypt(iv: any, ctTag: any, keyBytes: any): Promise<Uint8Array> {
  const subtle: any = (globalThis as any).crypto?.subtle
  const cryptoKey = await subtle.importKey('raw', keyBytes, { name: 'AES-GCM' }, false, ['decrypt'])
  const buf = new ArrayBuffer(ctTag.byteLength)
  new Uint8Array(buf).set(ctTag)
  const pt = await subtle.decrypt({ name: 'AES-GCM', iv }, cryptoKey, buf)
  return new Uint8Array(pt)
}

export async function encryptJsonBody(payload: any, token: string) {
  const key = await hkdf(token, 'esdca-traffic-salt-v1', 'esdca-traffic-key', 32)
  const { iv, ctTag } = await aesGcmEncrypt(te.encode(JSON.stringify(payload)).buffer, key)
  const tag = ctTag.slice(ctTag.length - 16)
  const ct = ctTag.slice(0, ctTag.length - 16)
  return { v: 1, iv: b64u.enc(iv), tag: b64u.enc(tag), ciphertext: b64u.enc(ct) }
}

export async function decryptJsonBody(envelope: any, token: string) {
  const key = await hkdf(token, 'esdca-traffic-salt-v1', 'esdca-traffic-key', 32)
  const iv = new Uint8Array(b64u.dec(String(envelope.iv)))
  const tag = new Uint8Array(b64u.dec(String(envelope.tag)))
  const ct = new Uint8Array(b64u.dec(String(envelope.ciphertext)))
  const ctTag = new Uint8Array(ct.length + tag.length)
  ctTag.set(ct, 0)
  ctTag.set(tag, ct.length)
  const pt = await aesGcmDecrypt(iv, ctTag, key)
  return JSON.parse(td.decode(pt))
}

export async function encryptId(id: number | string, token: string): Promise<string> {
  const key = await hkdf(token, 'esdca-traffic-salt-v1', 'esdca-traffic-key', 32)
  const { iv, ctTag } = await aesGcmEncrypt(te.encode(String(id)).buffer, key)
  const tag = ctTag.slice(ctTag.length - 16)
  const ct = ctTag.slice(0, ctTag.length - 16)
  const env = { v: 1, iv: b64u.enc(iv), tag: b64u.enc(tag), ciphertext: b64u.enc(ct) }
  const json = te.encode(JSON.stringify(env))
  return b64u.enc(json)
}

export async function esdcaHttp<T = any>(url: string, options: RequestInit & { encryptBody?: boolean } = {}): Promise<T> {
  const token = authService.ensureToken()
  const method = (options.method || 'GET').toString().toUpperCase()
  const isFormData = options.body instanceof FormData

  let body: BodyInit | undefined = options.body
  if (options.encryptBody && method !== 'GET') {
    if (isFormData) {
      const fd = options.body as FormData
      const file = fd.get('file') as File | null
      if (file && typeof file.arrayBuffer === 'function') {
        const key = await hkdf(token, 'esdca-traffic-salt-v1', 'esdca-traffic-key', 32)
      const bytes = await file.arrayBuffer()
      const { iv, ctTag } = await aesGcmEncrypt(bytes, key)
        const tag = ctTag.slice(ctTag.length - 16)
        const ct = ctTag.slice(0, ctTag.length - 16)
        const encBlob = new Blob([ct], { type: 'application/octet-stream' })
        const newFd = new FormData()
        fd.forEach((v, k) => { if (k !== 'file') newFd.append(k, v as any) })
        newFd.append('file', encBlob, file.name)
        newFd.append('esdca_iv', b64u.enc(iv))
        newFd.append('esdca_tag', b64u.enc(tag))
        body = newFd
      }
    } else if (options.body) {
      const env = await encryptJsonBody(JSON.parse(String(options.body)), token)
      body = JSON.stringify(env)
    }
  }

  const res = await fetch(url, {
    ...options,
    body,
    headers: {
      Accept: 'application/json',
      'Accept-Language': typeof navigator !== 'undefined' ? navigator.language : 'ru',
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
      ...(isFormData || method === 'GET' ? {} : { 'Content-Type': 'application/json' }),
      'X-ESDCA-Encrypted': '1',
    },
  })

  if (!res.ok) {
    const txt = await res.text()
    throw new Error(txt || `HTTP ${res.status}`)
  }

  const ct = res.headers.get('content-type') || ''
  if (!ct.includes('application/json')) {
    const text = await res.text()
    return text as unknown as T
  }
  const payload = await res.json()
  if (payload && typeof payload === 'object' && payload.ciphertext && payload.iv && payload.tag) {
    return (await decryptJsonBody(payload, token)) as T
  }
  return payload as T
}