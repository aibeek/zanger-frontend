declare module 'ncalayer-js-client' {
  export class NCALayerClient {
    static fileStorageType: string
    constructor(url?: string, allowKmdHttpApi?: boolean)
    connect(): Promise<string>
    getActiveTokens(): Promise<string[]>
    createCAdESFromBase64(storageType: string, dataBase64: string, keyType?: 'SIGNATURE' | 'AUTHENTICATION', attach?: boolean): Promise<string>
  }
}