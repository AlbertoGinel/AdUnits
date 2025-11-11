import { computed } from 'vue'
import { useCanvasStore } from '@/stores/canvas'
import { storeToRefs } from 'pinia'

export function useDynamicEditText() {
  const canvasStore = useCanvasStore()
  const { layers, adUnits, currentView, currentAdUnitId } = storeToRefs(canvasStore)

  // Helper to create dynamic computed value for any layer
  const createLayerValue = (layerName: string) => {
    return computed({
      get: () => {
        if (currentView.value === 'bulkMode') {
          return layers.value[layerName]?.defaultValue || ''
        } else {
          const adUnitId = currentAdUnitId.value
          const elementId = `${adUnitId}-${layerName}`
          if (adUnitId && adUnits.value[adUnitId]?.elements[elementId]) {
            return adUnits.value[adUnitId].elements[elementId].text || ''
          }
          return ''
        }
      },
      set: (value) => {
        if (currentView.value === 'bulkMode') {
          if (layers.value[layerName]) {
            layers.value[layerName].defaultValue = value
          }
        } else {
          // Focus mode: update specific element and auto-lock
          const adUnitId = currentAdUnitId.value
          const elementId = `${adUnitId}-${layerName}`

          if (adUnitId && adUnits.value[adUnitId]?.elements[elementId]) {
            const element = adUnits.value[adUnitId].elements[elementId]
            const currentText = element.text || ''

            // Only update and lock if the value is actually different
            if (currentText !== value) {
              element.text = value

              // 🔒 Auto-lock the element when changed in focus mode
              canvasStore.lock(adUnitId, elementId, true)
              console.log(`🔒 Auto-locked "${layerName}" after edit: ${value}`)
            }
          }
        }
      },
    })
  }

  // Create values for all text layers
  const headlineValue = createLayerValue('headline')
  const subheadValue = createLayerValue('subhead')
  const ctaValue = createLayerValue('cta')
  const disclaimerValue = createLayerValue('disclaimer')

  return {
    headlineValue,
    subheadValue,
    ctaValue,
    disclaimerValue,
    lockedElementsByTag: canvasStore.lockedElementsByTag,
    lockedTextAdUnits: canvasStore.lockedTextAdUnits,
    currentView,
    currentAdUnitId,
  }
}
