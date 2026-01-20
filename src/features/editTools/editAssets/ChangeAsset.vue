<template>
  <div class="change-asset">
    <div>Hello - Change {{ currentAssetType }}</div>
    <div class="change-options">
      <button>Browse {{ currentAssetType }}</button>
      <button>Select from Library</button>
      <button>Recent {{ currentAssetType }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEditAssets } from './useEditAsset'

const { currentAssetType } = useEditAssets()
</script>

<style scoped>
.change-asset {
  padding: 1rem;
  border: 1px solid #ddd;
  margin: 0.5rem 0;
  border-radius: 4px;
}

.change-options {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.change-options button {
  padding: 0.5rem 1rem;
  border: 1px solid #ccc;
  background: white;
  cursor: pointer;
  border-radius: 4px;
}
</style>
