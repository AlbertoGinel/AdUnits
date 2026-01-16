/**
 * Fallback Image Generator (Singleton)
 * Creates placeholder images for missing/failed image loads
 */

let sharedFallbackImage: HTMLImageElement | null = null

export function useFallbackImage() {
  /**
   * Get or create fallback placeholder image
   * Returns cached singleton instance
   */
  const getFallbackImage = (): HTMLImageElement => {
    if (sharedFallbackImage) return sharedFallbackImage

    const img = new Image()
    img.width = 100
    img.height = 100

    // Create simple gray placeholder
    const canvas = document.createElement('canvas')
    canvas.width = 100
    canvas.height = 100
    const ctx = canvas.getContext('2d')

    if (ctx) {
      ctx.fillStyle = '#E0E0E0'
      ctx.fillRect(0, 0, 100, 100)
      ctx.strokeStyle = '#999999'
      ctx.lineWidth = 2
      ctx.strokeRect(0, 0, 100, 100)
    }

    img.src = canvas.toDataURL()
    sharedFallbackImage = img

    return img
  }

  /**
   * Clear cached fallback (for cleanup/testing)
   */
  const clearFallback = (): void => {
    sharedFallbackImage = null
  }

  return {
    getFallbackImage,
    clearFallback,
  }
}
