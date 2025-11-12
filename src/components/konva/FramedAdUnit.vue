<template>
  <!-- Frame with title, edit button, and AdUnit content -->
  <v-group :config="{ x: position.x, y: position.y }">
    <!-- Ad Unit Frame Background -->

    <!-- Frame Title -->
    <v-text :config="titleConfig" />

    <!-- Edit Button -->
    <v-text :config="editButtonConfig" @click="handleEditClick" />

    <!-- AdUnit Content (positioned with contentOffset) -->
    <v-group :config="contentGroupConfig">
      <AdUnitComponent :ad-unit="adUnit" />
    </v-group>
  </v-group>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AdUnit } from '@/stores/canvas'
import AdUnitComponent from '@/components/konva/AdUnit.vue'

// ✅ Props
interface Props {
  adUnit: AdUnit
  position: { x: number; y: number }
}

const props = defineProps<Props>()

// ✅ Title configuration
const titleConfig = computed(() => ({
  x: 8,
  y: -20,
  text: props.adUnit.frameConfig.title,
  fontSize: 14,
  fontFamily: 'Arial, sans-serif',
  fill: '#333',
  fontStyle: 'bold',
}))

// ✅ Edit button - simple blue text
const editButtonConfig = computed(() => {
  const offset = props.adUnit.frameConfig.editButtonOffset || { x: -60, y: -25 }
  return {
    x: props.adUnit.frameConfig.dimensions.width + offset.x,
    y: offset.y,
    text: 'Edit',
    fontSize: 12,
    fontFamily: 'Arial, sans-serif',
    fill: '#007bff',
  }
})

// ✅ Content group positioning using contentOffset
const contentGroupConfig = computed(() => ({
  x: props.adUnit.frameConfig.contentOffset.x,
  y: props.adUnit.frameConfig.contentOffset.y,
}))

// ✅ Handle edit button click
const handleEditClick = () => {
  console.log('Edit clicked for ad unit:', props.adUnit.id)
}
</script>
