<template>
  <v-text
    :config="buttonConfig"
    @mousedown="handleClick"
    @mouseover="handleMouseOver"
    @mouseout="handleMouseOut"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CanvasElement } from '@/stores/canvas'

interface Props {
  element: CanvasElement
}

const props = defineProps<Props>()

const emit = defineEmits<{
  click: [element: CanvasElement]
}>()

const handleClick = () => {
  console.log('🔘 Button clicked:', props.element.text, props.element.id)
  emit('click', props.element)
}

const handleMouseOver = (event: {
  target: { getStage(): { container(): { style: { cursor: string } } } }
}) => {
  console.log('🖱️ Mouse over button:', props.element.text)
  event.target.getStage().container().style.cursor = 'pointer'
}

const handleMouseOut = (event: {
  target: { getStage(): { container(): { style: { cursor: string } } } }
}) => {
  console.log('🖱️ Mouse out button:', props.element.text)
  event.target.getStage().container().style.cursor = 'default'
}

const buttonConfig = computed(() => ({
  x: props.element.x,
  y: props.element.y,
  text: props.element.text || 'Button',
  fontSize: props.element.fontSize || 12,
  fontFamily: props.element.fontFamily || 'Arial',
  fontStyle: props.element.fontStyle || 'normal',
  fill: props.element.fill || '#0066cc',
  align: props.element.align || 'left',
  width: props.element.width || 50,
  height: props.element.height || 20,
  cornerRadius: props.element.cornerRadius || 0,
  stroke: props.element.strokeColor || 'transparent',
  strokeWidth: props.element.strokeWidth || 0,
  verticalAlign: props.element.verticalAlign || 'top',
  // ✅ Essential for events
  listening: true,
  // ✅ Make sure it's interactive
  perfectDrawEnabled: false,
}))
</script>
