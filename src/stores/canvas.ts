import { defineStore } from 'pinia'
import { ref } from 'vue'

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

  const loadInitialTemplate = async (): Promise<void> => {
    // ✅ Load all ad units using agnostic system
    const { getAllAdUnitDefinitions } = await import('@/services/templates/registry')
    const { AdUnitLoader } = await import('@/services/templates/adUnitLoader')

    // Get all registered ad unit definitions
    const definitions = getAllAdUnitDefinitions()

    // Load all ad units
    adUnits.value = await AdUnitLoader.loadMultiple(definitions)

    console.log('📋 Loaded ad units:', {
      adUnits: adUnits.value.length,
      totalElements: adUnits.value.reduce((sum, unit) => sum + unit.elements.length, 0),
      units: adUnits.value.map((unit) => ({ id: unit.id, elements: unit.elements.length })),
    })
  }

  return {
    adUnits,
    currentView,
    currentAdUnitId,
    getCurrentAdUnit,
    switchToFocusMode,
    switchToBulkMode,
    loadInitialTemplate,
  }
})
