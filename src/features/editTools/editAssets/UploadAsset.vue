<template>
  <div class="upload-asset">
    <div>Hello - Upload {{ currentAssetType }}</div>
    <div class="upload-area">
      <div class="drop-zone">
        <p>Drop {{ currentAssetType }} here or click to browse</p>
        <input type="file" :accept="acceptedFileTypes" style="display: none" ref="fileInput" />
        <button @click="triggerFileInput">Browse {{ currentAssetType }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useEditAssets } from './useEditAsset'

const { currentAssetType } = useEditAssets()
const fileInput = ref<HTMLInputElement>()

const acceptedFileTypes = computed(() => {
  return currentAssetType.value === 'image' ? 'image/*' : 'image/svg+xml,image/png,image/jpeg'
})

const triggerFileInput = () => {
  fileInput.value?.click()
}
</script>

<style scoped>
.upload-asset {
  padding: 1rem;
  border: 1px solid #ddd;
  margin: 0.5rem 0;
  border-radius: 4px;
}

.drop-zone {
  border: 2px dashed #ccc;
  padding: 2rem;
  text-align: center;
  border-radius: 4px;
  margin-top: 1rem;
}

.drop-zone:hover {
  border-color: #007acc;
  background: #f9f9f9;
}

.drop-zone button {
  padding: 0.5rem 1rem;
  border: 1px solid #ccc;
  background: white;
  cursor: pointer;
  border-radius: 4px;
  margin-top: 1rem;
}
</style>
