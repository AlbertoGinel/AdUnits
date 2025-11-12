// composables/useKonvaStage.ts
import { useAdUnitRenderer } from './useAdUnitRenderer'
import { computed } from 'vue'
import type { AdUnit } from '@/stores/canvas'

export function useKonvaStage() {
  const adUnitRenderer = useAdUnitRenderer()

  // Single stage configuration for all ad units
  const stageConfig = computed(() => {
    const adUnits = adUnitRenderer.adUnitsToRender.value.map((item) => item.adUnit)

    if (adUnits.length === 0) {
      return {
        width: 1200,
        height: 800,
        scaleX: 1,
        scaleY: 1,
      }
    }

    if (adUnitRenderer.viewMode.value === 'focusMode' && adUnitRenderer.currentAdUnitId.value) {
      const focusedAdUnit = adUnits.find(
        (adUnit) => adUnit.id === adUnitRenderer.currentAdUnitId.value,
      )

      if (focusedAdUnit) {
        return {
          width: focusedAdUnit.frameConfig.dimensions.width + 100,
          height: focusedAdUnit.frameConfig.dimensions.height + 100,
          scaleX: 1,
          scaleY: 1,
        }
      }
    }

    // Bulk mode - calculate stage to fit all adUnits
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity

    adUnits.forEach((adUnit) => {
      const pos = adUnit.frameConfig.position
      const dim = adUnit.frameConfig.dimensions

      minX = Math.min(minX, pos.x)
      minY = Math.min(minY, pos.y)
      maxX = Math.max(maxX, pos.x + dim.width)
      maxY = Math.max(maxY, pos.y + dim.height)
    })

    const padding = 50
    return {
      width: Math.max(1200, maxX - minX + padding * 2),
      height: Math.max(800, maxY - minY + padding * 2),
      scaleX: 1,
      scaleY: 1,
    }
  })

  // Get position for each ad unit within the single stage
  const getAdUnitPosition = (adUnit: AdUnit, isFocused: boolean) => {
    if (isFocused) {
      // Center the focused ad unit
      return {
        x: 50,
        y: 50,
      }
    }

    // Use original position in bulk mode
    return adUnit.frameConfig.position
  }

  const stageHandlers = {
    onWheel: (e: any) => {
      // Zoom functionality for single stage
      e.evt.preventDefault()
      const stage = e.target.getStage()
      const oldScale = stage.scaleX()
      const pointer = stage.getPointerPosition()

      const mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
      }

      const newScale = e.evt.deltaY > 0 ? oldScale * 0.9 : oldScale * 1.1
      const limitedScale = Math.max(0.1, Math.min(5, newScale))

      stage.scale({ x: limitedScale, y: limitedScale })

      const newPos = {
        x: pointer.x - mousePointTo.x * limitedScale,
        y: pointer.y - mousePointTo.y * limitedScale,
      }

      stage.position(newPos)
      stage.batchDraw()
    },
  }

  return {
    // State from AdUnitRenderer
    viewMode: adUnitRenderer.viewMode,
    currentAdUnitId: adUnitRenderer.currentAdUnitId,

    // Stage configuration
    stageConfig,
    stageHandlers,
    getAdUnitPosition,

    // Rendering data from AdUnitRenderer
    adUnitsToRender: adUnitRenderer.adUnitsToRender,
    getElementsForAdUnit: adUnitRenderer.getElementsForAdUnit,

    // Actions (delegated through AdUnitRenderer)
    switchToBulkMode: () => {
      // This would need to be exposed through AdUnitRenderer or CanvasManager
      // For now, we'll handle this differently in the component
    },
    switchToFocusMode: (adUnitId: string) => {
      // This would need to be exposed through AdUnitRenderer or CanvasManager
    },
  }
}
