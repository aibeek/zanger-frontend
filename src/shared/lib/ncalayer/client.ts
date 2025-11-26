export class NCALayerClient {
  static fileStorageType = 'PKCS12'
  private url: string
  constructor(url?: string) {
    this.url = url || 'wss://127.0.0.1:13579/'
  }
  async connect(): Promise<string> {
    throw new Error('NCALayer client library is not installed')
  }
  async getActiveTokens(): Promise<string[]> {
    return [NCALayerClient.fileStorageType]
  }
  async createCAdESFromBase64(storageType: string, dataBase64: string): Promise<string> {
    throw new Error('NCALayer client is unavailable')
  }
  async createXMLSignatureFromBase64(storageType: string, xmlBase64: string): Promise<string> {
    throw new Error('NCALayer client is unavailable')
  }
}