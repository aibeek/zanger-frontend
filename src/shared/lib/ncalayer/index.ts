import { NCALayerClient } from 'ncalayer-js-client'

const endpoints = [
  process.env.NEXT_PUBLIC_NCALAYER_URL,
  'wss://127.0.0.1:13579/',
  'wss://localhost:13579/',
  'ws://127.0.0.1:13579/',
  'ws://localhost:13579/',
].filter(Boolean) as string[]

const withTimeout = <T>(p: Promise<T>, ms: number) =>
  new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('NCALAYER_TIMEOUT')), ms)
    p.then((v) => {
      clearTimeout(t)
      resolve(v)
    }).catch((e) => {
      clearTimeout(t)
      reject(e)
    })
  })

async function connectNca(): Promise<NCALayerClient> {
  for (const url of endpoints) {
    const client = new NCALayerClient(url)
    try {
      await withTimeout(client.connect(), 5000)
      return client
    } catch (e) {
      console.warn('NCALayer connect failed', { url, error: (e as any)?.message })
    }
  }
  throw new Error('NCALayer is not responding')
}

export async function signChallengeBase64(challengeBase64: string): Promise<string> {
  const client = await connectNca()
  let storageType = 'PKCS12'
  try {
    const tokens = await client.getActiveTokens()
    storageType = tokens?.[0] || (NCALayerClient as any).fileStorageType || 'PKCS12'
  } catch {
    storageType = (NCALayerClient as any).fileStorageType || 'PKCS12'
  }
  return await client.createCAdESFromBase64(storageType, challengeBase64)
}

export async function signXmlFromBase64(xmlDataBase64: string): Promise<string> {
  const client = await connectNca()
  let storageType = 'PKCS12'
  try {
    const tokens = await client.getActiveTokens()
    storageType = tokens?.[0] || (NCALayerClient as any).fileStorageType || 'PKCS12'
  } catch {
    storageType = (NCALayerClient as any).fileStorageType || 'PKCS12'
  }
  // Метод должен присутствовать в библиотеке клиента
  return await (client as any).createXMLSignatureFromBase64(storageType, xmlDataBase64)
}

export async function isNcaLayerAvailable(): Promise<boolean> {
  try {
    await connectNca()
    return true
  } catch {
    return false
  }
}

export const ncalayerUtils = {
  isNCALayerAvailable: isNcaLayerAvailable,
  signData: signChallengeBase64,
  signXml: signXmlFromBase64,
}

export { NCALayerClient }