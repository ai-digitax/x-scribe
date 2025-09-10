import { defineStore } from 'pinia'
import { ref } from 'vue'
import { config } from '../config'

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([])

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    const newToast: Toast = {
      id,
      ...toast,
      duration: toast.duration ?? config.toastDuration
    }

    console.log(`[Toast ${newToast.type.toUpperCase()}] ${toast.message}`)

    toasts.value.push(newToast)

    setTimeout(() => {
      removeToast(id)
    }, newToast.duration)

    return id
  }

  const removeToast = (id: string) => {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const showSuccess = (message: string, duration?: number) => {
    return addToast({ message, type: 'success', duration })
  }

  const showError = (message: string, duration?: number) => {
    return addToast({ message, type: 'error', duration })
  }

  const showWarning = (message: string, duration?: number) => {
    return addToast({ message, type: 'warning', duration })
  }

  const showInfo = (message: string, duration?: number) => {
    return addToast({ message, type: 'info', duration })
  }

  const clearAll = () => {
    toasts.value = []
  }

  return {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    clearAll
  }
})
