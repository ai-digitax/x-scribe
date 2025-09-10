<script setup lang="ts">
import { useToastStore } from '../stores/toast'

const toastStore = useToastStore()

const handleClose = (id: string) => {
  toastStore.removeToast(id)
}
</script>

<template>
  <div class="toast-container">
    <div
      v-for="toast in toastStore.toasts"
      :key="toast.id"
      :class="['toast', `toast-${toast.type}`]"
    >
      <span class="toast-message">{{ toast.message }}</span>
      <button
        class="toast-close"
        @click="handleClose(toast.id)"
        aria-label="閉じる"
      >
        ×
      </button>
    </div>
  </div>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 400px;
}

.toast {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  animation: slideIn 0.3s ease-out;
  min-width: 300px;
}

.toast-success {
  background-color: var(--success-bg);
  color: var(--success-text);
  border-left: 4px solid var(--success-color);
}

.toast-error {
  background-color: var(--error-bg);
  color: var(--error-color);
  border-left: 4px solid var(--error-color);
}

.toast-warning {
  background-color: #fff3cd;
  color: #856404;
  border-left: 4px solid var(--warning-color);
}

.toast-info {
  background-color: #d1ecf1;
  color: #0c5460;
  border-left: 4px solid var(--info-color);
}

.toast-message {
  flex: 1;
  margin-right: 10px;
}

.toast-close {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: inherit;
  opacity: 0.7;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toast-close:hover {
  opacity: 1;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .toast-container {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }

  .toast {
    min-width: auto;
  }
}
</style>
