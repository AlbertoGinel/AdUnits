<template>
  <!-- Renders multiple FramedAdUnits at their frameConfig positions -->

  <v-group>
    <FramedAdUnit
      v-for="adUnit in allAdUnits"
      :key="adUnit.id"
      :ad-unit="adUnit"
      :position="{
        x: adUnit.frameConfig.position.x,
        y: adUnit.frameConfig.position.y,
      }"
    />
  </v-group>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAdUnits } from '@/composables/data/useAdUnits'
import FramedAdUnit from '@/components/konva/FramedAdUnit.vue'

// ✅ Computed optimization - only recalculate when adUnits change
const { getAllAdUnits } = useAdUnits()
const allAdUnits = computed(() => getAllAdUnits())
</script>
