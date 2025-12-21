<!-- composables/setupImages/FallbackImage.vue -->
<template>
  <div
    :class="['fallback-image', className]"
    :style="{
      width: width || '100%',
      height: height || 'auto',
      aspectRatio: aspectRatio,
    }"
  >
    <div class="fallback-icon" v-html="imageTool"></div>
    <span v-if="showText">{{ fallbackText }}</span>
  </div>
</template>

<script setup lang="ts">
import { useIcons } from '@/composables/utils/useIcons'

interface Props {
  width?: string
  height?: string
  aspectRatio?: string
  className?: string
  showText?: boolean
  fallbackText?: string
}

withDefaults(defineProps<Props>(), {
  className: '',
  showText: false,
  fallbackText: 'No image',
})

const { getIcon } = useIcons()
const imageTool = getIcon('imageTool')
</script>

<style scoped>
.fallback-image {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0.2) 100%), #d5d9dd;
  border-radius: 10px;
  color: #6c757d;
  font-size: 14px;
  font-weight: 500;
  height: 120px;
  padding: 8px;
  flex-shrink: 0;
  align-self: stretch;
  min-width: 80px;
}

.fallback-icon {
  opacity: 0.6;
}
</style>
