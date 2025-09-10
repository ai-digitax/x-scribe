import { AudioSplitter } from './audio-utils'

export interface ReqTranscribe {
  model?: string
  language?: string
  prompt?: string
  onProgress?: ProgressCallback
}

export interface ResTranscribe {
  text: string
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
    const { model = 'whisper-1', language = 'ja', prompt, onProgress } = options

    console.log('[TranscribeService] 開始:', {
      fileName: audioFile.name,
      fileSize: audioFile.size,
      model,
      language
    })

    onProgress?.({
      current_chunk: 0,
      total_chunks: 0,
      chunk_transcript: '',
      message: 'アップロード中です...'
    })

    const audioContext = new AudioContext()
    const arrayBuffer = await audioFile.arrayBuffer()
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
    const duration = audioBuffer.duration

    console.log('[TranscribeService] オーディオ情報:', {
      duration: `${duration.toFixed(2)}秒`,
      sampleRate: audioBuffer.sampleRate,
      channels: audioBuffer.numberOfChannels
    })

    const chunkDuration = AudioSplitter.calcUnitDuration(audioFile.size, duration)
    const chunks = await AudioSplitter.splitAudioFile(audioFile, chunkDuration)
    const transcripts: string[] = []

    console.log('[TranscribeService] チャンク分割完了:', {
      totalChunks: chunks.length,
      chunkDuration: `${chunkDuration}秒`
    })

    for (let i = 0; i < chunks.length; i++) {
      console.log(`[TranscribeService] チャンク ${i + 1}/${chunks.length} 処理開始`)

      const progressBefore = {
        current_chunk: i + 1,
        total_chunks: chunks.length,
        chunk_transcript: transcripts.length > 0 ? transcripts[transcripts.length - 1] : '',
        message: '文字起こし処理中です...'
      }

      console.log('[TranscribeService] 進捗更新 (処理前):', progressBefore)
      onProgress?.(progressBefore)

      const result = await this.transcribeChunk(chunks[i], { model, language, prompt })
      transcripts.push(result.text)

      console.log(`[TranscribeService] チャンク ${i + 1} 完了:`, {
        text: result.text,
        textLength: result.text.length,
        preview: result.text.substring(0, 50) + (result.text.length > 50 ? '...' : '')
      })

      // 処理完了後に最新のチャンクの内容を表示
      const progressAfter = {
        current_chunk: i + 1,
        total_chunks: chunks.length,
        chunk_transcript: result.text,
        message: '文字起こし処理中です...'
      }

      console.log('[TranscribeService] 進捗更新 (処理後):', progressAfter)
      onProgress?.(progressAfter)
    }

    const finalText = transcripts.join(' ')
    console.log('[TranscribeService] 全処理完了:', {
      totalChunks: chunks.length,
      finalTextLength: finalText.length,
      preview: finalText.substring(0, 100) + (finalText.length > 100 ? '...' : '')
    })

    return { text: finalText }
  }

  private async transcribeChunk(
    audioFile: File,
    options: { model: string; language: string; prompt?: string }
  ): Promise<ResTranscribe> {
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
    return { text: result.text || '' }
  }
}

export const createTranscribeService = (apiKey: string) => {
  return new TranscribeService(apiKey)
}
