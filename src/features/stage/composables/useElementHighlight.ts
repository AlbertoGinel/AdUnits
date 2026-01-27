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
  console.log('🎯 Creating element highlight singleton with stage reference')
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
        console.warn('⚠️ Konva stage not available')
        return
      }

      // Find matching elements
      const matchingNodes = konvaStage.find((node: Konva.Node) => {
        const nodeName = node.name() || node.id() || ''
        return nodeName.includes(elementType)
      })

      console.log(`🎯 Found ${matchingNodes.length} ${elementType} elements to highlight`)

      // Create highlight overlays
      const overlays: HighlightOverlay[] = matchingNodes.map((node: Konva.Node) => {
        // 🔍 DEBUGGING: Log all coordinate sources
        const localX = node.x()
        const localY = node.y()
        const localWidth = node.width()
        const localHeight = node.height()
        const absolutePos = node.absolutePosition()
        const clientRect = node.getClientRect()
        const stageScale = konvaStage.scaleX()
        const stagePosition = { x: konvaStage.x(), y: konvaStage.y() }

        console.log('🔍 COORDINATE DEBUG for:', node.name() || node.id())
        console.log('🔍 Local coords:', {
          x: localX,
          y: localY,
          width: localWidth,
          height: localHeight,
        })
        console.log('🔍 Absolute position:', absolutePos)
        console.log('🔍 Client rect:', clientRect)
        console.log('🔍 Stage scale:', stageScale)
        console.log('🔍 Stage position:', stagePosition)
        console.log('🔍 ==================')

        // ✅ OPTION A: Use absolutePosition() for true stage coordinates
        //const absolutePos = node.absolutePosition()

        console.log('🔧 USING COMPENSATED ABSOLUTE COORDS (PAN + SCALE)')

        const finalOverlay = {
          x: (absolutePos.x - stagePosition.x) / stageScale, // Remove stage pan AND scale
          y: (absolutePos.y - stagePosition.y) / stageScale, // Remove stage pan AND scale
          width: localWidth,
          height: localHeight,
          stroke: '#ff0000',
          strokeWidth: 3,
          fill: 'transparent',
          listening: false,
        }

        console.log('🔧 SCALE COMPENSATED COORDS:', {
          originalX: absolutePos.x,
          originalY: absolutePos.y,
          stageX: stagePosition.x,
          stageY: stagePosition.y,
          scale: stageScale,
          finalX: finalOverlay.x,
          finalY: finalOverlay.y,
        })

        console.log('🔧 FINAL OVERLAY CONFIG:', finalOverlay)

        return finalOverlay
      })

      activeHighlights.value = overlays

      console.log('🔧 ALL OVERLAYS STORED IN REACTIVE STATE:', overlays)
      console.log('🔧 ACTIVE HIGHLIGHTS ARRAY LENGTH:', activeHighlights.value.length)
    } catch (error) {
      console.error('❌ Failed to create highlights:', error)
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
