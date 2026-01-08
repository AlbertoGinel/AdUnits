<!-- ToolsArea.vue - Smart Router with Sub-Views -->
<template>
  <div class="tool-area">
    <EditTextsSkeleton v-if="!suspenseManager.bundleReady.value" />

    <template v-else>
      <!-- Direct, readable component selection -->
      <EditTexts v-if="props.activeTool === 'text'" @navigate="$emit('navigate', $event)" />

      <EditAssets
        v-else-if="props.activeTool === 'images' || props.activeTool === 'logos'"
        @navigate="$emit('navigate', $event)"
      />

      <EmptyState v-else />
    </template>
  </div>
</template>

<script setup lang="ts">
import { useSuspenseManager } from '@/composables/feedbackAsync/useSuspenseManager'
import EditTexts from './toolsMenu/textFields/EditTexts.vue'
import EditAssets from './toolsMenu/assets/EditAssets.vue'
import EmptyState from './toolsMenu/EmptyState.vue'
import EditTextsSkeleton from './toolsMenu/EditTextsSkeleton.vue'

const suspenseManager = useSuspenseManager()

interface Props {
  activeTool?: string
  activeSubView?: string
}

const props = withDefaults(defineProps<Props>(), {
  activeSubView: 'default',
})

defineEmits<{
  navigate: [subView: string]
}>()
</script>

<style scoped>
.tool-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);

  /* Ensure proper scrolling behavior */
  scrollbar-width: thin;
  scrollbar-color: var(--color-border-medium) var(--color-bg-secondary);
}

/* Webkit scrollbar styling */
.tool-area::-webkit-scrollbar {
  width: var(--spacing-sm);
}

.tool-area::-webkit-scrollbar-track {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-sm);
}

.tool-area::-webkit-scrollbar-thumb {
  background: var(--color-border-medium);
  border-radius: var(--radius-sm);
  transition: var(--transition-fast);
}

.tool-area::-webkit-scrollbar-thumb:hover {
  background: var(--color-border-dark);
}
</style>
