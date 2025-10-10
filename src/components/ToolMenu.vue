<template>
  <div class="tool-menu">
    <!-- Menu header -->
    <div class="menu-header">
      <h4>{{ config.title }}</h4>
    </div>

    <!-- Menu content -->
    <div class="menu-content" :style="menuStyle">
      <div v-for="section in config.sections" :key="section.id" class="menu-section">
        <!-- Section title -->
        <div v-if="section.title" class="section-title">
          {{ section.title }}
        </div>

        <!-- Render section based on type -->
        <div class="section-content">
          <!-- Button sections -->
          <button
            v-if="section.type === 'button'"
            class="menu-button"
            :disabled="section.disabled"
            @click="handleButtonClick(section)"
          >
            {{ section.label }}
          </button>

          <!-- Input sections -->
          <input
            v-else-if="section.type === 'input'"
            v-model="sectionValues[section.id]"
            class="menu-input"
            :placeholder="section.placeholder"
            :disabled="section.disabled"
            @input="handleInputChange($event, section.id)"
          />

          <!-- Select sections -->
          <select
            v-else-if="section.type === 'select'"
            v-model="sectionValues[section.id]"
            class="menu-select"
            :disabled="section.disabled"
            @change="handleSelectChange($event, section.id)"
          >
            <option
              v-for="option in section.options"
              :key="String(option.value)"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>

          <!-- Slider sections -->
          <div v-else-if="section.type === 'slider'" class="slider-container">
            <input
              v-model.number="sectionValues[section.id]"
              type="range"
              class="menu-slider"
              :min="section.min || 0"
              :max="section.max || 100"
              :step="section.step || 1"
              :disabled="section.disabled"
              @input="handleSliderChange($event, section.id)"
            />
            <span class="slider-value">{{ sectionValues[section.id] }}</span>
          </div>

          <!-- Group sections -->
          <div v-else-if="section.type === 'group'" class="menu-group">
            <div v-for="child in section.children" :key="child.id" class="group-child">
              <div v-if="child.title" class="child-title">{{ child.title }}</div>
              <div class="child-content">
                <div class="section-placeholder">
                  <strong>{{ child.type }}</strong
                  >: {{ child.label }}
                </div>
              </div>
            </div>
          </div>

          <!-- Fallback for unknown types -->
          <div v-else class="section-placeholder">
            <strong>{{ section.type }}</strong
            >: {{ section.label }}
            <span v-if="section.value">= {{ section.value }}</span>
          </div>
        </div>

        <!-- Section description -->
        <div v-if="section.description" class="section-description">
          {{ section.description }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { ToolMenuConfig, ToolAction } from '@/types/toolService'

interface Props {
  config: ToolMenuConfig
  toolId: string
}

interface Emits {
  (e: 'action', action: ToolAction): void
  (e: 'stateChange', sectionId: string, value: unknown): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Internal state for menu values
const sectionValues = ref<Record<string, unknown>>({})

const menuStyle = computed(() => ({
  width: props.config.width ? `${props.config.width}px` : '100%',
  height: props.config.height ? `${props.config.height}px` : 'auto',
}))

// Handle button clicks
const handleButtonClick = (section: { action?: string; id: string; label?: string }) => {
  if (section.action) {
    console.log('🔘 Button clicked:', section.label, 'Action:', section.action)

    const action: ToolAction = {
      type: section.action,
      payload: {
        sectionId: section.id,
        toolId: props.toolId,
      },
    }
    emit('action', action)
  }
}

// Handle input changes
const handleInputChange = (event: Event, sectionId: string) => {
  const target = event.target as HTMLInputElement
  const value = target.value
  sectionValues.value[sectionId] = value
  emit('stateChange', sectionId, value)
}

// Handle select changes
const handleSelectChange = (event: Event, sectionId: string) => {
  const target = event.target as HTMLSelectElement
  const value = target.value
  sectionValues.value[sectionId] = value
  emit('stateChange', sectionId, value)
}

// Handle slider changes
const handleSliderChange = (event: Event, sectionId: string) => {
  const target = event.target as HTMLInputElement
  const value = Number(target.value)
  sectionValues.value[sectionId] = value
  emit('stateChange', sectionId, value)
}

// Initialize section values from config
const initializeSectionValues = () => {
  props.config.sections.forEach((section) => {
    if (section.value !== undefined) {
      sectionValues.value[section.id] = section.value
    }
  })
}

// Watch for config changes (for multi-page navigation)
watch(
  () => props.config,
  () => {
    initializeSectionValues()
  },
  { deep: true, immediate: true },
)

initializeSectionValues()
</script>

<style scoped>
.tool-menu {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
}

.menu-header {
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  background: #f8f9fa;
}

.menu-header h4 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.menu-content {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.menu-section {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.menu-section:last-child {
  border-bottom: none;
}

.section-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #555;
  margin-bottom: 12px;
}

.section-content {
  margin: 8px 0;
}

.section-description {
  font-size: 0.8rem;
  color: #666;
  margin-top: 8px;
  line-height: 1.4;
}

/* Button styles */
.menu-button {
  width: 100%;
  padding: 10px 16px;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.menu-button:hover:not(:disabled) {
  background: #1976d2;
}

.menu-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* Input styles */
.menu-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.menu-input:focus {
  outline: none;
  border-color: #2196f3;
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
}

/* Select styles */
.menu-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  background: white;
}

.menu-select:focus {
  outline: none;
  border-color: #2196f3;
}

/* Slider styles */
.slider-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.menu-slider {
  flex: 1;
  height: 6px;
  background: #ddd;
  border-radius: 3px;
  outline: none;
  cursor: pointer;
}

.slider-value {
  font-size: 0.9rem;
  font-weight: 500;
  color: #555;
  min-width: 40px;
  text-align: right;
}

/* Group styles */
.menu-group {
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  overflow: hidden;
}

.group-child {
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.group-child:last-child {
  border-bottom: none;
}

.child-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: #666;
  margin-bottom: 8px;
}

.child-content {
  margin: 4px 0;
}

/* Placeholder styles */
.section-placeholder {
  padding: 12px;
  background: #f8f9fa;
  border: 1px dashed #ddd;
  border-radius: 4px;
  color: #666;
  font-size: 0.9rem;
}
</style>
