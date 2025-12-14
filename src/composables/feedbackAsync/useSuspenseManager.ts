// composables/feedbackAsync/useSuspenseManager.ts
import { ref } from 'vue'

/**
 * Suspense Manager - Singleton for managing loading states
 * Coordinates with useCreativeAPI events to drive skeleton visibility
 */

interface SuspenseState {
  appReady: boolean
  loadingImagesMenuReady: boolean
}

// Singleton instance
let sharedSuspenseManager: ReturnType<typeof createSuspenseManager> | null = null

export function useSuspenseManager() {
  if (!sharedSuspenseManager) {
    sharedSuspenseManager = createSuspenseManager()
  }
  return sharedSuspenseManager
}

function createSuspenseManager() {
  // Internal state
  const appReady = ref(false)
  const loadingImagesMenuReady = ref(true) // Start ready, false during operations

  /**
   * Initialize event listeners for useCreativeAPI events
   */
  const initializeListeners = () => {
    // App initialization events
    window.addEventListener('creative-api-bundle-ready', handleBundleReady)
    window.addEventListener('creative-api-bundle-error', handleBundleError)

    // Image operation events
    window.addEventListener('creative-api-asset-start', handleImageOperationStart)
    window.addEventListener('creative-api-asset-complete', handleImageOperationComplete)
    window.addEventListener('creative-api-asset-error', handleImageOperationError)
  }

  /**
   * Event handlers
   */
  const handleBundleReady = () => {
    console.log('📱 SuspenseManager: App ready')
    appReady.value = true
  }

  const handleBundleError = () => {
    console.log('📱 SuspenseManager: App failed to load')
    appReady.value = false
  }

  const handleImageOperationStart = () => {
    console.log('📱 SuspenseManager: Image operation started')
    loadingImagesMenuReady.value = false
  }

  const handleImageOperationComplete = () => {
    console.log('📱 SuspenseManager: Image operation completed')
    loadingImagesMenuReady.value = true
  }

  const handleImageOperationError = () => {
    console.log('📱 SuspenseManager: Image operation failed')
    loadingImagesMenuReady.value = true
  }

  /**
   * Manual state setters (for testing or edge cases)
   */
  const setAppReady = (ready: boolean) => {
    appReady.value = ready
  }

  const setImagesMenuReady = (ready: boolean) => {
    loadingImagesMenuReady.value = ready
  }

  /**
   * Reset all states (for testing)
   */
  const resetStates = () => {
    appReady.value = false
    loadingImagesMenuReady.value = true
  }

  /**
   * Get current state snapshot
   */
  const getState = (): SuspenseState => ({
    appReady: appReady.value,
    loadingImagesMenuReady: loadingImagesMenuReady.value,
  })

  // Initialize listeners on creation
  initializeListeners()

  return {
    // Reactive state
    appReady,
    loadingImagesMenuReady,

    // Methods
    setAppReady,
    setImagesMenuReady,
    resetStates,
    getState,

    // Event handling
    initializeListeners,
  }
}
