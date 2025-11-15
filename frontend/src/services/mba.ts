import { config } from '../config'
import type { MbaTypes } from '../types/index'

// Media Base API
export class Mba {
  
  static async MediaUpload(file: File, expireHours: number = 1): Promise<MbaTypes.MediaBaseResponse> {
    const url = `${config.mba.base_url}/media/`
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('expire_hours', expireHours.toString())
    formData.append('is_public', 'true')
    formData.append('should_compress', 'false')
    
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.mba.jwt}`
      },
      body: formData
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result = await response.json()
    console.log('MBA API応答:', result)
    return result
  }
  
  static async MediaTranscribe(mediaId: number, overwrite: boolean = false): Promise<MbaTypes.TranscribeResponse> {
    const url = `${config.mba.base_url}/media/${mediaId}/transcribe`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.mba.jwt}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        overwrite: overwrite
      })
    })
  
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
  
    const result = await response.json()
    console.log('MBA Transcribe API応答:', result)
    return result
  }
}
