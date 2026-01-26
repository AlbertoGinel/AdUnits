<template>
  <div class="layer-item" @click="handleClick">
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
}

interface Emits {
  (e: 'click'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const handleClick = () => {
  emit('click')
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
