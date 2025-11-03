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

export const useCanvasStore = defineStore('canvas', () => {
  // ✅ Clean store - no hardcoded elements
  const elements = ref<CanvasElement[]>([])

  const loadInitialTemplate = async (): Promise<void> => {
    // Dynamic import to avoid circular dependencies
    const { getInitialElements } = await import('@/services/initialTemplate')
    elements.value = getInitialElements()
    console.log('📋 Loaded initial template with', elements.value.length, 'elements')
  }

  return {
    elements,
    loadInitialTemplate,
  }
})
