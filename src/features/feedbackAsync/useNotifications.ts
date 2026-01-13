// composables/feedbackAsync/useNotifications.ts
import { ref } from 'vue'

/**
 * Toast Notification Manager - Singleton for managing user feedback
 * Called directly by useCreativeAPI and other composables
 */

interface ToastAction {
  label: string
  action: () => void | Promise<void>
}

interface Toast {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  persistent?: boolean
  actions?: ToastAction[]
  timestamp: number
}

// Singleton instance
let sharedNotificationManager: ReturnType<typeof createNotificationManager> | null = null

export function useNotifications() {
  if (!sharedNotificationManager) {
    sharedNotificationManager = createNotificationManager()
  }
  return sharedNotificationManager
}

function createNotificationManager() {
  // Internal state
  const toasts = ref<Toast[]>([])
  const isVisible = ref(false)

  let toastIdCounter = 0

  /**
   * Create a new toast
   */
  const createToast = (
    type: Toast['type'],
    title: string,
    message: string,
    options: {
      persistent?: boolean
      actions?: ToastAction[]
      duration?: number
    } = {},
  ): Toast => {
    const toast: Toast = {
      id: `toast-${++toastIdCounter}`,
      type,
      title,
      message,
      persistent: options.persistent || false,
      actions: options.actions || [],
      timestamp: Date.now(),
    }

    toasts.value.push(toast)
    isVisible.value = true

    // Auto-dismiss non-persistent toasts
    if (!toast.persistent) {
      const duration = options.duration || (type === 'success' ? 3000 : 5000)
      setTimeout(() => {
        removeToast(toast.id)
      }, duration)
    }

    console.log(`🍞 Toast: ${type.toUpperCase()} - ${title}`)
    return toast
  }

  /**
   * Remove a toast by ID
   */
  const removeToast = (toastId: string) => {
    const index = toasts.value.findIndex((t) => t.id === toastId)
    if (index > -1) {
      toasts.value.splice(index, 1)
      if (toasts.value.length === 0) {
        isVisible.value = false
      }
    }
  }

  /**
   * Clear all toasts
   */
  const clearAllToasts = () => {
    toasts.value = []
    isVisible.value = false
  }

  /**
   * Manual toast methods
   */
  const showToast = (
    type: Toast['type'],
    title: string,
    message: string,
    options?: {
      persistent?: boolean
      actions?: ToastAction[]
      duration?: number
    },
  ) => {
    return createToast(type, title, message, options)
  }

  const showSuccess = (title: string, message: string) => {
    return createToast('success', title, message)
  }

  const showError = (title: string, message: string, actions?: ToastAction[]) => {
    return createToast('error', title, message, { persistent: true, actions })
  }

  const showWarning = (title: string, message: string) => {
    return createToast('warning', title, message)
  }

  const showInfo = (title: string, message: string) => {
    return createToast('info', title, message)
  }

  /**
   * Get notification statistics
   */
  const getStats = () => ({
    total: toasts.value.length,
    byType: {
      info: toasts.value.filter((t) => t.type === 'info').length,
      success: toasts.value.filter((t) => t.type === 'success').length,
      warning: toasts.value.filter((t) => t.type === 'warning').length,
      error: toasts.value.filter((t) => t.type === 'error').length,
    },
    persistent: toasts.value.filter((t) => t.persistent).length,
  })

  return {
    // Reactive state
    toasts,
    isVisible,

    // Manual methods
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeToast,
    clearAllToasts,

    // Utilities
    getStats,
  }
}
