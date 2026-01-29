<template>
  <v-group>
    <!-- Simple crop interface -->
    <v-text
      :config="{
        x: 50,
        y: 50,
        text: 'CROP MODE ACTIVE',
        fontSize: 24,
        fill: '#ff6b35',
        fontStyle: 'bold',
      }"
    />

    <!-- Exit button -->
    <v-rect
      :config="{
        x: 50,
        y: 100,
        width: 100,
        height: 40,
        fill: '#ff6b35',
        cornerRadius: 5,
        listening: true,
      }"
      @click="handleExitCrop"
    />

    <v-text
      :config="{
        x: 75,
        y: 115,
        text: 'Exit Crop',
        fontSize: 14,
        fill: 'white',
        fontStyle: 'bold',
        listening: false,
      }"
    />
  </v-group>
</template>

<script setup lang="ts">
import { useCropState } from '../composables/useCropState'

const cropState = useCropState()

const handleExitCrop = () => {
  cropState.exitCrop()
}
</script>
