import { ImageLoader } from './imageLoader'
import { useCanvasStore } from '@/stores/canvas'
import type { CanvasElement } from '@/stores/canvas'

export class CanvasInitializer {
  static async initialize(): Promise<void> {
    console.log('🎯 Initializing canvas...')

    const canvasStore = useCanvasStore()

    // ✅ Load initial template and wait for it to complete
    await canvasStore.loadInitialTemplate()

    console.log(`📋 Template loaded with ${canvasStore.adUnits.length} ad units`)

    // Extract all image URLs from ad units
    const allElements = canvasStore.adUnits.flatMap((adUnit) => adUnit.elements)
    const imageUrls = this.extractImageUrls(allElements)
    console.log('🖼️ Found image URLs:', imageUrls)

    // Preload all images
    if (imageUrls.length > 0) {
      console.log(`🚀 Starting preload of ${imageUrls.length} images...`)
      await ImageLoader.preloadImages(imageUrls)
      console.log('🎯 All images preloaded successfully')
    } else {
      console.log('⚠️ No image URLs found to preload')
    }

    console.log('✅ Canvas initialization complete')
  }

  private static extractImageUrls(elements: CanvasElement[]): string[] {
    const imageElements = elements.filter((element) => element.type === 'image')
    console.log(
      `🔍 Found ${imageElements.length} image elements:`,
      imageElements.map((el) => ({ id: el.id, image: el.image })),
    )

    const urls = imageElements
      .filter((element) => element.image)
      .map((element) => element.image!)
      .filter((url, index, arr) => arr.indexOf(url) === index) // Remove duplicates

    console.log('📋 Extracted unique URLs:', urls)
    return urls
  }

  static getLoadedImage(url: string): HTMLImageElement | null {
    return ImageLoader.getLoadedImage(url)
  }
}
