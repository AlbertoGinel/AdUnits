<template>
  <div class="images-tool-menu">
    <!-- Dynamic page content using Vue's component system -->
    <div class="menu-content">
      <Transition name="slide" mode="out-in">
        <EditMainImage
          v-if="currentPage === 'edit'"
          key="edit"
          @navigate-to="handleNavigation"
          @action="handleAction"
        />
        <UploadImages
          v-else-if="currentPage === 'upload'"
          key="upload"
          @navigate-to="handleNavigation"
          @action="handleAction"
        />
        <ChangeImage
          v-else-if="currentPage === 'change'"
          key="change"
          @navigate-to="handleNavigation"
          @action="handleAction"
        />
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { toolRegistry } from '@/services/toolRegistry'
import EditMainImage from '../menuPages/editMainImage.vue'
import UploadImages from '../menuPages/UploadImages.vue'
import ChangeImage from '../menuPages/ChangeImage.vue'

interface Props {
  toolId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  action: [action: string, data?: Record<string, unknown>]
  'state-change': [state: Record<string, unknown>]
}>()

// Reactive tool state
const currentPage = ref('edit') // 'edit', 'upload', 'change'

// Get tool instance
const tool = computed(() => toolRegistry.getTool(props.toolId))

// Watch for tool state changes
watch(
  () => tool.value?.getState?.(),
  (newState) => {
    if (newState && newState.currentPage) {
      currentPage.value = (newState.currentPage as string) || 'edit'
    }
  },
  { deep: true, immediate: true },
)

// Navigation handler
const handleNavigation = (page: string) => {
  currentPage.value = page

  // Update tool state
  if (tool.value && tool.value.setState) {
    tool.value.setState({ currentPage: page })
  }

  emit('action', 'navigate', { page })
}

const handleAction = async (action: string, data?: Record<string, unknown>) => {
  await executeToolAction(action, data)
  emit('action', action, data)
}

const executeToolAction = async (actionType: string, data?: Record<string, unknown>) => {
  if (tool.value) {
    const result = await tool.value.executeAction({
      type: actionType,
      payload: { data },
    })

    // Update local state
    const newState = tool.value.getState?.()
    if (newState) {
      currentPage.value = (newState.currentPage as string) || 'edit'
      emit('state-change', newState)
    }

    return result
  }
}

onMounted(() => {
  // Initialize with current tool state
  if (tool.value) {
    const state = tool.value.getState?.()
    if (state) {
      currentPage.value = (state.currentPage as string) || 'edit'
    }
  }
})
</script>

<style scoped>
.images-tool-menu {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
}

.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  background: #f9f9f9;
}

.menu-header h4 {
  margin: 0;
  color: #333;
  font-weight: 600;
}

.page-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-dots {
  display: flex;
  gap: 4px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ddd;
  transition: background 0.2s;
}

.dot.active {
  background: #0066cc;
}

.page-text {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.menu-content {
  flex: 1;
  overflow: hidden;
}

/* Page transition animations */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
