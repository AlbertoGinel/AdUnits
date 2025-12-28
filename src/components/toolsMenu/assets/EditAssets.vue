<!-- tools/assets/EditAssets.vue -->
<template>
  <div class="tool-menu">
    <!-- Edit Screen -->
    <template v-if="control.currentAssetScreen.value === 'edit'">
      <!-- Page header -->
      <h3 class="menu-title">Edit main {{ control.assetDisplayText.value.singular }}</h3>
      <p class="menu-subtitle">Across ad sizes</p>
      <PreviewAsset
        :current-asset="control.currentAsset.value"
        :current-asset-id="control.currentAssetId.value || ''"
        :has-asset="control.hasAsset.value"
        :preview-buttons="control.previewButtons.value"
        :is-focus-mode="control.isFocusMode.value"
        :alt-text="control.altText.value"
        :is-logo-mode="control.isLogoMode.value"
        @button-click="control.handleButtonClick"
        @update:alt-text="handleAltTextUpdate"
      />

      <div class="action-buttons">
        <button @click="control.handleAddAsset" class="btn-add-image">
          Add {{ control.assetDisplayText.value.singular }}
        </button>
      </div>
    </template>

    <!-- Change Screen -->
    <ChangeAssets v-else-if="control.currentAssetScreen.value === 'change'" />

    <!-- Upload Screen -->
    <UploadAsset v-else-if="control.currentAssetScreen.value === 'upload'" />
  </div>
</template>

<script setup lang="ts">
import PreviewAsset from './PreviewAsset.vue'
import ChangeAssets from './ChangeAssets.vue'
import UploadAsset from './UploadAsset.vue'
import { useEditAssetsControl } from './useEditAssetsControl'

// 🎮 Get all the logic from clean composable
const control = useEditAssetsControl()

// 🎯 Simple handlers for component events
const handleAltTextUpdate = (value: string) => {
  control.altText.value = value
}
</script>

<style scoped>
.tool-menu {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 0;
}

.menu-title {
  font-size: 20px;
  font-weight: 600;
  color: #212529;
  margin: 0;
}

.menu-subtitle {
  font-size: 13px;
  color: #6c757d;
  margin: 0;
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 8px;
  border-top: 1px solid #e9ecef;
}

.btn-add-image {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: white;
  border: 2px solid #212529;
  border-radius: 24px;
  color: #212529;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-add-image:hover {
  background: #212529;
  color: white;
}
</style>
