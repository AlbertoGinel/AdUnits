import { ref } from 'vue'

// Shared crop state - starts false by default
const isCropActive = ref(false)

export function useCropState() {
  const enterCrop = () => {
    console.log('✅ Entering crop mode')
    isCropActive.value = true
  }

  const exitCrop = () => {
    console.log('✅ Exiting crop mode')
    isCropActive.value = false
  }

  return {
    // State
    isCropActive,

    // Actions
    enterCrop,
    exitCrop,
  }
}
