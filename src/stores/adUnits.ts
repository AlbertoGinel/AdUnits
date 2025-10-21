import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { CREATIVE_FRAMES } from '@/types/creativeFrames'
import { useDevLogger } from '@/devTools/useDevLogger'

// Simple working AdUnit - just what we need
export interface WorkingAdUnit {
  adUnitId: string
  name: string
  dimensions: { width: number; height: number }
  position: { x: number; y: number }
  headline: {
    text: string
    x: number
    y: number
    fontSize: number
    fontFamily: string
    fill: string
    fontWeight?: number
  }
  subhead: {
    text: string
    x: number
    y: number
    fontSize: number
    fontFamily: string
    fill: string
    fontWeight?: number
  }
  cta: {
    text: string
    x: number
    y: number
    fontSize: number
    fontFamily: string
    fill: string
    fontWeight?: number
  }
  legalDisclaimerText: {
    text: string
    x: number
    y: number
    fontSize: number
    fontFamily: string
    fill: string
    fontWeight?: number
  }
  images: Array<{ position: { x: number; y: number }; name: string; assetId: string }>
  imageAltText: string
  logoAltText: string
  variantId: string
}

export const useAdUnitsStore = defineStore('adUnits', () => {
  const devLogger = useDevLogger('AdUnitsStore')

  // Simple state - just an array of working adUnits
  const workingAdUnits = ref<WorkingAdUnit[]>([])

  // Simple getters
  const adUnits = computed(() => workingAdUnits.value)
  const adUnitCount = computed(() => workingAdUnits.value.length)

  // Simple action - convert CREATIVE_FRAMES to working adUnits array
  const initializeStore = () => {
    devLogger.store('Initializing AdUnits Store...')
    devLogger.info(`Loading from CREATIVE_FRAMES: ${CREATIVE_FRAMES.metadata.name}`)

    // Convert CREATIVE_FRAMES to working adUnits array
    const adUnitsArray: WorkingAdUnit[] = []

    console.log('🔍 CREATIVE_FRAMES.adUnits:', Object.keys(CREATIVE_FRAMES.adUnits))

    Object.entries(CREATIVE_FRAMES.adUnits).forEach(([adUnitId, adUnit]) => {
      console.log(`🔍 Processing adUnit: ${adUnitId}`, adUnit)

      adUnitsArray.push({
        adUnitId: adUnitId,
        name: adUnit.name,
        dimensions: { ...adUnit.dimensions },
        position: { ...adUnit.position },
        headline: { ...adUnit.headline },
        subhead: { ...adUnit.subhead },
        cta: { ...adUnit.cta },
        legalDisclaimerText: { ...adUnit.legalDisclaimerText },
        images: [...adUnit.images],
        imageAltText: adUnit.imageAltText,
        logoAltText: adUnit.logoAltText,
        variantId: adUnit.variantId,
      })
    })

    workingAdUnits.value = adUnitsArray
    console.log('🔍 Final adUnitsArray:', adUnitsArray)
    devLogger.success(`Initialized with ${adUnitsArray.length} ad units`)
  }

  return {
    // State
    workingAdUnits,

    // Getters
    adUnits,
    adUnitCount,

    // Actions
    initializeStore,
  }
})
