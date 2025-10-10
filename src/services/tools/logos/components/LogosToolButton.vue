<template>
  <div
    class="logos-tool-button"
    :class="{ active: isActive }"
    @click="handleClick"
    title="Logos - Add brand logos and icons"
  >
    <div class="icon">🏢</div>
    <div class="label">Logos</div>
  </div>
</template>

<script setup lang="ts">
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

const handleClick = () => {
  emit('click', props.toolId)
}
</script>

<style scoped>
.logos-tool-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
  min-height: 60px;
  width: 60px;
  margin: 2px 0;
}

.logos-tool-button:hover {
  background: #f0f8ff;
  transform: translateY(-1px);
}

.logos-tool-button.active {
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

.logos-tool-button.active .label {
  color: #0066cc;
  font-weight: 600;
}
</style>
