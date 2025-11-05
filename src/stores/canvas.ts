import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { LayerDefinition } from '@/services/templates/registry'

export interface CanvasElement {
  id: string
  type: 'text' | 'rect' | 'image' | 'button'
  x: number
  y: number
  // Text properties
  text?: string
  fontSize?: number
  fill?: string
  fontFamily?: string
  fontStyle?: string
  align?: 'left' | 'center' | 'right' | 'justify'
  wrap?: 'word' | 'char' | 'none'
  verticalAlign?: 'top' | 'middle' | 'bottom'
  // Shape properties
  width?: number
  height?: number
  cornerRadius?: number
  strokeColor?: string
  strokeWidth?: number
  // Image properties
  image?: string | null
  crop?: {
    x: number
    y: number
    width?: number
    height?: number
  }
  // Element metadata for finding/filtering
  tag?: string
  locked?: boolean
}

export interface AdUnit {
  id: string
  title: string
  frameConfig: {
    id: string
    title: string
    dimensions: { width: number; height: number }
    position: { x: number; y: number }
    editButtonOffset?: { x: number; y: number }
  }
  elements: CanvasElement[]
}

export const useCanvasStore = defineStore('canvas', () => {
  // ✅ Store ad units as structured objects
  const adUnits = ref<AdUnit[]>([])

  const layers = ref<Record<string, LayerDefinition>>({})

  // ✅ View management
  const currentView = ref<'bulkMode' | 'focusMode'>('bulkMode')
  const currentAdUnitId = ref<string | null>(null)

  const getCurrentAdUnit = (): AdUnit | null => {
    if (!currentAdUnitId.value) return null
    return adUnits.value.find((unit) => unit.id === currentAdUnitId.value) || null
  }

  const switchToFocusMode = (adUnitId: string) => {
    currentAdUnitId.value = adUnitId
    currentView.value = 'focusMode'
    console.log(`🔧 Switching to focus mode for: ${adUnitId}`)
  }

  const switchToBulkMode = () => {
    currentAdUnitId.value = null
    currentView.value = 'bulkMode'
    console.log('📋 Switching to bulk mode')
  }

  //Locked
  const isLocked = (elementId: string): boolean => {
    for (const adUnit of adUnits.value) {
      const element = adUnit.elements.find((el) => el.id === elementId)
      if (element) {
        return element.locked === true
      }
    }
    return false
  }

  const lock = (elementId: string, shouldLock: boolean): void => {
    adUnits.value.forEach((adUnit) => {
      const element = adUnit.elements.find((el) => el.id === elementId)
      if (element) {
        element.locked = shouldLock
      }
    })
    console.log(`${shouldLock ? '🔒 Locked' : '🔓 Unlocked'} element: ${elementId}`)
  }

  const getAdUnitsWithLockedElementsByType = (elementType: 'text' | 'image'): string[] => {
    return adUnits.value
      .filter((adUnit) => {
        // Check if this ad unit has any locked elements of the specified type
        return adUnit.elements.some(
          (element) => element.type === elementType && element.locked === true,
        )
      })
      .map((adUnit) => adUnit.title) // Return the ad unit names
  }

  const loadInitialTemplate = async (): Promise<void> => {
    // ✅ Load all ad units using agnostic system
    const { getAllAdUnitDefinitions, LAYERS } = await import('@/services/templates/registry')
    const { AdUnitLoader } = await import('@/services/templates/adUnitLoader')

    // Load layer definitions first
    layers.value = { ...LAYERS }

    // Get all registered ad unit definitions
    const definitions = getAllAdUnitDefinitions()

    // Load all ad units
    adUnits.value = await AdUnitLoader.loadMultiple(definitions)

    // Apply default values from layers to tagged text and image elements
    adUnits.value.forEach((adUnit) => {
      adUnit.elements.forEach((element) => {
        if (element.tag) {
          const layerDef = layers.value[element.tag]

          if (layerDef && element.type === layerDef.type) {
            if (layerDef.type === 'text' && !element.text) {
              element.text = layerDef.defaultValue
            } else if (layerDef.type === 'image' && !element.image) {
              element.image = layerDef.defaultValue
            }
          }
        }
      })
    })

    // Log applied default values
    const appliedDefaults = adUnits.value.flatMap((adUnit) =>
      adUnit.elements
        .filter((element) => element.tag && layers.value[element.tag])
        .map((element) => ({
          adUnit: adUnit.title,
          elementId: element.id,
          tag: element.tag,
          appliedValue: element.text || element.image,
        })),
    )

    console.log('📋 Loaded canvas data:', {
      layers: Object.keys(layers.value).length,
      adUnits: adUnits.value.length,
      totalElements: adUnits.value.reduce((sum, unit) => sum + unit.elements.length, 0),
      layerTypes: Object.keys(layers.value),
      units: adUnits.value.map((unit) => ({ id: unit.id, elements: unit.elements.length })),
      appliedDefaults: appliedDefaults.length,
    })

    if (appliedDefaults.length > 0) {
      console.log('🎯 Applied layer defaults:', appliedDefaults)
    }
  }

  return {
    adUnits,
    layers,
    currentView,
    currentAdUnitId,
    getCurrentAdUnit,
    switchToFocusMode,
    switchToBulkMode,
    loadInitialTemplate,
    isLocked,
    lock,
    getAdUnitsWithLockedElementsByType,
  }
})
