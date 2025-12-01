// composables/errors/useErrorHandler.ts
import { ref, readonly } from 'vue'

export interface AppError {
  type: 'loading' | 'upload' | 'network' | 'validation'
  operation: string
  message: string
  canRetry: boolean
  retryFn?: () => Promise<void>
}

export interface ToastMessage {
  id: string
  type: 'error' | 'success' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
  actions?: Array<{
    label: string
    action: () => void
  }>
}

// Singleton state - shared across all instances
const toasts = ref<ToastMessage[]>([])
const isInFallbackMode = ref(false)

let instanceCount = 0

export function useErrorHandler() {
  instanceCount++
  console.log(
    '🔧 useErrorHandler initialized - instance',
    instanceCount,
    '- toasts:',
    toasts.value.length,
  ) /**
   * Show toast notification to user
   */
  const showToast = (toast: Omit<ToastMessage, 'id'>) => {
    console.log('📝 showToast called with:', toast.title, toast.message)

    const id = crypto.randomUUID()
    const newToast: ToastMessage = {
      ...toast,
      id,
      duration: toast.duration || 5000,
    }

    toasts.value.push(newToast)
    console.log('📋 Toasts array now has:', toasts.value.length, 'toasts')

    // Auto-remove after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }

    return id
  }

  /**
   * Remove toast by ID
   */
  const removeToast = (id: string) => {
    const index = toasts.value.findIndex((toast) => toast.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  /**
   * Handle creative data loading errors
   */
  const handleCreativeLoadError = (error: unknown, retryFn: () => Promise<void>) => {
    console.error('❌ Creative data load failed:', error)

    // Enable fallback mode
    isInFallbackMode.value = true

    showToast({
      type: 'error',
      title: 'Failed to load creative data',
      message: 'Using fallback content. Check your connection.',
      actions: [
        {
          label: 'Try Again',
          action: async () => {
            try {
              await retryFn()
              isInFallbackMode.value = false
              showToast({
                type: 'success',
                title: 'Connected',
                message: 'Creative data loaded successfully',
              })
            } catch (retryError) {
              handleCreativeLoadError(retryError, retryFn)
            }
          },
        },
      ],
    })
  }

  /**
   * Handle asset loading errors
   */
  const handleAssetLoadError = (assetId: string, error: unknown, retryFn: () => Promise<void>) => {
    console.error('❌ Asset load failed:', assetId, error)

    showToast({
      type: 'error',
      title: 'Failed to load image',
      message: `Image ${assetId} couldn't be loaded`,
      actions: [
        {
          label: 'Retry',
          action: retryFn,
        },
      ],
    })
  }

  /**
   * Handle asset upload errors
   */
  const handleUploadError = (fileName: string, error: unknown, retryFn: () => Promise<void>) => {
    console.error('❌ Upload failed:', fileName, error)

    showToast({
      type: 'error',
      title: 'Upload failed',
      message: 'Please try uploading again',
      actions: [
        {
          label: 'Try Again',
          action: retryFn,
        },
      ],
    })
  }

  /**
   * Handle upload success
   */
  const handleUploadSuccess = (fileName: string) => {
    showToast({
      type: 'success',
      title: 'Upload successful',
      message: `${fileName} has been added to your creative`,
    })
  }

  /**
   * Handle general network errors
   */
  const handleNetworkError = (operation: string, retryFn?: () => Promise<void>) => {
    console.log('🚨 handleNetworkError called:', operation)

    const actions = retryFn
      ? [
          {
            label: 'Retry',
            action: retryFn,
          },
        ]
      : undefined

    const toastId = showToast({
      type: 'error',
      title: 'Connection problem',
      message: `Failed to ${operation}. Check your internet connection.`,
      actions,
    })

    console.log('🍞 Toast created:', toastId)
  }

  return {
    // State
    toasts: readonly(toasts),
    isInFallbackMode: readonly(isInFallbackMode),

    // Toast management
    showToast,
    removeToast,

    // Specific error handlers
    handleCreativeLoadError,
    handleAssetLoadError,
    handleUploadError,
    handleUploadSuccess,
    handleNetworkError,
  }
}
