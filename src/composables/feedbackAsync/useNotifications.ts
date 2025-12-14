// composables/feedbackAsync/useNotifications.ts
import { ref } from 'vue'
import { useSuspenseManager } from './useSuspenseManager'

/**
 * Toast Notification Manager - Singleton for managing user feedback
 * Integrates with useSuspenseManager to show operation status
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

interface NotificationState {
  toasts: Toast[]
  isVisible: boolean
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

  // Integration with suspense manager
  const suspenseManager = useSuspenseManager()

  let toastIdCounter = 0

  /**
   * Initialize event listeners for useCreativeAPI events
   */
  const initializeListeners = () => {
    // Bundle loading events
    window.addEventListener('creative-api-bundle-ready', handleBundleSuccess)
    window.addEventListener('creative-api-bundle-error', handleBundleError)

    // Asset operation events
    window.addEventListener('creative-api-asset-start', handleAssetStart)
    window.addEventListener('creative-api-asset-complete', handleAssetSuccess)
    window.addEventListener('creative-api-asset-error', handleAssetError)

    // Image manager events
    window.addEventListener('image-manager-images-ready', handleImagesReady)
    window.addEventListener('image-manager-error', handleImageError)
  }

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
   * Event handlers
   */
  const handleBundleSuccess = () => {
    createToast('success', 'App Ready', 'Creative loaded successfully', { duration: 2000 })
  }

  const handleBundleError = (event: CustomEvent) => {
    const data = event.detail
    createToast('error', 'Failed to Load Creative', data?.error || 'Unknown error occurred', {
      persistent: true,
      actions: [
        {
          label: 'Retry',
          action: () => window.location.reload(),
        },
      ],
    })
  }

  const handleAssetStart = (event: CustomEvent) => {
    const data = event.detail
    const operation = data?.type?.includes('insert') ? 'Uploading' : 'Deleting'
    createToast('info', `${operation} Image`, 'Processing your request...', { duration: 1000 })
  }

  const handleAssetSuccess = (event: CustomEvent) => {
    const data = event.detail
    const operation = data?.type?.includes('insert') ? 'Uploaded' : 'Deleted'
    createToast('success', `Image ${operation}`, 'Operation completed successfully')
  }

  const handleAssetError = (event: CustomEvent) => {
    const data = event.detail
    const operation = data?.type?.includes('insert') ? 'upload' : 'delete'

    createToast('error', `Failed to ${operation} image`, data?.error || 'Please try again', {
      persistent: true,
      actions: [
        {
          label: 'Retry',
          action: () => {
            // The retry action would be handled by the component that initiated the operation
            console.log('Retry action triggered')
          },
        },
      ],
    })
  }

  const handleImagesReady = () => {
    createToast('success', 'Images Loaded', 'All images cached successfully', { duration: 2000 })
  }

  const handleImageError = (event: CustomEvent) => {
    const data = event.detail
    createToast(
      'warning',
      'Image Loading Issue',
      `Some images failed to load: ${data?.error || 'Unknown error'}`,
      { duration: 4000 },
    )
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

  // Initialize listeners on creation
  initializeListeners()

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

    // Event handling
    initializeListeners,
  }
}
