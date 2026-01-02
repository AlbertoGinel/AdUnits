<!-- tools/EditTexts.vue -->
<template>
  <div class="tool-menu">
    <h3 class="text-bentonville-xl-700">Edit texts</h3>
    <p class="text-light-gray-sm-400">Across ad sizes</p>

    <!-- Main headline - only show if ad unit has it -->
    <TextFieldSection
      v-if="hasHeadline"
      title="Main headline"
      placeholder="The ad's main headline goes into this bar"
      v-model="headlineValue"
      :locked-elements="lockedElementsByTag.headline"
      :override-state="overrideStates.headlineOverride"
      field-name="headline"
      @update:override-state="overrideStates.headlineOverride.value = $event"
    />

    <!-- Sub headline - only show if ad unit has it -->
    <TextFieldSection
      v-if="hasSubhead"
      title="Sub headline"
      placeholder="The ad's sub headline goes into this bar"
      v-model="subheadValue"
      :locked-elements="lockedElementsByTag.subhead"
      :override-state="overrideStates.subheadOverride"
      field-name="subhead"
      @update:override-state="overrideStates.subheadOverride.value = $event"
    />

    <!-- Button CTA - only show if ad unit has it -->
    <TextFieldSection
      v-if="hasCTA"
      title="Button CTA"
      placeholder="SHOP NOW"
      v-model="ctaValue"
      :locked-elements="lockedElementsByTag.cta"
      :override-state="overrideStates.ctaOverride"
      field-name="cta"
      size="small"
      @update:override-state="overrideStates.ctaOverride.value = $event"
    />

    <!-- Only show divider if we have disclaimer AND at least one text field above -->
    <hr v-if="hasDisclaimer && (hasHeadline || hasSubhead || hasCTA)" class="divider" />

    <!-- Disclaimer - only show if ad unit has it -->
    <DisclaimerSection v-if="hasDisclaimer" />

    <!-- Show message if no text elements exist in focus mode -->
    <div v-if="isFocusMode && !hasAnyTextElements" class="no-elements-message">
      <p>This ad unit does not contain any text elements.</p>
    </div>
  </div>
</template>

<style scoped>
.divider {
  border: none;
  border-top: 1px solid #dee2e6;
  margin: 16px 0;
}
</style>

<script setup lang="ts">
import { computed } from 'vue'
import { useTools } from '@/composables/Tools/useTools'
import { useCanvasData } from '@/composables/data/useCanvasData'
import TextFieldSection from './textFields/TextFieldSection.vue'
import DisclaimerSection from './textFields/DisclaimerSection.vue'

const { getCurrentView } = useCanvasData()

const {
  headlineValue,
  subheadValue,
  ctaValue,
  overrideStates,
  lockedElementsByTag,
  hasHeadline,
  hasSubhead,
  hasCTA,
  hasDisclaimer,
} = useTools()

const isFocusMode = computed(() => getCurrentView() === 'focusMode')

const hasAnyTextElements = computed(
  () => hasHeadline.value || hasSubhead.value || hasCTA.value || hasDisclaimer.value,
)
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
