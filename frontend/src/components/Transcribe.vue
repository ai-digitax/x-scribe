<script setup lang="ts">
import { ref } from 'vue'
import Loading from './Loading.vue'
import { useToastStore } from '../stores/toast'
import { createTranscribeService, type TranscribeProgress } from '../services/transcribe'

const toastStore = useToastStore()

const audioFile = ref<File | null>(null)
const fileName = ref('')
const isLoading = ref(false)
const transcribedText = ref('')
const progress = ref<TranscribeProgress | undefined>(undefined)

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    audioFile.value = target.files[0]
    fileName.value = target.files[0].name
    submitForm()
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  const files = event.dataTransfer?.files
  if (files && files[0]) {
    audioFile.value = files[0]
    fileName.value = files[0].name
    submitForm()
  }
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
}

const submitForm = async () => {
  if (!audioFile.value) return

  isLoading.value = true
  progress.value = undefined
  transcribedText.value = ''

  try {
    const transcribeService = createTranscribeService()
    const result = await transcribeService.transcribe(
      audioFile.value,
      (p) => { progress.value = p; }
    )

    // 最終結果のみを表示
    transcribedText.value = result.text
    toastStore.showSuccess('文字起こしが完了しました')
  } catch (error) {
    const message = error instanceof Error ? error.message : '不明なエラーが発生しました。'
    toastStore.showError(message)
  } finally {
    isLoading.value = false
    progress.value = undefined
  }
}

const copyToClipboard = async () => {
  try {
    // 近代的なClipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(transcribedText.value)
      toastStore.showSuccess('クリップボードにコピーしました')
      return
    }
    
    // フォールバック方法: document.execCommand
    const textArea = document.createElement('textarea')
    textArea.value = transcribedText.value
    
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    document.body.appendChild(textArea)
    
    textArea.focus()
    textArea.select()
    
    const success = document.execCommand('copy')
    document.body.removeChild(textArea)
    
    if (success) {
      toastStore.showSuccess('クリップボードにコピーしました')
    } else {
      toastStore.showError('コピーに失敗しました')
    }
  } catch (error) {
    console.error('クリップボードへのコピーに失敗しました:', error)
    toastStore.showError('コピーに失敗しました')
  }
}
</script>

<template>
  <div class="container">
    <h1>X-Scribe</h1>

    <div class="form-group">
      <div
        class="drop-area"
        @drop="handleDrop"
        @dragover="handleDragOver"
        @click="() => ($refs.fileInput as HTMLInputElement)?.click()"
      >
        <div class="file-icon">🎵</div>
        <p>ファイルをドラッグ＆ドロップするか、クリックして選択してください</p>
        <p>MP3 / M4A / WAV / MP4</p>
        <p v-if="fileName" class="file-name">選択されたファイル: {{ fileName }}</p>
      </div>
      <input
        ref="fileInput"
        type="file"
        accept=".mp3,.mp4,.m4a,.wav"
        @change="handleFileSelect"
        style="display: none;"
      >
    </div>

    <Loading
      :is_visible="isLoading"
      :progress="progress"
    />

    <div v-if="transcribedText" class="result">
      <h2>文字起こし結果</h2>
      <div class="form-group">
        <textarea
          v-model="transcribedText"
          class="result-text"
          placeholder="文字起こし結果がここに表示されます"
        ></textarea>
        <div class="button-container">
          <button @click="copyToClipboard" class="btn btn-success">
            コピー
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.drop-area {
  width: 100%;
  padding: 30px;
  border: 2px dashed var(--primary-color);
  border-radius: 4px;
  background-color: var(--drop-area-bg);
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.drop-area:hover {
  background-color: var(--drop-area-hover);
  border-color: var(--primary-hover);
}

.drop-area p {
  margin: 0;
  color: var(--text-muted);
}

.file-icon {
  font-size: 36px;
  color: var(--primary-color);
  margin-bottom: 10px;
}

.file-name {
  font-weight: bold;
  color: var(--text-color) !important;
}

.result-container {
  position: relative;
}

.result {
  position: relative;
}

.result-text {
  width: 100%;
  min-height: 200px;
  padding: 15px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--drop-area-bg);
  white-space: pre-wrap;
  margin-bottom: 10px;
  font-family: inherit;
  resize: vertical;
}

.button-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}
</style>
