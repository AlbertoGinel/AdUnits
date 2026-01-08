import { useCanvasData } from '@/composables/data/useCanvasData'
import { useLayers } from '@/composables/data/useLayers'
import { useImageManager } from '@/composables/setupImages/useImageManager'

/**
 * Shared override logic for both text fields and assets
 * Handles the cascade override functionality across the application
 */
export function useOverrideLogic() {
  const canvasData = useCanvasData()
  const { updateLayer } = useLayers()
  const imageManager = useImageManager()

  /**
   * Generic override function for any field type
   * @param fieldName - The name of the field (e.g., 'headline', 'image', 'logo')
   * @param currentValue - The current value to apply to all locked elements
   * @param fieldType - Type of field for special handling
   */
  function executeOverride(
    fieldName: string,
    currentValue: string,
    fieldType: 'text' | 'image' = 'text',
  ) {
    console.log(`🔓 Override all locked ${fieldType} for field: ${fieldName}`)
    console.log(`📝 New value: ${currentValue}`)

    if (!currentValue) {
      console.warn(`No value to override for ${fieldName}`)
      return
    }

    // Step 1: Free all locked elements for this field
    canvasData.freeLayer(fieldName)
    console.log(`✅ Freed layer: ${fieldName}`)

    // Step 2: Update layer (triggers auto-cascade in useCanvasData)
    updateLayer(fieldName, { defaultValue: currentValue })

    // Step 3: Special handling for images
    if (fieldType === 'image' && fieldName === 'image') {
      const allAdUnits = canvasData.getAdUnits()

      Object.keys(allAdUnits).forEach((adUnitId) => {
        const element = canvasData.getElement(adUnitId, fieldName)
        if (element?.type === 'image') {
          // Get actual image dimensions from image manager
          const imageElement = imageManager.getImageOptimized(currentValue)

          if (imageElement) {
            const crop = canvasData.calculateAutoCrop(
              imageElement.naturalWidth,
              imageElement.naturalHeight,
              element.width || 0,
              element.height || 0,
            )

            canvasData.updateElement(adUnitId, fieldName, {
              image: currentValue,
              crop: crop || undefined,
              locked: false,
            })
          }
        }
      })
    }

    console.log(`🎯 Override complete for ${fieldName}`)
  }

  return {
    executeOverride,
  }
}
