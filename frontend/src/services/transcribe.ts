import { Xapi } from './xapi'
import type { ResXapiMediaSplit } from '../types'

export interface ReqTranscribe {
  model?: string
  language?: string
  prompt?: string
  onProgress?: ProgressCallback
}

export interface ResTranscribe {
  text: string
  duration: number
  fileSize: number
}

export interface TranscribeProgress {
  current_chunk: number
  total_chunks: number
  chunk_transcript: string
  message: string
}

export type ProgressCallback = (progress: TranscribeProgress) => void

export class TranscribeService {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async transcribe(audioFile: File, options: ReqTranscribe = {}): Promise<ResTranscribe> {
    const startTime = Date.now()
    const { model = 'whisper-1', language = 'ja', prompt, onProgress } = options

    onProgress?.({
      current_chunk: 0,
      total_chunks: 0,
      chunk_transcript: '',
      message: 'アップロード中です...'
    })

    console.log('音声ファイルのサイズ:', (audioFile.size / (1024 * 1024)).toFixed(2), 'MB')
    const urls = await this.prepareChunks(audioFile)
    console.log('ファイルを分割しました:', urls)
    const transcripts = await this.processChunks(urls, { model, language, prompt, onProgress })
    const finalText = transcripts.join(' ')

    return {
      text: finalText,
      duration: Date.now() - startTime,
      fileSize: audioFile.size
    }
  }

  private async prepareChunks(audioFile: File): Promise<string[]> {
    const fileSize = 25
    const response = await Xapi.MediaSplit<ResXapiMediaSplit>(audioFile, fileSize)
    return response.media_urls
  }

  private async processChunks(
    urls: string[],
    options: { model: string; language: string; prompt?: string; onProgress?: ProgressCallback }
  ): Promise<string[]> {
    const { model, language, prompt, onProgress } = options
    const transcripts: string[] = []

    onProgress?.({
      current_chunk: 0,
      total_chunks: urls.length,
      chunk_transcript: '',
      message: '文字起こし処理を開始します...'
    })

    for (let i = 0; i < urls.length; i++) {
      onProgress?.({
        current_chunk: i + 1,
        total_chunks: urls.length,
        chunk_transcript: transcripts[transcripts.length - 1] || '',
        message: '文字起こし処理中です...'
      })

      try {
        // URLからファイルを取得
        const response = await fetch(urls[i])
        const blob = await response.blob()
        const audioFile = new File([blob], `chunk_${i}.mp3`, { type: 'audio/mp3' })
        
        // チャンクのサイズをログに出力
        console.log(`チャンク ${i + 1}/${urls.length} のサイズ: ${(audioFile.size / (1024 * 1024)).toFixed(2)}MB`)

        const result = await this.transcribeChunk(audioFile, { model, language, prompt })
        console.log('チャンクの文字起こし結果:', result)
        transcripts.push(result)

        onProgress?.({
          current_chunk: i + 1,
          total_chunks: urls.length,
          chunk_transcript: result,
          message: '文字起こし処理中です...'
        })
      } catch (error) {
        console.error('チャンクの文字起こし中にエラーが発生しました:', error)
        transcripts.push('')
        onProgress?.({
          current_chunk: i + 1,
          total_chunks: urls.length,
          chunk_transcript: '',
          message: `ファイル ${i + 1} でエラーが発生しました`
        })
      }
    }

    return transcripts
  }

  private async transcribeChunk(
    audioFile: File,
    options: { model: string; language: string; prompt?: string }
  ): Promise<string> {
    const formData = new FormData()
    formData.append('file', audioFile)
    formData.append('model', options.model)
    formData.append('response_format', 'json')

    if (options.language) formData.append('language', options.language)
    if (options.prompt) formData.append('prompt', options.prompt)

    // 送信するデータのサイズをログに出力
    console.log(`送信するデータのサイズ: ${(audioFile.size / (1024 * 1024)).toFixed(2)}MB`)
    console.log(`送信するファイル名: ${audioFile.name}, タイプ: ${audioFile.type}`)

    const response = await fetch('/api/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.apiKey}` },
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`${response.status} ${errorData}`)
    }

    const result = await response.json()
    return result.text || ''
  }
}

export const createTranscribeService = (apiKey: string) => {
  return new TranscribeService(apiKey)
}
