<!-- tools/assets/ChangeAssets.vue -->
<template>
  <button @click="control.currentAssetScreen.value = 'edit'" class="btn-add-image">
    <span v-html="getIcon('backCircle')"></span>Back to image editor
  </button>

  <h3 class="text-bentonville-xl-700">Change {{ control.assetDisplayText.value.singular }}</h3>
  <p class="text-light-gray-sm-400">Across ad sizes</p>

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
</template>

<script setup lang="ts">
import PreviewAsset from './PreviewAsset.vue'
import UploadLibrary from './UploadLibrary.vue'
import { useEditAssetsControl } from './useEditAssetsControl'

import { useIcons } from '@/composables/utils/useIcons'

const { getIcon } = useIcons()

// 🎮 Use shared composable instance
const control = useEditAssetsControl()

// 🎯 Simple handlers for component events
const handleAltTextUpdate = (value: string) => {
  control.altText.value = value
}
</script>

<style scoped>
.btn-add-image {
  width: 75%;
  margin-bottom: var(--spacing-xl);
}
</style>
