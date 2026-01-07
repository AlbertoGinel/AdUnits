<template>
  <div class="layer-item">
    <SingleIcon :name="iconName" size="md" class="layer-icon" />
    <span class="text-bentonville-sm-400">{{ name }}</span>
  </div>
</template>

<script setup lang="ts">
import SingleIcon from '@/components/SingleIcon.vue'
import type { IconName } from '@/composables/utils/useIcons'

interface Props {
  iconName: IconName
  name: string
}

defineProps<Props>()
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
