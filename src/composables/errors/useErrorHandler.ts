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

export interface DependencyState {
  assets: boolean
  creativeData: boolean
}

export interface SuspenseState {
  isLoading: boolean
  isTimeout: boolean
  startTime: number | null
  timeoutDuration: number
}

// Singleton state - shared across all instances
const toasts = ref<ToastMessage[]>([])
const isInFallbackMode = ref(false)

// Global dependency tracking
const dependencies = ref<DependencyState>({
  assets: false,
  creativeData: false,
})

// Global suspense state
const suspenseState = ref<SuspenseState>({
  isLoading: false,
  isTimeout: false,
  startTime: null,
  timeoutDuration: 8000, // 8 seconds before showing retry
})

let instanceCount = 0
let timeoutId: number | null = null
let lastRetryTimestamp = 0

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

    // Mark critical dependencies as failed
    if (operation.includes('assets')) {
      dependencies.value.assets = false
    }
    if (operation.includes('creative')) {
      dependencies.value.creativeData = false
    }

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

  /**
   * Set dependency status
   */
  const setDependency = async (key: keyof DependencyState, value: boolean) => {
    console.log(`🔗 Dependency ${key}: ${value}`)
    dependencies.value[key] = value

    // Check if we can exit suspense mode
    if (value && (await areCriticalDependenciesReady())) {
      exitSuspense()
    }
  }

  /**
   * Check if critical dependencies are ready (including images)
   */
  const areCriticalDependenciesReady = async () => {
    const depsReady = dependencies.value.assets && dependencies.value.creativeData

    if (!depsReady) return false

    try {
      // Dynamic import to avoid circular dependency
      const { useImageManager } = await import('@/composables/setupImages/useImageManager')
      const { areImagesLoading } = useImageManager()
      const imagesStillLoading = areImagesLoading.value

      console.log('🔍 Dependencies ready:', depsReady, 'Images loading:', imagesStillLoading)

      return depsReady && !imagesStillLoading
    } catch (error) {
      console.warn('⚠️ Could not check image loading state, defaulting to deps only:', error)
      return depsReady
    }
  } /**
   * Start suspense loading state
   */
  const startSuspense = () => {
    console.log('⏳ Starting suspense mode')
    suspenseState.value = {
      isLoading: true,
      isTimeout: false,
      startTime: Date.now(),
      timeoutDuration: suspenseState.value.timeoutDuration,
    }

    // Clear existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    // Set timeout for retry button
    timeoutId = setTimeout(() => {
      if (suspenseState.value.isLoading && !areCriticalDependenciesReady()) {
        console.log('⏰ Suspense timeout - showing retry')
        suspenseState.value.isTimeout = true
      }
    }, suspenseState.value.timeoutDuration)
  }

  /**
   * Exit suspense mode
   */
  const exitSuspense = () => {
    console.log('⏳ Exiting suspense mode')
    suspenseState.value.isLoading = false
    suspenseState.value.isTimeout = false
    suspenseState.value.startTime = null

    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  /**
   * Retry critical dependencies (single attempt only)
   */
  const retryCriticalDependencies = async () => {
    const timestamp = Date.now()

    // Prevent multiple rapid retries
    if (timestamp - lastRetryTimestamp < 1000) {
      console.log('🚫 Ignoring rapid retry attempt')
      return
    }

    lastRetryTimestamp = timestamp
    console.log('🔄 Retrying critical dependencies')

    // Reset dependencies
    dependencies.value.assets = false
    dependencies.value.creativeData = false

    // Restart suspense
    startSuspense()

    // Show loading toast
    showToast({
      type: 'info',
      title: 'Retrying...',
      message: 'Loading creative data and assets',
      duration: 3000,
    })

    // Trigger app re-initialization with unique timestamp
    const event = new CustomEvent('retry-critical-dependencies', {
      detail: { timestamp },
    })
    window.dispatchEvent(event)
  }

  return {
    // State
    toasts: readonly(toasts),
    isInFallbackMode: readonly(isInFallbackMode),
    dependencies: readonly(dependencies),
    suspenseState: readonly(suspenseState),

    // Toast management
    showToast,
    removeToast,

    // Dependency management
    setDependency,
    areCriticalDependenciesReady,
    startSuspense,
    exitSuspense,
    retryCriticalDependencies,

    // Specific error handlers
    handleCreativeLoadError,
    handleAssetLoadError,
    handleUploadError,
    handleUploadSuccess,
    handleNetworkError,
  }
}
