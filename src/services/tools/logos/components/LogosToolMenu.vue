<template>
  <div class="logos-tool-menu">
    <!-- Simple content -->
    <div class="menu-content">
      <div class="logos-section">
        <h5>Brand Logos</h5>
        <div class="logos-grid">
          <div
            v-for="logo in sampleLogos"
            :key="logo.id"
            class="logo-item"
            @click="selectLogo(logo)"
          >
            <div class="logo-preview">
              <span class="logo-icon">{{ logo.icon }}</span>
            </div>
            <div class="logo-name">{{ logo.name }}</div>
          </div>

          <!-- Add new logo -->
          <div class="logo-item add-new" @click="uploadLogo">
            <div class="logo-preview">
              <span class="add-icon">➕</span>
            </div>
            <div class="logo-name">Upload Logo</div>
          </div>
        </div>
      </div>

      <!-- Simple controls -->
      <div class="controls-section">
        <h5>Logo Settings</h5>
        <div class="control-item">
          <label>Size:</label>
          <input
            v-model="logoSize"
            type="range"
            min="50"
            max="200"
            class="slider"
            @input="updateControls"
          />
          <span class="value">{{ logoSize }}px</span>
        </div>
        <div class="control-item">
          <label>Opacity:</label>
          <input
            v-model="logoOpacity"
            type="range"
            min="0"
            max="100"
            class="slider"
            @input="updateControls"
          />
          <span class="value">{{ logoOpacity }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  toolId: string
}

defineProps<Props>()

const emit = defineEmits<{
  action: [action: string, data?: Record<string, unknown>]
  'state-change': [state: Record<string, unknown>]
}>()

interface LogoData {
  id: number
  name: string
  icon: string
}

// Simple logo data
const sampleLogos = ref<LogoData[]>([
  { id: 1, name: 'Company Logo', icon: '🏢' },
  { id: 2, name: 'Brand Mark', icon: '🎯' },
  { id: 3, name: 'App Icon', icon: '📱' },
  { id: 4, name: 'Website Logo', icon: '🌐' },
])

// Simple controls
const logoSize = ref(100)
const logoOpacity = ref(100)

const selectLogo = (logo: LogoData) => {
  console.log('🏢 Selected logo:', logo.name)
  emit('action', 'selectLogo', { logo })
}

const uploadLogo = () => {
  console.log('📤 Upload logo clicked')
  emit('action', 'uploadLogo')
}

// Watch for control changes
const updateControls = () => {
  emit('state-change', {
    size: logoSize.value,
    opacity: logoOpacity.value,
  })
}
</script>

<style scoped>
.logos-tool-menu {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
}

.menu-header {
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  background: #f9f9f9;
}

.menu-header h4 {
  margin: 0;
  color: #333;
  font-weight: 600;
}

.menu-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.logos-section,
.controls-section {
  margin-bottom: 24px;
}

.logos-section h5,
.controls-section h5 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 14px;
}

.logos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 12px;
}

.logo-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  border: 1px solid #eee;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.logo-item:hover {
  border-color: #0066cc;
  background: #f8f9fa;
}

.logo-item.add-new {
  border-style: dashed;
  color: #666;
}

.logo-preview {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.logo-icon {
  font-size: 24px;
}

.add-icon {
  font-size: 20px;
  color: #0066cc;
}

.logo-name {
  font-size: 11px;
  text-align: center;
  word-break: break-word;
}

.control-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
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
</style>
