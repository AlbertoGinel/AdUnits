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
  url: string // Original URL (e.g., "/fromServer/lifeStyle.png", "/uploads/creative/image.png")
  blobUrl?: string // Blob URL for display (e.g., "blob:http://localhost:3000/abc123...")
  blobId?: string // IndexedDB key for the stored blob
  type?: 'image' | 'logo' // Type of image
  name?: string
  fallbackUrl?: string
  image?: HTMLImageElement
  dimensions?: ImageDimensions
  loaded: boolean
  error?: string
  isUploaded?: boolean
}

interface ImageState {
  images: Record<string, ImageAsset>
  reserved: {
    fallback: ImageAsset | null
    uploadTemp: ImageAsset | null
  }
  preloadedImages: Record<string, boolean>
  isInitialized: boolean
}

export const useImageStore = defineStore('image', {
  state: (): ImageState => ({
    images: {},
    reserved: {
      fallback: null,
      uploadTemp: null,
    },
    preloadedImages: {},
    isInitialized: false,
  }),

  getters: {
    getImage:
      (state) =>
      (id: string): HTMLImageElement | undefined => {
        return state.images[id]?.image
      },

    getDimensions:
      (state) =>
      (id: string): ImageDimensions | undefined => {
        return state.images[id]?.dimensions
      },

    getImagesByType:
      (state) =>
      (type: 'image' | 'logo'): Record<string, ImageAsset> => {
        return Object.fromEntries(
          Object.entries(state.images).filter(([, asset]) => asset.type === type),
        )
      },

    isLoaded:
      (state) =>
      (id: string): boolean => {
        return state.images[id]?.loaded || false
      },

    isLoading:
      (state) =>
      (id: string): boolean => {
        const image = state.images[id]
        return !!(image && !image.loaded && !image.error)
      },

    hasError:
      (state) =>
      (id: string): boolean => {
        return !!state.images[id]?.error
      },

    // Helper getter for common layout calculations
    getAspectRatio:
      (state) =>
      (id: string): number => {
        return state.images[id]?.dimensions?.aspectRatio || 1
      },
  },
})
