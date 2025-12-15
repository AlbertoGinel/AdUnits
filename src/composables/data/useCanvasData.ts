import { useCanvasStore } from '@/stores/canvas'
import { useImageStore } from '@/stores/useImageStore'
import type { AdUnit, CanvasElement, LayerDefinition } from '@/stores/canvas'
import type { CreativeContentData } from '@/types/creative'

// Re-export types for other composables (maintains clean architecture)
export type { AdUnit, CanvasElement, LayerDefinition }

/**
 * Calculate auto-crop for image fitting
 * Pure function with no external dependencies
 */
const calculateAutoCrop = (
  imageWidth: number,
  imageHeight: number,
  elementWidth: number,
  elementHeight: number,
): { x: number; y: number; width: number; height: number } | null => {
  // Validate inputs
  if (imageWidth <= 0 || imageHeight <= 0 || elementWidth <= 0 || elementHeight <= 0) {
    return null
  }
  if (isNaN(imageWidth) || isNaN(imageHeight) || isNaN(elementWidth) || isNaN(elementHeight)) {
    return null
  }

  // Calculate aspect ratios
  const displayRatio = elementWidth / elementHeight
  const imageRatio = imageWidth / imageHeight

  let cropWidth: number, cropHeight: number, cropX: number, cropY: number

  if (imageRatio > displayRatio) {
    // Image is wider than display - crop left/right
    cropHeight = imageHeight
    cropWidth = imageHeight * displayRatio
    cropX = (imageWidth - cropWidth) / 2
    cropY = 0
  } else {
    // Image is taller than display - crop top/bottom
    cropWidth = imageWidth
    cropHeight = imageWidth / displayRatio
    cropX = 0
    cropY = (imageHeight - cropHeight) / 2
  }

  return {
    x: Math.round(cropX),
    y: Math.round(cropY),
    width: Math.round(cropWidth),
    height: Math.round(cropHeight),
  }
}

/**
 * Pure data CRUD operations - Direct interface to canvas store
 * This is the only composable that should directly access the canvas store
 */
