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
import { useAdUnitStore } from '@/data/stores/useAdUnitStore'
import FramedAdUnit from './FramedAdUnit.vue'

// Get ad units
const adUnitStore = useAdUnitStore()
const allAdUnits = computed(() => adUnitStore.getAllAdUnits())
const adUnitsArray = computed(() => Object.values(allAdUnits.value))

// Clean version - uses actual frameConfig positions
</script>
