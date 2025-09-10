<script setup lang="ts">
interface Props {
  is_visible: boolean
  progress?: {
    current_chunk: number
    total_chunks: number
    chunk_transcript: string
    message: string
  }
}

defineProps<Props>()
</script>

<template>
  <div v-if="is_visible" class="loading-overlay">
    <div class="loading-content">
      <div class="robot-container">
        <img src="/src/assets/agent.gif" alt="Loading..." class="loading-gif" />
        <div v-if="progress && progress.chunk_transcript" class="speech-bubble">
          <p class="bubble-text">{{ progress.chunk_transcript.length > 30 ? progress.chunk_transcript.substring(0, 30) + '...' : progress.chunk_transcript }}</p>
          <div class="bubble-tail"></div>
        </div>
      </div>
      <div v-if="progress" class="progress-info">
        <p class="loading-message">{{ progress.message }}</p>
        <p v-if="progress.total_chunks > 0" class="progress-text">{{ progress.current_chunk - 1 }} / {{ progress.total_chunks }} ({{ (((progress.current_chunk - 1) / progress.total_chunks) * 100).toFixed(0) }} %)</p>
        <div v-if="progress.total_chunks > 0" class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: ((progress.current_chunk - 1) / progress.total_chunks * 100) + '%' }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(2px);
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loading-gif {
  width: 120px;
  height: 120px;
  object-fit: contain;
  filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.3));
  animation: pulse 2s ease-in-out infinite;
}

.loading-message {
  margin-top: 20px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 500;
  text-align: center;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  animation: fadeInOut 3s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
}

@keyframes fadeInOut {
  0%, 100% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
}

.progress-info {
  margin-top: 20px;
  text-align: center;
}

.progress-text {
  color: #ffffff;
  font-size: 14px;
  margin-bottom: 10px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.progress-bar {
  width: 200px;
  height: 8px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #007bff;
  transition: width 0.3s ease;
  border-radius: 4px;
}

.robot-container {
  position: relative;
  display: inline-block;
}

.speech-bubble {
  position: absolute;
  top: 10px;
  left: 140px;
  background: linear-gradient(135deg, rgba(64, 64, 64, 0.95), rgba(48, 48, 48, 0.95));
  border: 1px solid rgba(128, 128, 128, 0.4);
  border-radius: 16px;
  padding: 12px 16px;
  max-width: 240px;
  min-width: 160px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 2px 8px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  animation: bubbleFloat 2s ease-in-out infinite;
  z-index: 10;
}

.bubble-text {
  color: #e8e8e8;
  font-size: 12px;
  line-height: 1.5;
  margin: 0;
  text-align: left;
  font-weight: 400;
  word-break: break-word;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  opacity: 0.95;
}

.bubble-tail {
  position: absolute;
  top: 24px;
  left: -10px;
  width: 0;
  height: 0;
  border-top: 10px solid transparent;
  border-bottom: 10px solid transparent;
  border-right: 12px solid rgba(128, 128, 128, 0.4);
  filter: drop-shadow(-1px 0 2px rgba(0, 0, 0, 0.2));
}

.bubble-tail::before {
  content: '';
  position: absolute;
  top: -8px;
  left: 2px;
  width: 0;
  height: 0;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-right: 10px solid rgba(56, 56, 56, 0.95);
}

@keyframes bubbleFloat {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-3px);
  }
}
</style>
