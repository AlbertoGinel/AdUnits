<script setup lang="ts">
//import { useEditTools } from '@/features/editTools/useEditTools'
import { useEditAssets } from './useEditAsset'
import PreviewAsset from './PreviewAsset.vue'
import LibraryAsset from './LibraryAsset.vue'

//const { selectedTool } = useEditTools()
const { activeSubView, currentAssetType, goToMainEdit, goToUploadAsset } = useEditAssets()
</script>

<template>
  <div class="edit-asset-main">
    <!-- Dynamic Sub Views -->

    <!-- Main Edit View (default) -->
    <div v-if="activeSubView === 'main'" class="main-edit-view">
      <div>Edit main {{ currentAssetType }}</div>

      <PreviewAsset />

      <button @click="goToUploadAsset" class="back-button">Add {{ currentAssetType }}</button>
    </div>

    <!-- Change Asset View -->
    <div v-if="activeSubView === 'change'" class="change-asset-view">
      <button @click="goToMainEdit" class="back-button">
        Back to {{ currentAssetType }} editor
      </button>
      <div>Change {{ currentAssetType }}</div>

      <PreviewAsset />
      <LibraryAsset />
    </div>

    <!-- Upload Asset View -->
    <div v-if="activeSubView === 'upload'" class="upload-asset-view">
      <button @click="goToMainEdit" class="back-button">
        Back to {{ currentAssetType }} editor
      </button>
      <div>Upload {{ currentAssetType }}</div>
      <PreviewAsset />
    </div>
  </div>
</template>

<style scoped>
.edit-asset-main {
  padding: 1rem;
}

.debug-info {
  background: #f5f5f5;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border-radius: 4px;
}

.navigation {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.navigation button {
  padding: 0.5rem 1rem;
  border: 1px solid #ccc;
  background: white;
  cursor: pointer;
  border-radius: 4px;
}

.navigation button.active {
  background: #007acc;
  color: white;
}

.back-button {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  color: #495057;
  padding: 0.375rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.back-button:hover {
  background: #e9ecef;
  border-color: #adb5bd;
}
</style>
