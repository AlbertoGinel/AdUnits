import { defineStore } from 'pinia'
import type { ImageState, ImageAsset } from '../../types/mainTypes'

// DRY: Single source of truth for empty uploadTemp
const createEmptyUploadTemp = (): ImageAsset => ({
  imageID: '',
  type: 'image',
  name: '',
  altText: '',
  url: '',
})

export const useImageStore = defineStore('images', {
  // State
  state: (): ImageState => ({
    images: {},
    uploadTemp: createEmptyUploadTemp(),
  }),

  // Getters
  getters: {
    getImage: (state) => {
      return (id: string): ImageAsset | undefined => {
        return state.images[id]
      }
    },

    getAllImages: (state) => (): Record<string, ImageAsset> => {
      return { ...state.images }
    },

    getImageIds: (state) => (): string[] => {
      return Object.keys(state.images)
    },

    getImagesCount: (state) => (): number => {
      return Object.keys(state.images).length
    },

    hasImages: (state) => (): boolean => {
      return Object.keys(state.images).length > 0
    },

    getImagesByType: (state) => {
      return (type: 'image' | 'logo'): Record<string, ImageAsset> => {
        const filteredImages: Record<string, ImageAsset> = {}
        Object.entries(state.images).forEach(([id, image]) => {
          if (image.type === type) {
            filteredImages[id] = image
          }
        })
        return filteredImages
      }
    },

    getImageById: (state) => {
      return (imageID: string): ImageAsset | undefined => {
        return state.images[imageID]
      }
    },

    getUploadTemp: (state) => (): ImageAsset => {
      return state.uploadTemp
    },

    hasUploadTemp: (state) => (): boolean => {
      const result = Boolean(state.uploadTemp?.imageID)
      console.log('🔍 hasUploadTemp check:')
      console.log('  - uploadTemp.imageID:', state.uploadTemp?.imageID)
      console.log('  - result:', result)
      return result
    },
  },

  // Actions
  actions: {
    // Setters - completely replace state
    setImages(newImages: Record<string, ImageAsset>) {
      this.images = { ...newImages }
    },

    setImage(image: ImageAsset) {
      this.images[image.imageID] = image
    },

    setUploadTemp(image: ImageAsset) {
      this.uploadTemp = { ...image }
    },

    // CRUD operations
    addImage(image: ImageAsset) {
      this.images[image.imageID] = image
    },

    updateImagePartial(id: string, updates: Partial<ImageAsset>) {
      const existing = this.images[id]
      if (existing) {
        this.images[id] = { ...existing, ...updates }
      }
    },

    // Update entire image object
    updateImage(updatedImage: ImageAsset) {
      if (this.images[updatedImage.imageID]) {
        this.images[updatedImage.imageID] = updatedImage
        console.log(`✅ Updated image in store: ${updatedImage.imageID}`)
      } else {
        console.warn(`⚠️ Image not found for update: ${updatedImage.imageID}`)
      }
    },

    removeImage(id: string) {
      delete this.images[id]
    },

    clearImages() {
      this.images = {}
    },

    clearUploadTemp() {
      // Reset to clean, empty state
      this.uploadTemp = createEmptyUploadTemp()
    },

    updateImageAltText(imageID: string, altText: string) {
      const existing = this.images[imageID]
      if (existing) {
        this.images[imageID] = { ...existing, altText }
      }
    },

    updateUploadTempAltText(altText: string) {
      this.uploadTemp.altText = altText
    },

    // Image-specific operations
    promoteUploadTempToImage() {
      if (this.uploadTemp.url) {
        // Check if temp has actual content
        this.images[this.uploadTemp.imageID] = { ...this.uploadTemp }
        this.clearUploadTemp() // Reset instead of nullifying
      }
    },
  },
})
