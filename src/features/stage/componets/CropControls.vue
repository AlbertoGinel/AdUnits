<!-- components/konva/CropControls.vue -->
<template>
  <v-group>
    <!-- Apply button -->
    <v-rect
      :config="{
        x: stageWidth - 220,
        y: stageHeight - 60,
        width: 100,
        height: 40,
        fill: '#28a745',
        cornerRadius: 8,
      }"
      @click="$emit('apply')"
      @mouseenter="handleApplyHover(true)"
      @mouseleave="handleApplyHover(false)"
    />
    <v-text
      :config="{
        x: stageWidth - 220,
        y: stageHeight - 50,
        width: 100,
        height: 40,
        text: '✓ Apply',
        fontSize: 16,
        fontStyle: 'bold',
        fill: 'white',
        align: 'center',
        verticalAlign: 'middle',
        listening: false,
      }"
    />

    <!-- Cancel button -->
    <v-rect
      :config="{
        x: stageWidth - 110,
        y: stageHeight - 60,
        width: 100,
        height: 40,
        fill: '#dc3545',
        cornerRadius: 8,
      }"
      @click="$emit('cancel')"
      @mouseenter="handleCancelHover(true)"
      @mouseleave="handleCancelHover(false)"
    />
    <v-text
      :config="{
        x: stageWidth - 110,
        y: stageHeight - 50,
        width: 100,
        height: 40,
        text: '✕ Cancel',
        fontSize: 16,
        fontStyle: 'bold',
        fill: 'white',
        align: 'center',
        verticalAlign: 'middle',
        listening: false,
      }"
    />
  </v-group>
</template>

<script setup lang="ts">
interface Props {
  stageWidth: number
  stageHeight: number
}

defineProps<Props>()

defineEmits<{
  apply: []
  cancel: []
}>()

const handleApplyHover = (isHover: boolean) => {
  // Could add hover effects via CSS cursor changes
  document.body.style.cursor = isHover ? 'pointer' : 'default'
}

const handleCancelHover = (isHover: boolean) => {
  document.body.style.cursor = isHover ? 'pointer' : 'default'
}
</script>
