export class AudioSplitter {
  static calcUnitDuration(fileSize: number, totalDuration: number): number {
    const maxChunkSize = 20 * 1024 * 1024
    const requiredChunks = Math.ceil(fileSize / maxChunkSize)
    return totalDuration / requiredChunks
  }

  static async splitLargeFile(audioFile: File, maxFileSize: number): Promise<File[]> {
    if (audioFile.size <= maxFileSize) {
      return [audioFile]
    }

    const fileChunks: File[] = []
    const totalSize = audioFile.size
    let offset = 0
    let chunkIndex = 0

    while (offset < totalSize) {
      const chunkSize = Math.min(maxFileSize, totalSize - offset)
      const chunkBlob = audioFile.slice(offset, offset + chunkSize)
      const chunkFile = new File([chunkBlob], `${audioFile.name}_part${chunkIndex}.${audioFile.name.split('.').pop()}`, {
        type: audioFile.type
      })

      fileChunks.push(chunkFile)
      offset += chunkSize
      chunkIndex++
    }

    return fileChunks
  }

  static async splitAudioFile(audioFile: File, chunkDurationSeconds: number): Promise<File[]> {
    const audioContext = new AudioContext()
    const arrayBuffer = await audioFile.arrayBuffer()
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

    const duration = audioBuffer.duration
    const numChunks = Math.ceil(duration / chunkDurationSeconds)
    const chunks: File[] = []
    
    console.log(`元のファイル: ${(audioFile.size / (1024 * 1024)).toFixed(2)}MB, 長さ: ${duration.toFixed(2)}秒`)
    console.log(`チャンク数: ${numChunks}, チャンク時間: ${chunkDurationSeconds.toFixed(2)}秒`)

    for (let i = 0; i < numChunks; i++) {
      const startTime = i * chunkDurationSeconds
      const endTime = Math.min((i + 1) * chunkDurationSeconds, duration)

      const chunkBuffer = this.extractChunk(audioBuffer, startTime, endTime)
      const chunkBlob = this.audioBufferToWav(chunkBuffer)
      const chunkFile = new File([chunkBlob], `chunk_${i}.wav`, { type: 'audio/wav' })
      
      console.log(`チャンク ${i+1}/${numChunks}: ${(chunkFile.size / (1024 * 1024)).toFixed(2)}MB, 時間: ${(endTime - startTime).toFixed(2)}秒`)
      chunks.push(chunkFile)
    }

    return chunks
  }

  private static extractChunk(audioBuffer: AudioBuffer, startTime: number, endTime: number): AudioBuffer {
    const audioContext = new AudioContext()
    const startSample = Math.floor(startTime * audioBuffer.sampleRate)
    const endSample = Math.floor(endTime * audioBuffer.sampleRate)
    const chunkLength = endSample - startSample

    const chunkBuffer = audioContext.createBuffer(
      audioBuffer.numberOfChannels,
      chunkLength,
      audioBuffer.sampleRate
    )

    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const sourceData = audioBuffer.getChannelData(channel)
      const chunkData = chunkBuffer.getChannelData(channel)

      for (let i = 0; i < chunkLength; i++) {
        chunkData[i] = sourceData[startSample + i]
      }
    }

    return chunkBuffer
  }

  private static audioBufferToWav(audioBuffer: AudioBuffer): Blob {
    const numberOfChannels = audioBuffer.numberOfChannels
    const length = audioBuffer.length * numberOfChannels * 2 + 44
    const buffer = new ArrayBuffer(length)
    const view = new DataView(buffer)
    let pos = 0

    const writeString = (str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(pos++, str.charCodeAt(i))
      }
    }

    const writeUint32 = (data: number) => {
      view.setUint32(pos, data, true)
      pos += 4
    }

    const writeUint16 = (data: number) => {
      view.setUint16(pos, data, true)
      pos += 2
    }

    writeString('RIFF')
    writeUint32(length - 8)
    writeString('WAVE')
    writeString('fmt ')
    writeUint32(16)
    writeUint16(1)
    writeUint16(numberOfChannels)
    writeUint32(audioBuffer.sampleRate)
    writeUint32(audioBuffer.sampleRate * numberOfChannels * 2)
    writeUint16(numberOfChannels * 2)
    writeUint16(16)
    writeString('data')
    writeUint32(length - pos - 4)

    const channels = []
    for (let i = 0; i < numberOfChannels; i++) {
      channels.push(audioBuffer.getChannelData(i))
    }

    let offset = 0
    while (pos < length) {
      for (let i = 0; i < numberOfChannels; i++) {
        const sample = Math.max(-1, Math.min(1, channels[i][offset]))
        const intSample = (sample < 0 ? sample * 32768 : sample * 32767) | 0
        view.setInt16(pos, intSample, true)
        pos += 2
      }
      offset++
    }

    return new Blob([buffer], { type: 'audio/wav' })
  }
}
