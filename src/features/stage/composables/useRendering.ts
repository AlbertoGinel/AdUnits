import { useAdUnitStore } from '@/data/stores/useAdUnitStore'
import { useImageStore } from '@/data/stores/useImageStore'
import { ref } from 'vue'
import type { AdUnitElement } from '@/types/adUnitElementTypes'
import {
  isTextElement,
  isImageElement,
  isRectElement,
  hasVisibility,
} from '@/types/adUnitElementTypes'

export interface RenderableElement {
  id: string
  element: AdUnitElement
  config: Record<string, unknown>
  visible: boolean
  isLoaded?: boolean // For image elements: is HTMLImageElement loaded?
  hasImageUrl?: boolean // For image elements: is URL available from async system?
}

/**
 * Unified rendering composable
 * Transforms AdUnit elements → Konva-ready configs
 */
export function useRendering() {
  const adUnitStore = useAdUnitStore()
  const imageStore = useImageStore()

  // Track loaded images to avoid re-rendering on every update
  const loadedImages = ref<Map<string, HTMLImageElement>>(new Map())

  const HIDE_DURING_CROP = ['logo', 'headline', 'subhead', 'cta', 'disclaimer', 'cta-background']
  const RENDER_ORDER = [
    'background',
    'image',
    'disclaimerBG',
    'disclaimer',
    'cta-background',
    'cta',
    'logo',
    'headline',
    'subhead',
  ]

  // Async image loading for Konva
  const getImageForRendering = async (imageID: string): Promise<HTMLImageElement | null> => {
    try {
      // Check if already loaded
      if (loadedImages.value.has(imageID)) {
        return loadedImages.value.get(imageID)!
      }

      // Get image URL from store
      const image = imageStore.getImage(imageID)
      if (!image?.url) {
        console.warn(`No URL found for image: ${imageID}`)
        return null
      }

      // Load image asynchronously
      const imageElement = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = image.url
      })

      loadedImages.value.set(imageID, imageElement)
      return imageElement
    } catch (error) {
      console.warn(`Failed to load image for rendering: ${imageID}`, error)
      return null
    }
  }

  // Create fallback rect config for missing images
  const createImageFallback = (element: AdUnitElement): Record<string, unknown> => {
    return {
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height,
      fill: '#f0f0f0', // Light gray skeleton color
      stroke: '#e0e0e0',
      strokeWidth: 1,
      cornerRadius: 4,
      name: `${element.type}-fallback`,
    }
  }

  const isCropping = false // TODO: Connect to crop mode state

  // Build Konva config - now async for images
  const buildKonvaConfig = (element: AdUnitElement): Record<string, unknown> => {
    // Base config - all elements have these
    const config: Record<string, unknown> = {
      x: element.x,
      y: element.y,
      name: element.type,
    }

    // Text elements - spread all text properties
    if (isTextElement(element)) {
      return {
        ...config,
        text: element.text,
        fontSize: element.fontSize,
        fontFamily: element.fontFamily,
        fontStyle: element.fontStyle,
        fill: element.fill,
        align: element.align,
        verticalAlign: element.verticalAlign,
        wrap: element.wrap,
        width: element.width,
        height: element.height,
      }
    }

    // Rect elements - spread rect properties
    if (isRectElement(element)) {
      const rectConfig: Record<string, unknown> = {
        ...config,
        width: element.width,
        height: element.height,
        cornerRadius: element.cornerRadius,
        stroke: element.strokeColor,
        strokeWidth: element.strokeWidth,
      }

      // Add gradient OR fill (mutually exclusive - discriminated union)
      if ('fillLinearGradientStartPoint' in element) {
        rectConfig.fillLinearGradientStartPoint = element.fillLinearGradientStartPoint
        rectConfig.fillLinearGradientEndPoint = element.fillLinearGradientEndPoint
        rectConfig.fillLinearGradientColorStops = element.fillLinearGradientColorStops
      } else {
        rectConfig.fill = element.fill
      }

      return rectConfig
    }

    // Image elements - async loading with fallback
    if (isImageElement(element)) {
      // Check if image is already loaded
      const cachedImage = loadedImages.value.get(element.imageID)

      if (!cachedImage) {
        // Return fallback rect while image loads
        return createImageFallback(element)
      }

      // Image is loaded, create proper image config
      const loadedImage = cachedImage

      // Special case: Logo needs centering
      if (element.type === 'logo' && loadedImage) {
        const naturalWidth = loadedImage.naturalWidth
        const naturalHeight = loadedImage.naturalHeight

        if (naturalWidth && naturalHeight) {
          const aspectRatio = naturalWidth / naturalHeight
          const maxAspectRatio = element.width / element.height

          const actualWidth =
            aspectRatio > maxAspectRatio ? element.width : element.height * aspectRatio
          const actualHeight =
            aspectRatio > maxAspectRatio ? element.width / aspectRatio : element.height

          return {
            ...config,
            x: element.x - actualWidth / 2,
            y: element.y - actualHeight / 2,
            width: actualWidth,
            height: actualHeight,
            image: loadedImage,
          }
        }
      }

      // Standard image config
      const imageConfig: Record<string, unknown> = {
        ...config,
        width: element.width,
        height: element.height,
        image: loadedImage,
      }

      // Add crop if exists (only for main image)
      if (element.type === 'image' && 'cropData' in element && element.cropData) {
        imageConfig.cropX = element.cropData.x
        imageConfig.cropY = element.cropData.y
        imageConfig.cropWidth = element.cropData.width
        imageConfig.cropHeight = element.cropData.height
      }

      return imageConfig
    }

    return config
  }

  // Check visibility
  const isElementVisible = (element: AdUnitElement): boolean => {
    const baseVisible = hasVisibility(element) ? element.visibility !== false : true
    const hiddenDuringCrop = isCropping && HIDE_DURING_CROP.includes(element.type)
    return baseVisible && !hiddenDuringCrop
  }

  // Get renderable elements for an ad unit
  const getRenderableElements = (adUnitID: string): RenderableElement[] => {
    const elements = adUnitStore.getAdUnitElements(adUnitID)

    return elements
      .map((element) => ({
        id: element.type,
        element,
        config: buildKonvaConfig(element),
        visible: isElementVisible(element),
        isLoaded: isImageElement(element) ? loadedImages.value.has(element.imageID) : true,
        hasImageUrl: isImageElement(element) ? !!imageStore.getImage(element.imageID)?.url : true,
      }))
      .sort((a, b) => {
        const indexA = RENDER_ORDER.indexOf(a.id)
        const indexB = RENDER_ORDER.indexOf(b.id)
        if (indexA === -1 && indexB === -1) return 0
        if (indexA === -1) return 1
        if (indexB === -1) return -1
        return indexA - indexB
      })
  }

  // Preload images for an ad unit (call this when ad unit becomes visible)
  const preloadImagesForAdUnit = async (adUnitID: string): Promise<void> => {
    const elements = adUnitStore.getAdUnitElements(adUnitID)
    const imageElements = elements.filter(isImageElement)

    // Load all images in parallel
    const loadPromises = imageElements.map((element) => getImageForRendering(element.imageID))

    try {
      await Promise.all(loadPromises)
      console.log(`✅ Preloaded ${imageElements.length} images for ad unit ${adUnitID}`)
    } catch (error) {
      console.warn(`⚠️ Some images failed to preload for ad unit ${adUnitID}`, error)
    }
  }

  return {
    getRenderableElements,
    preloadImagesForAdUnit,
    getImageForRendering, // For manual image loading if needed
  }
}
