<!-- tools/EditTexts.vue -->
<template>
  <div class="tool-menu">
    <h3 class="menu-title">Edit texts</h3>

    <!-- Main headline -->
    <TextFieldSection
      title="Main headline"
      placeholder="The ad's main headline goes into this bar"
      v-model="headlineValue"
      :locked-elements="lockedElementsByTag.headline"
      :override-state="overrideStates.headlineOverride"
      field-name="headline"
      @update:override-state="overrideStates.headlineOverride.value = $event"
    />

    <!-- Sub headline -->
    <TextFieldSection
      title="Sub headline"
      placeholder="The ad's sub headline goes into this bar"
      v-model="subheadValue"
      :locked-elements="lockedElementsByTag.subhead"
      :override-state="overrideStates.subheadOverride"
      field-name="subhead"
      @update:override-state="overrideStates.subheadOverride.value = $event"
    />

    <!-- Button CTA -->
    <TextFieldSection
      title="Button CTA"
      placeholder="SHOP NOW"
      v-model="ctaValue"
      :locked-elements="lockedElementsByTag.cta"
      :override-state="overrideStates.ctaOverride"
      field-name="cta"
      size="small"
      @update:override-state="overrideStates.ctaOverride.value = $event"
    />

    <hr class="divider" />

    <!-- Disclaimer -->
    <DisclaimerSection
      v-model:text="disclaimerValue"
      v-model:visibility="disclaimerVisibility"
      v-model:bg-visibility="disclaimerBGVisibility"
      :locked-text-elements="lockedElementsByTag.disclaimer"
      :locked-visibility-elements="lockedVisibilityElementsByTag.disclaimer"
      :locked-bg-elements="lockedVisibilityElementsByTag.disclaimerBG"
      :override-states="overrideStates"
      @update:disclaimer-override="overrideStates.disclaimerOverride.value = $event"
      @update:disclaimer-visibility-override="
        overrideStates.disclaimerVisibilityOverride.value = $event
      "
      @update:disclaimer-b-g-visibility-override="
        overrideStates.disclaimerBGVisibilityOverride.value = $event
      "
    />
  </div>
</template>

<script setup lang="ts">
import { useTools } from '@/composables/Tools/useTools'
import TextFieldSection from './Subcomponets/TextFieldSection.vue'
import DisclaimerSection from './Subcomponets/DisclaimerSection.vue'

const {
  headlineValue,
  subheadValue,
  ctaValue,
  disclaimerValue,
  disclaimerVisibility,
  disclaimerBGVisibility,
  overrideStates,
  lockedElementsByTag,
  lockedVisibilityElementsByTag,
} = useTools()
</script>
