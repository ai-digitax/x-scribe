import { config } from '../config'

// X-API
export class Xapi {
  static async MediaSplit<T>(file: File, size: number): Promise<T> {
    const url = `${config.xapi.base_url}/media/split-by-size`
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('size', size.toString())

    const response = await fetch(url, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    console.log('X-API応答 :',result)
    return result.data
  }
}
