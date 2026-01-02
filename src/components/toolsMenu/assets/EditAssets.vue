<!-- tools/assets/EditAssets.vue -->
<template>
  <div class="tool-menu">
    <!-- Edit Screen -->
    <template v-if="control.currentAssetScreen.value === 'edit'">
      <!-- Page header -->
      <h3 class="text-bentonville-xl-700">
        Edit main {{ control.assetDisplayText.value.singular }}
      </h3>
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

      <div class="action-buttons">
        <button @click="control.handleAddAsset" class="btn-add-image">
          Add {{ control.assetDisplayText.value.plural }}
          <span v-html="getIcon('addCircle')"></span>
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
import { useIcons } from '@/composables/utils/useIcons'
import { useEditAssetsControl } from './useEditAssetsControl'

// 🎮 Get all the logic from clean composable
const control = useEditAssetsControl()

const { getIcon } = useIcons()

// 🎯 Simple handlers for component events
const handleAltTextUpdate = (value: string) => {
  control.altText.value = value
}
</script>

<style scoped>
.tool-menu {
  padding: 0; /* Override default padding for this component */
}
</style>