export function useCanvasData() {
  const store = useCanvasStore()

  return {
    // ========== GET OPERATIONS ==========
    getAdUnits: () => ({ ...store.adUnits }),
    getAdUnit: (id: string) => (store.adUnits[id] ? { ...store.adUnits[id] } : null),
    getLayers: () => ({ ...store.layers }),
    getLayer: (layerId: string) => (store.layers[layerId] ? { ...store.layers[layerId] } : null),
    getStage: () => ({ ...store.stage }),
    getCurrentView: () => store.currentView,
    getCurrentAdUnitId: () => store.currentAdUnitId,
    getCreativeId: () => store.creative_id,
    getIsInitialized: () => store.isInitialized,

    // Element getters, all the elements
    getElement: (adUnitId: string, elementId: string) => {
      const adUnit = store.adUnits[adUnitId]
      return adUnit?.elements[elementId] ? { ...adUnit.elements[elementId] } : null
    },
    getAdUnitElements: (adUnitId: string): CanvasElement[] => {
      const adUnit = store.adUnits[adUnitId]
      return adUnit ? Object.values(adUnit.elements) : []
    },

    // Generic helper functions for business logic
    getElementsByTag: (adUnitId: string, tag: string): CanvasElement[] => {
      const adUnit = store.adUnits[adUnitId]
      if (!adUnit) return []
      return Object.values(adUnit.elements).filter((element) => element.tag === tag)
    },

    // Get all ad unit names that have locked elements with specific tag
    getAdUnitNamesWithLockedTag: (tag: string): string[] => {
      const result: string[] = []
      Object.values(store.adUnits).forEach((adUnit) => {
        const hasLockedElement = Object.values(adUnit.elements).some(
          (element) => element.tag === tag && element.locked,
        )
        if (hasLockedElement) {
          result.push(adUnit.title)
        }
      })
      return result
    },

    // Get all ad unit names that have visibility locked elements with specific tag
    getAdUnitNamesWithVisibilityLockedTag: (tag: string): string[] => {
      const result: string[] = []
      Object.values(store.adUnits).forEach((adUnit) => {
        const hasVisibilityLockedElement = Object.values(adUnit.elements).some(
          (element) => element.tag === tag && element.visibilityLock === true,
        )
        if (hasVisibilityLockedElement) {
          result.push(adUnit.title)
        }
      })
      return result
    },

    // ========== SET OPERATIONS ==========
    setAdUnits: (adUnits: Record<string, AdUnit>) => {
      store.adUnits = adUnits
    },
    setAdUnitsModels: (modelAdUnits: Record<string, AdUnit>) => {
      // Set structure only (from framesModel.json)
      store.adUnits = modelAdUnits
    },
    setAdUnitsContent: (
      contentAdUnits: Record<string, { elements: Record<string, Record<string, unknown>> }>,
    ) => {
      // Merge content into existing ad units (from API)
      Object.entries(contentAdUnits).forEach(([adUnitId, content]) => {
        const adUnit = store.adUnits[adUnitId]
        if (!adUnit) return

        Object.entries(content.elements).forEach(([elementId, elementContent]) => {
          if (adUnit.elements[elementId]) {
            Object.assign(adUnit.elements[elementId], elementContent)
          }
        })
      })
    },
    setAdUnit: (id: string, adUnit: AdUnit) => {
      store.adUnits[id] = adUnit
    },
    setLayers: (layers: Record<string, LayerDefinition>) => {
      store.layers = layers
    },
    setLayer: (layerId: string, layer: LayerDefinition) => {
      store.layers[layerId] = layer
    },
    setStage: (stage: { width: number; height: number }) => {
      store.stage = stage
    },
    setCurrentView: (view: 'bulkMode' | 'focusMode') => {
      store.currentView = view
    },
    setCurrentAdUnitId: (id: string | null) => {
      store.currentAdUnitId = id
    },
    setCreativeId: (id: string | null) => {
      store.creative_id = id
    },
    setIsInitialized: (initialized: boolean) => {
      store.isInitialized = initialized
    },

    // ========== UPDATE OPERATIONS ==========
    updateAdUnit: (id: string, updates: Partial<AdUnit>) => {
      if (store.adUnits[id]) {
        store.adUnits[id] = { ...store.adUnits[id], ...updates }
      }
    },
    updateElement: (adUnitId: string, elementId: string, updates: Partial<CanvasElement>) => {
      const adUnit = store.adUnits[adUnitId]
      if (adUnit?.elements[elementId]) {
        const element = adUnit.elements[elementId]

        // Auto-provide crop when changing image
        if (updates.image !== undefined && element.type === 'image' && updates.crop === undefined) {
          // Handle null case - if image is being set to null, no crop needed
          if (updates.image === null) {
            // Allow null image update without crop
            adUnit.elements[elementId] = { ...adUnit.elements[elementId], ...updates }
            return
          }

          const imageStore = useImageStore()
          const imageData = imageStore.images[updates.image] // Now TypeScript knows it's not null

          if (imageData?.dimensions && element.width && element.height) {
            const crop = calculateAutoCrop(
              imageData.dimensions.naturalWidth,
              imageData.dimensions.naturalHeight,
              element.width,
              element.height,
            )

            if (crop) {
              updates.crop = crop
            } else {
              console.error('❌ Image update rejected: Could not calculate crop')
              return
            }
          } else {
            console.error('❌ Image update rejected: Missing image dimensions or element size')
            return
          }
        }

        adUnit.elements[elementId] = { ...adUnit.elements[elementId], ...updates }
      }
    },
    updateLayer: (layerId: string, updates: Partial<LayerDefinition>) => {
      if (store.layers[layerId]) {
        store.layers[layerId] = { ...store.layers[layerId], ...updates }

        // Auto-cascade: When layer properties change, update matching elements
        Object.keys(store.adUnits).forEach((adUnitId) => {
          const adUnit = store.adUnits[adUnitId]
          if (adUnit) {
            Object.entries(adUnit.elements).forEach(([elementId, element]) => {
              if (element.tag === layerId) {
                const elementUpdates: Partial<CanvasElement> = {}

                // Text cascade: Update unlocked elements when defaultValue changes
                if (updates.defaultValue !== undefined && !element.locked) {
                  elementUpdates.text = updates.defaultValue
                }

                // Image cascade: Update unlocked image elements when defaultValue changes
                if (
                  updates.defaultValue !== undefined &&
                  element.type === 'image' &&
                  !element.locked
                ) {
                  const newImageId = updates.defaultValue
                  elementUpdates.image = newImageId

                  // Auto-crop: Calculate aspect-ratio-preserving crop
                  if (element.width && element.height && newImageId) {
                    const imageStore = useImageStore()
                    const imageData = imageStore.images[newImageId]

                    if (imageData?.dimensions) {
                      const crop = calculateAutoCrop(
                        imageData.dimensions.naturalWidth,
                        imageData.dimensions.naturalHeight,
                        element.width,
                        element.height,
                      )

                      if (crop) {
                        elementUpdates.crop = crop
                      }
                    }
                  }
                }

                // Visibility cascade: Update disclaimer elements when visibility changes
                if (
                  updates.visibility !== undefined &&
                  layerId === 'disclaimer' &&
                  !element.visibilityLock
                ) {
                  elementUpdates.visibility = updates.visibility
                }

                // Visibility cascade: Update disclaimerBG elements when visibility changes
                if (
                  updates.visibility !== undefined &&
                  layerId === 'disclaimerBG' &&
                  !element.visibilityLock
                ) {
                  elementUpdates.visibility = updates.visibility
                }

                // Apply updates if any exist
                if (Object.keys(elementUpdates).length > 0) {
                  adUnit.elements[elementId] = { ...element, ...elementUpdates }
                }
              }
            })
          }
        })
      }
    },

    // Free all elements with matching tag (unlock them)
    freeLayer: (layerId: string) => {
      Object.keys(store.adUnits).forEach((adUnitId) => {
        const adUnit = store.adUnits[adUnitId]
        if (adUnit) {
          Object.entries(adUnit.elements).forEach(([elementId, element]) => {
            // Unlock all elements that match the layer tag
            if (element.tag === layerId && element.locked) {
              adUnit.elements[elementId] = {
                ...element,
                locked: false,
              }
            }
          })
        }
      })
    },

    // ========== DELETE OPERATIONS ==========
    deleteAdUnit: (id: string) => {
      delete store.adUnits[id]
    },
    deleteElement: (adUnitId: string, elementId: string) => {
      const adUnit = store.adUnits[adUnitId]
      if (adUnit) {
        delete adUnit.elements[elementId]
      }
    },
    deleteLayer: (layerId: string) => {
      delete store.layers[layerId]
    },

    // ========== BULK OPERATIONS ==========
    updateMultipleElements: (
      updates: Array<{ adUnitId: string; elementId: string; updates: Partial<CanvasElement> }>,
    ) => {
      updates.forEach(({ adUnitId, elementId, updates }) => {
        const adUnit = store.adUnits[adUnitId]
        if (adUnit?.elements[elementId]) {
          adUnit.elements[elementId] = { ...adUnit.elements[elementId], ...updates }
        }
      })
    },

    // ========== CONVERSION OPERATIONS ==========
    /**
     * Convert Pinia store data to CreativeContentData for API
     */
    exportToCreativeContentData: (): CreativeContentData | null => {
      if (!store.creative_id) {
        console.warn('Cannot export: No creative_id set')
        return null
      }

      const imageStore = useImageStore()

      // Convert to plain objects to avoid Proxy cloning issues in IndexedDB
      const plainData = {
        creative_id: store.creative_id,
        adUnits: Object.fromEntries(
          Object.entries(store.adUnits).map(([key, adUnit]) => [
            key,
            {
              elements: Object.fromEntries(
                Object.entries(adUnit.elements).map(([elementKey, element]) => [
                  elementKey,
                  {
                    ...element,
                    // Only include relevant fields for CreativeContentData
                  },
                ]),
              ),
            },
          ]),
        ),
        layers: { ...store.layers },
        images: imageStore.getAllImages.map((asset) => ({
          id: asset.id || asset.url, // Fallback to URL if no ID
          type: asset.type || 'image',
          name: asset.name || 'Unnamed',
          altText: asset.altText || `${asset.name || 'Unnamed'} altText`,
        })),
      }

      // Use JSON parse/stringify to ensure fully plain objects (removes any remaining Proxy references)
      return JSON.parse(JSON.stringify(plainData))
    },

    /**
     * Import CreativeContentData to Pinia stores
     */
    importToCreativeContentData: (
      stage: { width: number; height: number },
      modelAdUnits: Record<string, AdUnit>,
      creativeData: CreativeContentData,
    ) => {
      console.log('💾 Importing CreativeContentData to stores...')

      // 1. Set creative ID
      store.creative_id = creativeData.creative_id

      // 2. Set stage dimensions
      store.stage = stage
      console.log(`📏 Stage: ${stage.width}x${stage.height}`)

      // 3. Set ad units structure (models only)
      store.adUnits = modelAdUnits

      // 4. Apply creative content to ad units
      Object.entries(creativeData.adUnits).forEach(([adUnitId, content]) => {
        const adUnit = store.adUnits[adUnitId]
        if (!adUnit) return

        Object.entries(content.elements).forEach(([elementId, elementContent]) => {
          if (adUnit.elements[elementId]) {
            Object.assign(adUnit.elements[elementId], elementContent)
          }
        })
      })

      // 5. Set layers
      store.layers = creativeData.layers
      console.log(`📚 Layers: ${Object.keys(creativeData.layers).length}`)

      console.log(`💾 Stores populated from CreativeContentData`)
    },

    // ========== RESET OPERATIONS ==========
    resetCanvas: () => {
      store.adUnits = {}
      store.layers = {}
      store.currentView = 'bulkMode'
      store.currentAdUnitId = null
      store.creative_id = null
      store.isInitialized = false
    },

    // ========== UTILITIES ==========
    calculateAutoCrop,
  }
}
