<!-- components/SingleIcon.vue -->
<template>
  <span v-if="svgContent" class="icon" :class="sizeClass" v-html="svgContent"></span>
  <span v-else class="icon icon-error" :class="sizeClass" :title="`Icon '${name}' not found`">
    icon
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useIcons, type IconName } from '@/features/utils/useIcons'

interface Props {
  name: IconName
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
})

const icons = useIcons()

// Get SVG content with validation
const svgContent = computed(() => {
  const content = icons.getIcon(props.name as IconName)

  if (!content) {
    console.warn(`⚠️ SingleIcon: Icon '${props.name}' not found in icon library`)
    console.log('Available icons:', icons.getAvailableIcons())
    return ''
  }

  return content
})

// Size mapping
const sizeClass = computed(() => `icon-${props.size}`)
</script>

<style scoped>
.icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.icon :deep(svg) {
  width: 100%;
  height: 100%;
  display: block;
}

.icon-sm {
  width: 16px;
  height: 16px;
}

.icon-md {
  width: 20px;
  height: 20px;
}

.icon-lg {
  width: 24px;
  height: 24px;
}

.icon-xl {
  width: 32px;
  height: 32px;
}

.icon-error {
  color: #dc3545;
  font-size: 0.8em;
}
</style>
