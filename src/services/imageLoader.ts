export class ImageLoader {
  private static loadedImages: Record<string, HTMLImageElement> = {}
  private static loadingPromises: Record<string, Promise<HTMLImageElement>> = {}

  static async loadImage(url: string): Promise<HTMLImageElement> {
    // Return cached image if already loaded
    if (this.loadedImages[url]) {
      console.log(`📋 Using cached image: ${url}`)
      return this.loadedImages[url]
    }

    // Return existing promise if currently loading
    if (this.loadingPromises[url]) {
      console.log(`⏳ Image already loading: ${url}`)
      return this.loadingPromises[url]
    }

    // Start loading new image
    console.log(`🖼️ Loading image: ${url}`)
    const loadingPromise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        this.loadedImages[url] = img
        delete this.loadingPromises[url]
        console.log(`✅ Image loaded: ${url}`)
        resolve(img)
      }
      img.onerror = (error) => {
        delete this.loadingPromises[url]
        console.error(`❌ Failed to load image: ${url}`, error)
        reject(error)
      }
      img.src = url
    })

    this.loadingPromises[url] = loadingPromise
    return loadingPromise
  }

  static getLoadedImage(url: string): HTMLImageElement | null {
    return this.loadedImages[url] || null
  }

  static async preloadImages(urls: string[]): Promise<void> {
    console.log(`🚀 Preloading ${urls.length} images...`)
    const promises = urls.map((url) =>
      this.loadImage(url).catch((error) => {
        console.warn(`⚠️ Failed to preload ${url}:`, error)
        return null
      }),
    )

    await Promise.all(promises)
    console.log(`✅ Preloading complete`)
  }

  static getAllLoadedImages(): Record<string, HTMLImageElement> {
    return { ...this.loadedImages }
  }
}
