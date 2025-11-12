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
  fallbackUrl?: string
  image?: HTMLImageElement
  dimensions?: ImageDimensions
  loaded: boolean
  error?: string
}

interface ImageState {
  images: Record<string, ImageAsset>
  preloadedImages: Record<string, boolean>
  isInitialized: boolean
}

export const useImageStore = defineStore('image', {
  state: (): ImageState => ({
    images: {},
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
