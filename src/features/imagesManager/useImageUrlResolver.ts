import type { CreativeBundle } from '@/types/APITypes'
import type { ImageMetadata } from '@/types/creativeTypes'

/**
 * Image URL Resolver
 * Matches API assets with image metadata and prepares URLs for caching
 * Handles the bridge between API format and cache format
 */
export function useImageUrlResolver() {
  /**
   * Resolve assets and metadata into cacheable images
   * Matches asset URLs to image metadata by ID
   */
  const resolveImagesToCache = (
    bundle: CreativeBundle,
  ): Array<{ imageID: string; url: string }> => {
    const { assets, creativeData } = bundle

    // Create a map of asset ID to URL for fast lookup
    const assetUrlMap = new Map<string, string>()
    assets.forEach((asset) => {
      if (!asset.error && asset.path) {
        assetUrlMap.set(asset.id, asset.path)
      }
    })

    // Match metadata with asset URLs
    const imagesToCache: Array<{ imageID: string; url: string }> = []

    creativeData.images.forEach((metadata: ImageMetadata) => {
      const url = assetUrlMap.get(metadata.imageID)

      if (url) {
        imagesToCache.push({
          imageID: metadata.imageID,
          url,
        })
      } else {
        console.warn(`⚠️ No asset URL found for image: ${metadata.imageID}`)
      }
    })

    console.log(
      `🔗 Resolved ${imagesToCache.length}/${creativeData.images.length} images for caching`,
    )

    return imagesToCache
  }

  /**
   * Validate asset response
   */
  const validateAsset = (asset: CreativeBundle['assets'][0]): boolean => {
    if (asset.error) {
      console.error(`❌ Asset has error: ${asset.id} - ${asset.error}`)
      return false
    }
    if (!asset.path) {
      console.error(`❌ Asset missing path: ${asset.id}`)
      return false
    }
    return true
  }

  /**
   * Get valid assets from bundle
   */
  const getValidAssets = (bundle: CreativeBundle) => {
    return bundle.assets.filter(validateAsset)
  }

  return {
    resolveImagesToCache,
    validateAsset,
    getValidAssets,
  }
}
