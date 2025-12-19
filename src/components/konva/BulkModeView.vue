<template>
  <!-- Renders multiple FramedAdUnits at their frameConfig positions -->
  <v-group>
    <FramedAdUnit
      v-for="adUnit in adUnitsArray"
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

// Get ad units
const { getAllAdUnits } = useAdUnits()
const allAdUnits = computed(() => getAllAdUnits())
const adUnitsArray = computed(() => Object.values(allAdUnits.value))

// Clean version - uses actual frameConfig positions
</script>
