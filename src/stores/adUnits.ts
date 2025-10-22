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
    fontStyle?: 'normal' | 'bold' | 'italic'
  }
  subhead: {
    text: string
    x: number
    y: number
    fontSize: number
    fontFamily: string
    fill: string
    fontStyle?: 'normal' | 'bold' | 'italic'
  }
  cta: {
    text: string
    x: number
    y: number
    fontSize: number
    fontFamily: string
    fill: string
    fontStyle?: 'normal' | 'bold' | 'italic'
  }
  legalDisclaimerText: {
    text: string
    x: number
    y: number
    fontSize: number
    fontFamily: string
    fill: string
    fontStyle?: 'normal' | 'bold' | 'italic'
  }
  ctaButton: {
    x: number
    y: number
    width: number
    height: number
    cornerRadius: number
    fill: string
    stroke: string
    strokeWidth: number
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
        headline: {
          text: adUnit.headline.text,
          x: adUnit.headline.x,
          y: adUnit.headline.y,
          fontSize: adUnit.headline.fontSize,
          fontFamily: adUnit.headline.fontFamily,
          fill: adUnit.headline.fill,
          fontStyle:
            adUnit.headline.fontStyle === 'bold' || adUnit.headline.fontStyle === 'italic'
              ? adUnit.headline.fontStyle
              : 'normal',
        },
        subhead: {
          text: adUnit.subhead.text,
          x: adUnit.subhead.x,
          y: adUnit.subhead.y,
          fontSize: adUnit.subhead.fontSize,
          fontFamily: adUnit.subhead.fontFamily,
          fill: adUnit.subhead.fill,
          fontStyle:
            adUnit.subhead.fontStyle === 'bold' || adUnit.subhead.fontStyle === 'italic'
              ? adUnit.subhead.fontStyle
              : 'normal',
        },
        cta: {
          text: adUnit.cta.text,
          x: adUnit.cta.x,
          y: adUnit.cta.y,
          fontSize: adUnit.cta.fontSize,
          fontFamily: adUnit.cta.fontFamily,
          fill: adUnit.cta.fill,
          fontStyle:
            adUnit.cta.fontStyle === 'bold' || adUnit.cta.fontStyle === 'italic'
              ? adUnit.cta.fontStyle
              : 'normal',
        },
        legalDisclaimerText: {
          text: adUnit.legalDisclaimerText.text,
          x: adUnit.legalDisclaimerText.x,
          y: adUnit.legalDisclaimerText.y,
          fontSize: adUnit.legalDisclaimerText.fontSize,
          fontFamily: adUnit.legalDisclaimerText.fontFamily,
          fill: adUnit.legalDisclaimerText.fill,
          fontStyle:
            adUnit.legalDisclaimerText.fontStyle === 'bold' ||
            adUnit.legalDisclaimerText.fontStyle === 'italic'
              ? adUnit.legalDisclaimerText.fontStyle
              : 'normal',
        },
        ctaButton: {
          x: adUnit.ctaButton.x,
          y: adUnit.ctaButton.y,
          width: adUnit.ctaButton.width,
          height: adUnit.ctaButton.height,
          cornerRadius: adUnit.ctaButton.cornerRadius,
          fill: adUnit.ctaButton.fill,
          stroke: adUnit.ctaButton.stroke,
          strokeWidth: adUnit.ctaButton.strokeWidth,
        },
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
