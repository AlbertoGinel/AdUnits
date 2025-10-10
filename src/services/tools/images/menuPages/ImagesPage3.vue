<template>
  <div class="images-page-3">
    <div class="page-header">
      <h5>🎨 Image Effects</h5>
      <p>Apply filters and adjustments</p>
    </div>

    <div class="page-content">
      <!-- Effect options -->
      <div class="effects-grid">
        <div 
          v-for="effect in effects" 
          :key="effect.id"
          class="effect-item"
          :class="{ active: selectedEffect === effect.id }"
          @click="selectEffect(effect.id)"
        >
          <div class="effect-preview">
            <span class="effect-icon">{{ effect.icon }}</span>
          </div>
          <div class="effect-name">{{ effect.name }}</div>
        </div>
      </div>

      <!-- Effect controls -->
      <div v-if="selectedEffect" class="effect-controls">
        <h6>Effect Settings</h6>
        <div class="control-item">
          <label>Intensity:</label>
          <input v-model="effectIntensity" type="range" min="0" max="100" class="slider">
          <span class="value">{{ effectIntensity }}%</span>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <button class="nav-button secondary" @click="$emit('back-to-start')">
        <span class="arrow">←</span>
        <span>Back to Library</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface EffectData {
  id: string
  name: string
  icon: string
}

const emit = defineEmits<{
  'back-to-start': []
  action: [action: string, data?: Record<string, unknown>]
}>()

const selectedEffect = ref<string | null>(null)
const effectIntensity = ref(50)

const effects = ref<EffectData[]>([
  { id: 'blur', name: 'Blur', icon: '🌫️' },
  { id: 'brightness', name: 'Brightness', icon: '☀️' },
  { id: 'contrast', name: 'Contrast', icon: '◑' },
  { id: 'sepia', name: 'Sepia', icon: '🟤' },
  { id: 'grayscale', name: 'Grayscale', icon: '⚪' },
  { id: 'invert', name: 'Invert', icon: '🔄' },
])

const selectEffect = (effectId: string) => {
  selectedEffect.value = effectId
  emit('action', 'selectEffect', { 
    effect: effectId, 
    intensity: effectIntensity.value 
  })
}
</script>

<style scoped>
.images-page-3 {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.effects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.effect-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  border: 1px solid #eee;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.effect-item:hover {
  border-color: #0066cc;
  background: #f8f9fa;
}

.effect-item.active {
  border-color: #0066cc;
  background: #e8f4fd;
}

.effect-preview {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.effect-icon {
  font-size: 24px;
}

.effect-name {
  font-size: 11px;
  text-align: center;
}

.effect-controls {
  padding: 16px;
  background: #f9f9f9;
  border-radius: 6px;
  flex: 1;
}

.effect-controls h6 {
  margin: 0 0 16px 0;
  color: #333;
}

.control-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.control-item label {
  font-size: 14px;
  color: #666;
  min-width: 60px;
}

.slider {
  flex: 1;
}

.value {
  font-size: 12px;
  color: #666;
  min-width: 40px;
  text-align: right;
}

.page-header h5 {
  margin: 0 0 8px 0;
  color: #333;
}

.page-header p {
  margin: 0 0 20px 0;
  color: #666;
  font-size: 14px;
}

.page-footer {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.nav-button {
  width: 100%;
  padding: 12px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.2s;
}

.nav-button.secondary {
  background: #6c757d;
  color: white;
}

.nav-button:hover {
  background: #5a6268;
}

.arrow {
  font-size: 16px;
}
</style>