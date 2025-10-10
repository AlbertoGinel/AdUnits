<template>
  <div
    class="tools-bar-button"
    :class="{
      active: isActive,
      disabled: config.disabled,
      'has-badge': config.badge,
    }"
    :title="config.tooltip || config.label"
    @click="handleClick"
  >
    <!-- Tool icon -->
    <div class="button-icon">
      <span class="icon">{{ config.icon }}</span>

      <!-- Badge indicator -->
      <span
        v-if="config.badge"
        class="badge"
        :class="{ 'badge-number': typeof config.badge === 'number' }"
      >
        {{ config.badge }}
      </span>
    </div>

    <!-- Tool label -->
    <div class="button-label">
      {{ config.label }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ToolButtonConfig } from '@/types/toolService'

interface Props {
  config: ToolButtonConfig
  isActive?: boolean
}

interface Emits {
  (e: 'click', toolId: string): void
}

const props = withDefaults(defineProps<Props>(), {
  isActive: false,
})

const emit = defineEmits<Emits>()

const handleClick = () => {
  if (!props.config.disabled) {
    emit('click', props.config.id)
  }
}
</script>

<style scoped>
.tools-bar-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 4px;
  margin: 2px 0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
  border: 1px solid transparent;
  position: relative;
  user-select: none;
}

.tools-bar-button:hover:not(.disabled) {
  background: #e3f2fd;
  border-color: #2196f3;
  transform: translateY(-1px);
}

.tools-bar-button.active {
  background: #1976d2;
  color: white;
  border-color: #1565c0;
}

.tools-bar-button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.button-icon {
  position: relative;
  margin-bottom: 4px;
}

.icon {
  font-size: 1.2rem;
  display: block;
  line-height: 1;
}

.badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: #ff4444;
  color: white;
  font-size: 0.7rem;
  font-weight: bold;
  border-radius: 50%;
  min-width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

.badge.badge-number {
  background: #2196f3;
}

.button-label {
  font-size: 0.6rem;
  font-weight: 500;
  text-align: center;
  color: inherit;
  line-height: 1.1;
  max-width: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tools-bar-button.active .button-label {
  color: white;
}
</style>
