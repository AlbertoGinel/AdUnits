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
import EditTexts from './toolsMenu/EditTexts.vue'
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
  padding: 20px;
}
</style>
