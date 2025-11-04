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
  const currentView = ref<'overview' | 'edit'>('overview')
  const currentAdUnitId = ref<string | null>(null)

  const getCurrentAdUnit = (): AdUnit | null => {
    if (!currentAdUnitId.value) return null
    return adUnits.value.find((unit) => unit.id === currentAdUnitId.value) || null
  }

  const switchToEdit = (adUnitId: string) => {
    currentAdUnitId.value = adUnitId
    currentView.value = 'edit'
    console.log(`🔧 Switching to edit mode for: ${adUnitId}`)
  }

  const switchToOverview = () => {
    currentAdUnitId.value = null
    currentView.value = 'overview'
    console.log('📋 Switching to overview mode')
  }

  const loadInitialTemplate = async (): Promise<void> => {
    // ✅ Load ad units, frames, and service
    const { getMarqueeAdUnit, marqueeFrameConfig } = await import(
      '@/services/templates/marqueeTemplate'
    )
    const { getBrandboxAdUnit, brandboxFrameConfig } = await import(
      '@/services/templates/brandboxTemplate'
    )
    const { AdUnitFrameService } = await import('@/services/templates/adUnitFrame')

    // ✅ Get pure ad unit content
    const marqueeAdUnit = getMarqueeAdUnit()
    const brandboxAdUnit = getBrandboxAdUnit()

    // ✅ Create framed ad units using imported frame configs
    const framedMarqueeElements = AdUnitFrameService.createFramedAdUnit(
      marqueeFrameConfig,
      marqueeAdUnit,
      { x: 0, y: 16 }, // Content offset from frame top
    )

    const framedBrandboxElements = AdUnitFrameService.createFramedAdUnit(
      brandboxFrameConfig,
      brandboxAdUnit,
      { x: 0, y: 15 }, // Content offset from frame top
    )

    // ✅ Create structured ad unit objects
    const marqueeAdUnitObject: AdUnit = {
      id: marqueeFrameConfig.id,
      title: marqueeFrameConfig.title,
      frameConfig: marqueeFrameConfig,
      elements: framedMarqueeElements,
    }

    const brandboxAdUnitObject: AdUnit = {
      id: brandboxFrameConfig.id,
      title: brandboxFrameConfig.title,
      frameConfig: brandboxFrameConfig,
      elements: framedBrandboxElements,
    }

    // ✅ Store as structured ad units
    adUnits.value = [marqueeAdUnitObject, brandboxAdUnitObject]
  }

  return {
    adUnits,
    currentView,
    currentAdUnitId,
    getCurrentAdUnit,
    switchToEdit,
    switchToOverview,
    loadInitialTemplate,
  }
})
