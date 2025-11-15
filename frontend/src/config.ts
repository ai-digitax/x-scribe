const env = import.meta.env

export const config = {
  toastDuration: 5000,
  fileUnitSize: 100 * 1024 * 1024,
  maxChunkSize: 20 * 1024 * 1024,
  mba: {
    base_url: env.VITE_MBA_BASE_URL,
    jwt: env.VITE_MBA_JWT,
  }
}
