// composables/feedbackAsync/useSuspenseManager.ts
import { ref } from 'vue'

/**
 * Suspense Manager - Singleton for managing loading states
 * Direct function calls from useCreativeAPI and useImageManager
 */

interface SuspenseState {
  bundleReady: boolean
  imagesCached: boolean
  assetOperationInProgress: boolean
  updateCreativeInProgress: boolean
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
  const bundleReady = ref(false)
  const imagesCached = ref(false)
  const assetOperationInProgress = ref(false)
  const updateCreativeInProgress = ref(false)

  /**
   * State setters - called directly by useCreativeAPI and useImageManager
   */
  const setBundleReady = (ready: boolean) => {
    bundleReady.value = ready
  }

  const setImagesCached = (cached: boolean) => {
    console.log('📱 SuspenseManager: Images cached =', cached)
    imagesCached.value = cached
  }

  const setAssetOperationInProgress = (inProgress: boolean) => {
    console.log('📱 SuspenseManager: Asset operation in progress =', inProgress)
    assetOperationInProgress.value = inProgress
  }

  const setUpdateCreativeInProgress = (inProgress: boolean) => {
    console.log('📱 SuspenseManager: Update creative in progress =', inProgress)
    updateCreativeInProgress.value = inProgress
  }

  /**
   * Reset all states (for testing)
   */
  const resetStates = () => {
    bundleReady.value = false
    imagesCached.value = false
    assetOperationInProgress.value = false
    updateCreativeInProgress.value = false
  }

  /**
   * Get current state snapshot
   */
  const getState = (): SuspenseState => ({
    bundleReady: bundleReady.value,
    imagesCached: imagesCached.value,
    assetOperationInProgress: assetOperationInProgress.value,
    updateCreativeInProgress: updateCreativeInProgress.value,
  })

  return {
    // Reactive state
    bundleReady,
    imagesCached,
    assetOperationInProgress,
    updateCreativeInProgress,

    // State setters
    setBundleReady,
    setImagesCached,
    setAssetOperationInProgress,
    setUpdateCreativeInProgress,

    // Utilities
    resetStates,
    getState,
  }
}
