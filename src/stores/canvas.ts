// stores/canvas.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface CanvasElement {
  type: 'text' | 'rect' | 'image' | 'button'
  x: number
  y: number
  text?: string
  fontSize?: number
  fill?: string
  fontFamily?: string
  fontStyle?: string
  align?: 'left' | 'center' | 'right' | 'justify'
  wrap?: 'word' | 'char' | 'none'
  verticalAlign?: 'top' | 'middle' | 'bottom'
  width?: number
  height?: number
  cornerRadius?: number
  strokeColor?: string
  strokeWidth?: number
  image?: string | null
  crop?: {
    x: number
    y: number
    width?: number
    height?: number
  }
  tag?: string
  locked?: boolean
}

export interface AdUnit {
  id: string
  title: string
  frameConfig: {
    title: string
    dimensions: { width: number; height: number }
    position: { x: number; y: number }
    editButtonOffset?: { x: number; y: number }
    contentOffset: { x: 0; y: 16 }
  }
  elements: Record<string, CanvasElement>
}

export interface LayerDefinition {
  type: 'text' | 'image'
  defaultValue: string
}

export const useCanvasStore = defineStore('canvas', () => {
  // Raw data state
  const adUnits = ref<Record<string, AdUnit>>({})
  const layers = ref<Record<string, LayerDefinition>>({})
  const currentView = ref<'bulkMode' | 'focusMode'>('bulkMode')
  const currentAdUnitId = ref<string | null>(null)
  const isInitialized = ref(false)

  return {
    adUnits,
    layers,
    currentView,
    currentAdUnitId,
    isInitialized,
  }
})
