import { AudioSplitter } from './audio-utils'

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

    const chunks = await this.prepareChunks(audioFile)
    const transcripts = await this.processChunks(chunks, { model, language, prompt, onProgress })
    const finalText = transcripts.join(' ')

    return {
      text: finalText,
      duration: Date.now() - startTime,
      fileSize: audioFile.size
    }
  }

  private async prepareChunks(audioFile: File): Promise<File[]> {
    const audioContext = new AudioContext()
    const arrayBuffer = await audioFile.arrayBuffer()
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
    const duration = audioBuffer.duration

    const chunkDuration = Math.min(
      AudioSplitter.calcUnitDuration(audioFile.size, duration),
      300
    )

    const chunks = await AudioSplitter.splitAudioFile(audioFile, chunkDuration)
    audioContext.close()
    return chunks
  }

  private async processChunks(
    chunks: File[],
    options: { model: string; language: string; prompt?: string; onProgress?: ProgressCallback }
  ): Promise<string[]> {
    const { model, language, prompt, onProgress } = options
    const transcripts: string[] = []

    onProgress?.({
      current_chunk: 0,
      total_chunks: chunks.length,
      chunk_transcript: '',
      message: '文字起こし処理を開始します...'
    })

    for (let i = 0; i < chunks.length; i++) {
      onProgress?.({
        current_chunk: i + 1,
        total_chunks: chunks.length,
        chunk_transcript: transcripts[transcripts.length - 1] || '',
        message: '文字起こし処理中です...'
      })

      try {
        const result = await this.transcribeChunk(chunks[i], { model, language, prompt })
        transcripts.push(result)

        onProgress?.({
          current_chunk: i + 1,
          total_chunks: chunks.length,
          chunk_transcript: result,
          message: '文字起こし処理中です...'
        })
      } catch (error) {
        transcripts.push('')
        onProgress?.({
          current_chunk: i + 1,
          total_chunks: chunks.length,
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
