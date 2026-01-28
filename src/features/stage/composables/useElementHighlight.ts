import { ref } from 'vue'
import type { EditableElementType } from '@/types/mainTypes'
import type { Ref } from 'vue'
import Konva from 'konva'

export interface HighlightOverlay {
  x: number
  y: number
  width: number
  height: number
  stroke: string
  strokeWidth: number
  fill?: string
  listening: boolean
}

// Vue-konva component ref type
interface VueKonvaStageRef {
  getNode(): Konva.Stage // Returns the actual Konva Stage
}

// Singleton state
let sharedHighlightInstance: ReturnType<typeof createElementHighlight> | null = null

export function useElementHighlight(stageRef?: Ref<VueKonvaStageRef | null>) {
  // If already created, return existing instance (ignore any new stageRef)
  if (sharedHighlightInstance) {
    return sharedHighlightInstance
  }

  // If not created and no stage provided, error
  if (!stageRef) {
    throw new Error(
      '🎯 Element highlight not initialized - stageRef required for first use (call from CanvasScreen)',
    )
  }

  // Create new instance with stage (first time only)
  sharedHighlightInstance = createElementHighlight(stageRef)
  return sharedHighlightInstance
}

function createElementHighlight(stageRef: Ref<VueKonvaStageRef | null>) {
  const activeHighlights = ref<HighlightOverlay[]>([])
  const highlightMode = ref<EditableElementType | 'none'>('none')

  /**
   * Highlight all elements of a specific editable type
   */
  const highlightElementsByType = (elementType: EditableElementType) => {
    highlightMode.value = elementType

    try {
      // Get Konva stage
      const konvaStage = stageRef.value?.getNode()
      if (!konvaStage) {
        return
      }

      // Find matching elements
      const matchingNodes = konvaStage.find((node: Konva.Node) => {
        const nodeName = node.name() || node.id() || ''
        return nodeName.includes(elementType)
      })

      // Create highlight overlays
      const overlays: HighlightOverlay[] = matchingNodes.map((node: Konva.Node) => {
        const localWidth = node.width()
        const localHeight = node.height()
        const absolutePos = node.absolutePosition()
        const stageScale = konvaStage.scaleX()
        const stagePosition = { x: konvaStage.x(), y: konvaStage.y() }

        const finalOverlay = {
          x: (absolutePos.x - stagePosition.x) / stageScale,
          y: (absolutePos.y - stagePosition.y) / stageScale,
          width: localWidth,
          height: localHeight,
          stroke: '#ff0000',
          strokeWidth: 3,
          fill: 'transparent',
          listening: false,
        }

        return finalOverlay
      })

      activeHighlights.value = overlays
    } catch {
      // Silently handle errors
    }
  }

  /**
   * Clear all active highlights
   */
  const clearHighlights = () => {
    highlightMode.value = 'none'
    activeHighlights.value = []
  }

  return {
    // State
    activeHighlights,
    highlightMode,

    // Actions
    highlightElementsByType,
    clearHighlights,
  }
}
