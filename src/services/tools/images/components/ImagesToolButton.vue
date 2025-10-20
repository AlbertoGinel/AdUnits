<template>
  <div
    class="images-tool-button"
    :class="{ active: isActive }"
    @click="handleClick"
    :title="tooltip"
  >
    <div class="icon">🖼️</div>
    <div class="label">Images</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  toolId: string
  isActive?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isActive: false,
})

const emit = defineEmits<{
  click: [toolId: string]
}>()

const tooltip = computed(() => `Images Tool - Add and manage images`)

const handleClick = () => {
  emit('click', props.toolId)
}
</script>

<style scoped>
.images-tool-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
  position: relative;
  min-height: 60px;
  width: 60px;
  margin: 2px 0;
}

.images-tool-button:hover {
  background: #f0f8ff;
  transform: translateY(-1px);
}

.images-tool-button.active {
  background: #e8f4fd;
  border: 2px solid #0066cc;
}

.icon {
  font-size: 20px;
  margin-bottom: 4px;
}

.label {
  font-size: 10px;
  color: #666;
  text-align: center;
  font-weight: 500;
}

.images-tool-button.active .label {
  color: #0066cc;
  font-weight: 600;
}
</style>
