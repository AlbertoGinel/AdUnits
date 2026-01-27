<template>
  <div
    class="layer-item"
    @click="handleClick"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <SingleIcon :name="iconName" size="md" class="layer-icon" />
    <span class="text-bentonville-sm-400">{{ name }}</span>
  </div>
</template>

<script setup lang="ts">
import SingleIcon from '../uiApp/SingleIcon.vue'
import type { IconName } from '@/features/utils/useIcons'

interface Props {
  iconName: IconName
  name: string
  id: string
}

interface Emits {
  (e: 'click'): void
  (e: 'hover', id: string): void
  (e: 'hoverEnd'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const handleClick = () => {
  emit('click')
}

const handleMouseEnter = () => {
  emit('hover', props.id)
}

const handleMouseLeave = () => {
  emit('hoverEnd')
}
</script>

<style scoped>
.layer-item {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.layer-item:hover {
  background-color: #f5f7fa;
  border-color: #001e60;
}

.layer-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
