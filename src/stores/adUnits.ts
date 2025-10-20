import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { CREATIVE_FRAMES, type AdUnitKey } from '@/types/creativeFrames'
import { useDevLogger } from '@/devTools/useDevLogger'

// Simple working AdUnit - just extends the CreativeFrames AdUnit
export interface WorkingAdUnit {
  adUnitId: AdUnitKey
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
  }
  subhead: {
    text: string
    x: number
    y: number
    fontSize: number
    fontFamily: string
    fill: string
  }
  cta: { text: string; x: number; y: number; fontSize: number; fontFamily: string; fill: string }
  images: Array<{ position: { x: number; y: number }; name: string; assetId: string }>
  imageAltText: string
  logoAltText: string
  legalDisclaimerText: string
  variantId: string
}

// Simple AdUnit group - living version of CREATIVE_FRAMES
export interface AdUnitGroup {
  id: string
  name: string
  adUnits: Record<AdUnitKey, WorkingAdUnit>
}

export const useAdUnitsStore = defineStore('adUnits', () => {
  const devLogger = useDevLogger('AdUnitsStore')

  // Simple state - just the living creative frames
  const currentAdUnitGroup = ref<AdUnitGroup | null>(null)

  // Simple getters
  const adUnitGroup = computed(() => currentAdUnitGroup.value)
  const adUnitKeys = computed(() =>
    currentAdUnitGroup.value ? (Object.keys(currentAdUnitGroup.value.adUnits) as AdUnitKey[]) : [],
  )

  // Simple action - convert CREATIVE_FRAMES to working adUnits
  const initializeStore = () => {
    devLogger.store('Initializing AdUnits Store...')
    devLogger.info(`Loading from CREATIVE_FRAMES: ${CREATIVE_FRAMES.metadata.name}`)

    // Convert CREATIVE_FRAMES to working adUnits
    const workingAdUnits: Record<AdUnitKey, WorkingAdUnit> = {} as Record<AdUnitKey, WorkingAdUnit>

    Object.entries(CREATIVE_FRAMES.adUnits).forEach(([adUnitId, adUnit]) => {
      const typedAdUnitId = adUnitId as AdUnitKey
      workingAdUnits[typedAdUnitId] = {
        adUnitId: typedAdUnitId,
        name: adUnit.name,
        dimensions: { ...adUnit.dimensions },
        position: { ...adUnit.position },
        headline: { ...adUnit.headline },
        subhead: { ...adUnit.subhead },
        cta: { ...adUnit.cta },
        images: [...adUnit.images],
        imageAltText: adUnit.imageAltText,
        logoAltText: adUnit.logoAltText,
        legalDisclaimerText: adUnit.legalDisclaimerText,
        variantId: adUnit.variantId,
      }
    })

    // Create simple group
    currentAdUnitGroup.value = {
      id: `group-${Date.now()}`,
      name: CREATIVE_FRAMES.metadata.name,
      adUnits: workingAdUnits,
    }

    devLogger.success(`Initialized with ${Object.keys(workingAdUnits).length} ad units`)
  }

  return {
    // State
    currentAdUnitGroup,

    // Getters
    adUnitGroup,
    adUnitKeys,

    // Actions
    initializeStore,
  }
})
