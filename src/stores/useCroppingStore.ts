// stores/cropping.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CropData } from '@/composables/Tools/useCropping'

export const useCroppingStore = defineStore('cropping', () => {
  const isCropping = ref(false)
  const workingCrop = ref<CropData | null>(null)
  const originalCrop = ref<CropData | null>(null)

  return {
    isCropping,
    workingCrop,
    originalCrop,
  }
})
