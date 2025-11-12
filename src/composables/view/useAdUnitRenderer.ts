// composables/useAdUnitRenderer.ts
import { useCanvasManager } from './useCanvasManager'
import { useElementRenderer } from './useElementRenderer'
import { computed } from 'vue'
import type { AdUnit } from '@/stores/canvas'

export function useAdUnitRenderer() {
  const canvasManager = useCanvasManager()
  const { renderElement } = useElementRenderer()

  const adUnitsToRender = computed(() => {
    return Object.entries(canvasManager.visibleAdUnits.value).map(([adUnitId, adUnit]) => {
      const isFocused = canvasManager.viewMode.value === 'focusMode'

      const handleAdUnitClick = () => {
        if (!isFocused) {
          canvasManager.switchToFocusMode(adUnitId)
        }
      }

      return {
        adUnit,
        isFocused,
        frameConfig: adUnit.frameConfig,
        handleClick: handleAdUnitClick,
      }
    })
  })

  const getElementsForAdUnit = (adUnit: AdUnit, isFocusMode: boolean) => {
    return Object.entries(adUnit.elements).map(([elementId, element]) => {
      return renderElement(element, elementId, isFocusMode)
    })
  }

  return {
    adUnitsToRender,
    getElementsForAdUnit,
    viewMode: canvasManager.viewMode,
    currentAdUnitId: canvasManager.currentAdUnitId,
    switchToBulkMode: canvasManager.switchToBulkMode,
  }
}
