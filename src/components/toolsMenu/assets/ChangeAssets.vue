<!-- tools/assets/ChangeAssets.vue -->
<template>
  <div>
    <button @click="control.currentAssetScreen.value = 'edit'" class="btn-secondary">Cancel</button>
    <h3 class="menu-title">Change {{ control.assetDisplayText.value.singular }}</h3>
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

    <UploadLibrary
      :show="true"
      :type="control.assetType.value"
      :images="control.availableAssets.value"
      :selected-image-id="control.selectedLibraryAssetId.value"
      :show-insert-button="true"
      @upload-requested="control.handleAddAsset"
      @image-selected="control.handleAssetSelected"
      @insert-requested="control.handleInsertRequested"
    />
  </div>
</template>

<script setup lang="ts">
import PreviewAsset from './PreviewAsset.vue'
import UploadLibrary from './UploadLibrary.vue'
import { useEditAssetsControl } from './useEditAssetsControl'

// 🎮 Use shared composable instance
const control = useEditAssetsControl()

// 🎯 Simple handlers for component events
const handleAltTextUpdate = (value: string) => {
  control.altText.value = value
}
</script>
