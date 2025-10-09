<template>
  <div class="shapes-menu">
    <div class="section-header">
      <h5>Shapes</h5>
    </div>

    <div class="shapes-categories">
      <div class="category-section">
        <h6>Basic Shapes</h6>
        <div class="shapes-grid">
          <div
            v-for="shape in basicShapes"
            :key="shape.id"
            class="shape-item"
            @click="addShape(shape)"
            :title="shape.name"
          >
            <div class="shape-preview" :class="shape.cssClass">
              <span v-if="shape.icon">{{ shape.icon }}</span>
            </div>
            <span class="shape-name">{{ shape.name }}</span>
          </div>
        </div>
      </div>

      <div class="category-section">
        <h6>Icons & Symbols</h6>
        <div class="shapes-grid">
          <div
            v-for="icon in iconShapes"
            :key="icon.id"
            class="shape-item"
            @click="addShape(icon)"
            :title="icon.name"
          >
            <div class="shape-preview icon-preview">
              <span class="icon">{{ icon.icon }}</span>
            </div>
            <span class="shape-name">{{ icon.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="shape-properties">
      <h6>Properties</h6>
      <div class="property-controls">
        <div class="property-row">
          <label>Fill Color:</label>
          <input type="color" v-model="shapeProps.fillColor" />
        </div>
        <div class="property-row">
          <label>Border Color:</label>
          <input type="color" v-model="shapeProps.borderColor" />
        </div>
        <div class="property-row">
          <label>Border Width:</label>
          <input type="range" min="0" max="10" v-model="shapeProps.borderWidth" />
          <span>{{ shapeProps.borderWidth }}px</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

type ShapeItem = {
  id: string
  name: string
  type: string
  icon?: string
  cssClass?: string
}

const basicShapes = ref<ShapeItem[]>([
  { id: 'rectangle', name: 'Rectangle', type: 'rectangle', cssClass: 'rectangle-shape' },
  { id: 'circle', name: 'Circle', type: 'circle', cssClass: 'circle-shape' },
  { id: 'triangle', name: 'Triangle', type: 'triangle', cssClass: 'triangle-shape' },
  { id: 'diamond', name: 'Diamond', type: 'diamond', cssClass: 'diamond-shape' },
  { id: 'pentagon', name: 'Pentagon', type: 'pentagon', cssClass: 'pentagon-shape' },
  { id: 'hexagon', name: 'Hexagon', type: 'hexagon', cssClass: 'hexagon-shape' },
])

const iconShapes = ref<ShapeItem[]>([
  { id: 'star', name: 'Star', type: 'icon', icon: '⭐' },
  { id: 'heart', name: 'Heart', type: 'icon', icon: '❤️' },
  { id: 'arrow-right', name: 'Arrow Right', type: 'icon', icon: '➡️' },
  { id: 'arrow-left', name: 'Arrow Left', type: 'icon', icon: '⬅️' },
  { id: 'arrow-up', name: 'Arrow Up', type: 'icon', icon: '⬆️' },
  { id: 'arrow-down', name: 'Arrow Down', type: 'icon', icon: '⬇️' },
  { id: 'check', name: 'Check', type: 'icon', icon: '✅' },
  { id: 'cross', name: 'Cross', type: 'icon', icon: '❌' },
])

const shapeProps = ref({
  fillColor: '#4CAF50',
  borderColor: '#2E7D32',
  borderWidth: 2,
})

const addShape = (shape: ShapeItem) => {
  console.log('Adding shape:', shape, 'with properties:', shapeProps.value)
  // Implementation for adding shape to canvas
}
</script>

<style scoped>
.shapes-menu {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.section-header {
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}

.section-header h5 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}

.shapes-categories {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
}

.category-section {
  margin-bottom: 24px;
}

.category-section h6 {
  margin: 0 0 12px 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #555;
}

.shapes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 12px;
}

.shape-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.shape-item:hover {
  background: #f0f0f0;
  border-color: #4caf50;
  transform: translateY(-2px);
}

.shape-preview {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 6px;
  position: relative;
}

.rectangle-shape {
  background: #4caf50;
  border: 2px solid #2e7d32;
  border-radius: 4px;
}

.circle-shape {
  background: #2196f3;
  border: 2px solid #1565c0;
  border-radius: 50%;
}

.triangle-shape {
  width: 0;
  height: 0;
  border-left: 20px solid transparent;
  border-right: 20px solid transparent;
  border-bottom: 35px solid #ff9800;
}

.diamond-shape {
  width: 30px;
  height: 30px;
  background: #9c27b0;
  border: 2px solid #6a1b9a;
  transform: rotate(45deg);
}

.pentagon-shape {
  width: 35px;
  height: 35px;
  background: #f44336;
  border: 2px solid #c62828;
  clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
}

.hexagon-shape {
  width: 35px;
  height: 35px;
  background: #00bcd4;
  border: 2px solid #0097a7;
  clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
}

.icon-preview {
  background: #f5f5f5;
  border: 2px solid #ddd;
  border-radius: 8px;
}

.icon-preview .icon {
  font-size: 1.5rem;
}

.shape-name {
  font-size: 0.7rem;
  text-align: center;
  color: #666;
  line-height: 1.2;
}

.shape-properties {
  border-top: 1px solid #eee;
  padding: 16px 20px;
  background: #fafafa;
}

.shape-properties h6 {
  margin: 0 0 12px 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
}

.property-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.property-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
}

.property-row label {
  min-width: 80px;
  color: #555;
  font-weight: 500;
}

.property-row input[type='color'] {
  width: 40px;
  height: 30px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.property-row input[type='range'] {
  flex: 1;
}

.property-row span {
  min-width: 35px;
  text-align: right;
  color: #666;
  font-family: monospace;
}
</style>
