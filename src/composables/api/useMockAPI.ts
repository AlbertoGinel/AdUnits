// composables/setupFrames/useMockAPI.ts
/**
 * Mock API for development - simulates backend endpoints
 * Easy to swap with real API later
 */
export function useMockAPI() {
  /**
   * GET /api/v1/assets/creative/{id}
   * Retrieve all assets belonging to a creative
   */
  const fetchAssets = async (creativeId: string) => {
    try {
      console.log(`📡 Mock API: Fetching assets for creative ${creativeId}`)
      await new Promise((resolve) => setTimeout(resolve, Math.floor(Math.random() * 1600) + 400))
      const module = await import('../setupFrames/serverAssets.json')
      return module.default
    } catch (error) {
      console.error('❌ Failed to fetch assets:', error)
      throw error
    }
  }

  /**
   * GET /api/v1/creative_data/{creative_id}
   * Retrieve creative data (adUnits, layers, image metadata)
   */
  const fetchCreativeData = async (creativeId: string) => {
    try {
      console.log(`📡 Mock API: Fetching creative data for ${creativeId}`)
      await new Promise((resolve) => setTimeout(resolve, Math.floor(Math.random() * 1600) + 400))
      const module = await import('../setupFrames/serverCreatives.json')
      return module.default
    } catch (error) {
      console.error('❌ Failed to fetch creative data:', error)
      throw error
    }
  }

  /**
   * POST /api/v1/assets/{id}
   * Upload and create an asset for a creative
   * Content-Type: multipart/form-data
   *
   * @param creativeId - The creative ID to attach the asset to
   * @param file - The file to upload
   * @returns Upload response with path
   */
  const uploadAsset = async (
    creativeId: string,
    file: File,
  ): Promise<{
    status: number
    message: string
    path: string
  }> => {
    try {
      console.log(`📤 Mock API: Uploading asset for creative ${creativeId}`)
      console.log(`   File: ${file.name} (${file.size} bytes)`)

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, Math.floor(Math.random() * 1600) + 400))

      // Simulate successful upload
      // In real API, this would return the actual server path
      const mockPath = `/uploads/${creativeId}/${Date.now()}-${file.name}`

      console.log(`✅ Mock API: Upload successful - ${mockPath}`)

      return {
        status: 200,
        message: 'Asset uploaded successfully',
        path: mockPath,
      }
    } catch (error) {
      console.error('❌ Failed to upload asset:', error)
      return {
        status: 500,
        message: error instanceof Error ? error.message : 'Upload failed',
        path: '',
      }
    }
  }

  return {
    fetchAssets,
    fetchCreativeData,
    uploadAsset,
  }
}
