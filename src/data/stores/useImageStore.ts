import { defineStore } from 'pinia'
import type { ImageState, ImageAsset } from '../../types/mainTypes'

export const useImageStore = defineStore('images', {
  // State
  state: (): ImageState => ({
    images: {},
    uploadTemp: null,
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

    getUploadTemp: (state) => (): ImageAsset | null => {
      return state.uploadTemp
    },

    hasUploadTemp: (state) => (): boolean => {
      return state.uploadTemp !== null
    },
  },

  // Actions
  actions: {
    // Setters - completely replace state
    setImages(newImages: Record<string, ImageAsset>) {
      this.images = { ...newImages }
    },

    setImage(image: ImageAsset) {
      this.images[image.id] = image
    },

    setUploadTemp(image: ImageAsset | null) {
      this.uploadTemp = image
    },

    // CRUD operations
    addImage(image: ImageAsset) {
      this.images[image.id] = image
    },

    updateImage(id: string, updates: Partial<ImageAsset>) {
      const existing = this.images[id]
      if (existing) {
        this.images[id] = { ...existing, ...updates }
      }
    },

    removeImage(id: string) {
      delete this.images[id]
    },

    clearImages() {
      this.images = {}
    },

    clearUploadTemp() {
      this.uploadTemp = null
    },

    // Image-specific operations
    promoteUploadTempToImage() {
      if (this.uploadTemp) {
        this.images[this.uploadTemp.id] = this.uploadTemp
        this.uploadTemp = null
      }
    },
  },
})
