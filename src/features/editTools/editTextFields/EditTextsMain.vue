<template>
  <div class="tool-menu">
    <h3 class="text-bentonville-xl-700">Edit texts</h3>
    <p class="text-light-gray-sm-400">Across ad sizes</p>

    <!-- Regular text elements (headline, subhead, cta) -->
    <TextFieldSection v-for="type in availableTextElements" :key="type" :type="type" />

    <!-- Special disclaimer section (handles both disclaimer text and disclaimerBG) -->
    <DisclaimerFieldSection v-if="hasDisclaimer" />

    <!-- Show message if no text elements exist in focus mode -->
    <div v-if="availableTextElements.length === 0 && !hasDisclaimer" class="no-elements-message">
      <p>This ad unit does not contain any text elements.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEditTextField } from './useEditTextField'
import TextFieldSection from './TextFieldSection.vue'
import DisclaimerFieldSection from './DisclaimerFieldSection.vue'

const { availableTextElements, hasDisclaimer } = useEditTextField()
</script>

<style scoped>
.no-elements-message {
  padding: var(--spacing-2xl);
  text-align: center;
  color: var(--color-text-secondary);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
}

.no-elements-message p {
  margin: 0;
  font-family: var(--font-family-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-regular);
}
</style>
