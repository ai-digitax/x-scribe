import { Mba } from './mba'

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
  async transcribe(audioFile: File, onProgress?: ProgressCallback): Promise<ResTranscribe> {
    const startTime = Date.now()

    onProgress?.({
      current_chunk: 0,
      total_chunks: 0,
      chunk_transcript: '',
      message: 'アップロード中です...'
    })

    console.log('音声ファイルのサイズ:', (audioFile.size / (1024 * 1024)).toFixed(2), 'MB')
    
    const uploadResponse = await Mba.MediaUpload(audioFile)
    if (!uploadResponse.success || !uploadResponse.data) {
      throw new Error('ファイルのアップロードに失敗しました: ' + JSON.stringify(uploadResponse.errors))
    }

    console.log('ファイルをアップロードしました:', uploadResponse)
    
    
    onProgress?.({
      current_chunk: 0,
      total_chunks: 0,
      chunk_transcript: '',
      message: '文字起こし処理中です...'
    })
    
    const transcribeResponse = await Mba.MediaTranscribe(uploadResponse.data.id)
    
    if (!transcribeResponse.success || !transcribeResponse.data) {
      throw new Error('文字起こし処理に失敗しました: ' + JSON.stringify(transcribeResponse.errors))
    }
    
    console.log('文字起こし完了:', transcribeResponse)
    
    onProgress?.({
      current_chunk: 2,
      total_chunks: 2,
      chunk_transcript: transcribeResponse.data.transcription || '',
      message: '文字起こしが完了しました'
    })
    
    const text = transcribeResponse.data.transcription || ''
    
    return {
      text: text,
      duration: Date.now() - startTime,
      fileSize: audioFile.size
    }
  }
}

export const createTranscribeService = () => {
  return new TranscribeService()
}
