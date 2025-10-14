const env = import.meta.env

export const config = {
  openaiApiKey: env.VITE_OPENAI_API_KEY || '',
  toastDuration: 5000,
  fileUnitSize: 100 * 1024 * 1024,
  maxChunkSize: 20 * 1024 * 1024,
  xapi: {
    base_url: env.VITE_XAPI_BASE_URL,
  }
}
