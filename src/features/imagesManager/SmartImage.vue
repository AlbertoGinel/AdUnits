<!-- composables/setupImages/SmartImage.vue -->
<template>
  <!-- Fallback when no image -->
  <FallbackImage
    v-if="shouldShowFallback"
    :width="width"
    :height="height"
    :aspect-ratio="aspectRatio"
    :class-name="className"
    :show-text="false"
  />

  <!-- Normal image -->
  <img
    v-else
    :src="imageUrl"
    :alt="alt"
    :class="className"
    :style="imageStyle"
    v-bind="$attrs"
    @load="$emit('load', $event)"
    @error="$emit('error', $event)"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import FallbackImage from './FallbackImage.vue'
import { useImageManager } from './useImageManager'

interface Props {
  imageId?: string
  alt?: string
  width?: string
  height?: string
  aspectRatio?: string
  className?: string
  showFallbackText?: boolean
  fallbackText?: string
}

const props = withDefaults(defineProps<Props>(), {
  imageId: '',
  alt: '',
  className: '',
  showFallbackText: false,
  fallbackText: 'No image',
})

defineEmits<{
  load: [event: Event]
  error: [event: Event]
}>()

const imageManager = useImageManager()

// Check if we should show fallback
const shouldShowFallback = computed(() => {
  return !props.imageId || props.imageId === '' || props.imageId === '__fallback__'
})

// Get the actual image URL
const imageUrl = computed(() => {
  if (shouldShowFallback.value) return ''

  const imageElement = imageManager.getImageOptimized(props.imageId)
  return imageElement?.src || ''
})

// Image styling
const imageStyle = computed(() => {
  const style: Record<string, string> = {}

  if (props.width) style.width = props.width
  if (props.height) style.height = props.height
  if (props.aspectRatio) style.aspectRatio = props.aspectRatio

  return style
})
</script>

<style scoped>
/* Global 9:5 aspect ratio for all images */
img {
  display: block;
  width: 100%;
  aspect-ratio: 9 / 5;
  object-fit: cover;
}
</style>
