// stores/imageStore.ts
import { defineStore } from 'pinia'

export interface ImageDimensions {
  width: number
  height: number
  naturalWidth: number
  naturalHeight: number
  aspectRatio: number
}

export interface ImageAsset {
  id: string
  url: string
  type?: 'image' | 'logo'
  name?: string
  dimensions?: ImageDimensions
}

interface ImageState {
  images: Record<string, ImageAsset>
  reserved: {
    fallback: ImageAsset | null
    uploadTemp: ImageAsset | null
  }
}

export const useImageStore = defineStore('image', {
  state: (): ImageState => ({
    images: {},
    reserved: {
      fallback: null,
      uploadTemp: null,
    },
  }),

  getters: {
    getImage: (state) => {
      return (id: string): ImageAsset | undefined => {
        return state.images[id]
      }
    },

    getDimensions: (state) => {
      return (id: string): ImageDimensions | undefined => {
        return state.images[id]?.dimensions
      }
    },

    getImagesByType: (state) => {
      return (type: 'image' | 'logo'): Record<string, ImageAsset> => {
        return Object.fromEntries(
          Object.entries(state.images).filter(([, asset]) => asset.type === type),
        )
      }
    },

    getAspectRatio: (state) => {
      return (id: string): number | undefined => {
        const dimensions = state.images[id]?.dimensions
        return dimensions?.aspectRatio
      }
    },

    getAllImages: (state): ImageAsset[] => {
      return Object.values(state.images)
    },

    getImageCount: (state): number => {
      return Object.keys(state.images).length
    },

    getImagesByTypeCount: (state) => {
      return (type: 'image' | 'logo'): number => {
        return Object.values(state.images).filter((asset) => asset.type === type).length
      }
    },
  },

  actions: {
    addImage(image: ImageAsset): void {
      this.images[image.id] = image
    },

    addImages(images: ImageAsset[]): void {
      images.forEach((image) => {
        this.images[image.id] = image
      })
    },

    updateImage(id: string, updates: Partial<ImageAsset>): void {
      if (this.images[id]) {
        this.images[id] = { ...this.images[id], ...updates }
      }
    },

    removeImage(id: string): void {
      delete this.images[id]
    },

    clearImages(): void {
      this.images = {}
    },

    setImageDimensions(id: string, dimensions: ImageDimensions): void {
      if (this.images[id]) {
        this.images[id].dimensions = dimensions
      }
    },

    setFallbackImage(image: ImageAsset | null): void {
      this.reserved.fallback = image
    },

    setUploadTempImage(image: ImageAsset | null): void {
      this.reserved.uploadTemp = image
    },

    hasImage(id: string): boolean {
      return id in this.images
    },

    calculateAndSetDimensions(id: string, naturalWidth: number, naturalHeight: number): void {
      if (this.images[id]) {
        const aspectRatio = naturalWidth / naturalHeight
        this.images[id].dimensions = {
          width: naturalWidth,
          height: naturalHeight,
          naturalWidth,
          naturalHeight,
          aspectRatio,
        }
      }
    },
  },
})
