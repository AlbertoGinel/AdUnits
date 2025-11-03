<template>
  <v-text :config="textConfig" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CanvasElement } from '@/stores/canvas'

interface Props {
  element: CanvasElement
}

const props = defineProps<Props>()

const textConfig = computed(() => ({
  x: props.element.x,
  y: props.element.y,
  text: props.element.text,
  fontSize: props.element.fontSize,
  fontFamily: props.element.fontFamily,
  fontStyle: props.element.fontStyle,
  fill: props.element.fill,
  align: props.element.align,
  width: props.element.width,
  height: props.element.height,
  cornerRadius: props.element.cornerRadius,
  stroke: props.element.strokeColor,
  strokeWidth: props.element.strokeWidth,
  verticalAlign: props.element.verticalAlign,
}))
</script>
