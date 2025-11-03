<template>
  <v-rect :config="rectConfig" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CanvasElement } from '@/stores/canvas'

interface Props {
  element: CanvasElement
}

const props = defineProps<Props>()

const rectConfig = computed(() => ({
  x: props.element.x,
  y: props.element.y,
  width: props.element.width,
  height: props.element.height,
  fill: props.element.fill,
  cornerRadius: props.element.cornerRadius,
  stroke: props.element.strokeColor,
  strokeWidth: props.element.strokeWidth,
}))
</script>
