<template>
  <div class="images-tool-menu">
    <!-- Header with tool info -->
    <div class="menu-header">
      <h4>🖼️ Images</h4>
      <div class="page-indicator">
        <span class="page-dots">
          <span
            v-for="page in totalPages"
            :key="page"
            class="dot"
            :class="{ active: page === currentPage }"
          ></span>
        </span>
        <span class="page-text">{{ currentPage }} / {{ totalPages }}</span>
      </div>
    </div>

    <!-- Dynamic page content using Vue's component system -->
    <div class="menu-content">
      <Transition name="slide" mode="out-in">
        <ImagesPage1
          v-if="currentPage === 1"
          key="page1"
          @next-page="handleNextPage"
          @action="handleAction"
        />
        <ImagesPage2
          v-else-if="currentPage === 2"
          key="page2"
          @next-page="handleNextPage"
          @action="handleAction"
        />
        <ImagesPage3
          v-else-if="currentPage === 3"
          key="page3"
          @back-to-start="handleBackToStart"
          @action="handleAction"
        />
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { toolRegistry } from '@/services/toolRegistry'
import ImagesPage1 from '../menuPages/ImagesPage1.vue'
import ImagesPage2 from '../menuPages/ImagesPage2.vue'
import ImagesPage3 from '../menuPages/ImagesPage3.vue'

interface Props {
  toolId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  action: [action: string, data?: Record<string, unknown>]
  'state-change': [state: Record<string, unknown>]
}>()

// Reactive tool state
const currentPage = ref(1)
const totalPages = ref(3)

// Get tool instance
const tool = computed(() => toolRegistry.getTool(props.toolId))

// Watch for tool state changes
watch(
  () => tool.value?.getState?.(),
  (newState) => {
    if (newState) {
      currentPage.value = (newState.currentPage as number) || 1
      totalPages.value = (newState.totalPages as number) || 3
    }
  },
  { deep: true, immediate: true },
)

// Event handlers
const handleNextPage = async () => {
  await executeToolAction('nextPage')
}

const handleBackToStart = async () => {
  await executeToolAction('nextPage') // Circular navigation
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
      currentPage.value = (newState.currentPage as number) || 1
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
      currentPage.value = (state.currentPage as number) || 1
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
