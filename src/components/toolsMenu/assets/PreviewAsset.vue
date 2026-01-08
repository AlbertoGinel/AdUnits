<!-- components/toolsMenu/assets/PreviewAsset.vue -->
<template>
  <div class="preview-container">
    <!-- Show message if no asset in focus mode -->
    <div v-if="isFocusMode && !hasAsset" class="no-elements-message">
      <p>This ad unit does not contain {{ isLogoMode ? 'a logo' : 'an image' }} element.</p>
    </div>

    <!-- Normal asset editing content -->
    <template v-else>
      <div class="image-section">
        <h4 class="text-caption">{{ isLogoMode ? 'Logo' : 'Lifestyle photo' }}</h4>
        <div class="image-preview">
          <SmartImage
            :image-id="currentAssetId"
            :alt="isLogoMode ? 'Logo' : 'Lifestyle photo'"
            class-name="preview-imageElem"
            :show-fallback-text="true"
          />
          <div class="image-actions">
            <button
              v-for="button in previewButtons.filter((btn: any) => btn)"
              :key="button.id"
              :class="button.class"
              :disabled="button.disabled"
              @click="handleButtonClick(button.action)"
            >
              {{ button.label }}
              <span v-if="button.icon" v-html="getIcon(button.icon)"></span>
            </button>
          </div>
        </div>
      </div>

      <!-- Alt text section (for both images AND logos) -->
      <div v-if="altText !== undefined" class="alt-text-section">
        <h4 class="text-caption text-caption--medium">Alt text*</h4>
        <p class="feedback-text">
          {{
            isLogoMode
              ? 'Alt text should describe what the logo says or represents for screen readers.'
              : "Alt text should be a long-form description of what's visually represented in your ad."
          }}
        </p>
        <input
          :value="altText"
          @input="updateAltText(($event.target as HTMLInputElement)?.value || '')"
          type="text"
          class="text-input text-caption"
          :placeholder="
            isLogoMode ? 'Logo description goes here' : 'Image\'s alternate text goes here'
          "
          maxlength="150"
        />
        <div class="text-light-gray-xs-400 character-count">
          Character count: {{ altText?.length || 0 }}/150
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import SmartImage from '@/composables/setupImages/SmartImage.vue'

import { useIcons, type IconName } from '@/composables/utils/useIcons'

const { getIcon } = useIcons()

interface Props {
  // 📷 Basic asset display data
  currentAsset: string
  currentAssetId: string
  isFocusMode: boolean
  hasAsset: boolean
  altText?: string
  isLogoMode?: boolean

  // 🔘 Button configuration
  previewButtons: Array<{
    id: string
    class: string
    label: string
    action: string
    disabled?: boolean
    icon?: IconName
  }>
}

withDefaults(defineProps<Props>(), {
  isLogoMode: false,
})

const emit = defineEmits<{
  'button-click': [action: string]
  'update:altText': [value: string]
}>()

// 🎯 Simple handlers - emit events
const handleButtonClick = (action: string) => {
  emit('button-click', action)
}

const updateAltText = (value: string) => {
  emit('update:altText', value)
}
</script>

<style scoped>
.preview-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-top: 20px;
}

.menu-subtitle {
  font-size: 13px;
  color: #6c757d;
  margin: 0;
}

.image-section {
  display: flex;
  flex-direction: column;
}

.image-preview {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  margin-top: 12px;
}

.preview-imageElem {
  width: 100%;
  height: auto;
  display: block;
}

.image-actions {
  position: absolute;
  bottom: var(--spacing-sm);
  right: var(--spacing-sm);
  display: flex;
  gap: 12px;
  z-index: 10;
  font-family: var(--font-family-primary);
}

/* Preview buttons now use global .btn-preview class from global.css */

.alt-text-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-description {
  font-size: 12px;
  color: #6c757d;
  line-height: 1.5;
  margin: 0;
}

.character-count {
  text-align: right;
}

.no-elements-message {
  padding: 24px;
  text-align: center;
  color: #6c757d;
  background: #f8f9fa;
  border-radius: 8px;
}

.no-elements-message p {
  margin: 0;
  font-size: 14px;
}
</style>
