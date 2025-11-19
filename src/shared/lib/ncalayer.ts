// NCALayer client wrapper based on official ncalayer-js-client
import { NCALayerClient } from 'ncalayer-js-client'

export async function signChallengeBase64(challengeBase64: string): Promise<string> {
  const client = new NCALayerClient('wss://127.0.0.1:13579/')

  // Проверяем доступность NCALayer
  try {
    await client.connect()
  } catch (e: any) {
    throw new Error(e?.message || 'NCALayer is not responding')
  }

  // Получаем доступные токены/носители
  let storageType = 'PKCS12'
  try {
    const tokens = await client.getActiveTokens()
    storageType = tokens?.[0] || (NCALayerClient as any).fileStorageType || 'PKCS12'
  } catch {
    // Fallback на файловое хранилище
    storageType = (NCALayerClient as any).fileStorageType || 'PKCS12'
  }

  // Создаём CMS подпись из Base64
  return await client.createCAdESFromBase64(storageType, challengeBase64)
}

export async function isNcaLayerAvailable(): Promise<boolean> {
  try {
    const client = new NCALayerClient('wss://127.0.0.1:13579/')
    await client.connect()
    return true
  } catch {
    return false
  }
}