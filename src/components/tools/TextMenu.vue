<template>
  <div class="text-menu">
    <div class="section-header">
      <h5>Text</h5>
    </div>

    <div class="text-options">
      <div class="quick-text-section">
        <h6>Quick Add</h6>
        <div class="quick-text-buttons">
          <button class="quick-text-btn" @click="addText('heading')">
            <span class="text-icon">H1</span>
            Heading
          </button>
          <button class="quick-text-btn" @click="addText('subheading')">
            <span class="text-icon">H2</span>
            Subheading
          </button>
          <button class="quick-text-btn" @click="addText('body')">
            <span class="text-icon">Aa</span>
            Body Text
          </button>
        </div>
      </div>

      <div class="text-input-section">
        <h6>Custom Text</h6>
        <div class="text-input-area">
          <textarea
            v-model="customText"
            placeholder="Enter your text here..."
            rows="3"
            class="text-input"
          >
          </textarea>
          <button class="add-text-btn" @click="addCustomText" :disabled="!customText.trim()">
            Add Text
          </button>
        </div>
      </div>

      <div class="font-section">
        <h6>Font Properties</h6>
        <div class="font-controls">
          <div class="control-row">
            <label>Font Family:</label>
            <select v-model="textProps.fontFamily" class="font-select">
              <option value="Arial">Arial</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Georgia">Georgia</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Verdana">Verdana</option>
              <option value="Impact">Impact</option>
              <option value="Comic Sans MS">Comic Sans MS</option>
            </select>
          </div>

          <div class="control-row">
            <label>Font Size:</label>
            <input type="range" min="8" max="72" v-model="textProps.fontSize" class="size-slider" />
            <span class="size-display">{{ textProps.fontSize }}px</span>
          </div>

          <div class="control-row">
            <label>Color:</label>
            <input type="color" v-model="textProps.color" class="color-picker" />
          </div>

          <div class="control-row style-buttons">
            <button class="style-btn" :class="{ active: textProps.bold }" @click="toggleBold">
              <strong>B</strong>
            </button>
            <button class="style-btn" :class="{ active: textProps.italic }" @click="toggleItalic">
              <em>I</em>
            </button>
            <button
              class="style-btn"
              :class="{ active: textProps.underline }"
              @click="toggleUnderline"
            >
              <u>U</u>
            </button>
          </div>

          <div class="control-row align-buttons">
            <button
              class="align-btn"
              :class="{ active: textProps.textAlign === 'left' }"
              @click="setAlignment('left')"
            >
              ⬅️
            </button>
            <button
              class="align-btn"
              :class="{ active: textProps.textAlign === 'center' }"
              @click="setAlignment('center')"
            >
              ↔️
            </button>
            <button
              class="align-btn"
              :class="{ active: textProps.textAlign === 'right' }"
              @click="setAlignment('right')"
            >
              ➡️
            </button>
          </div>
        </div>
      </div>

      <div class="text-effects-section">
        <h6>Text Effects</h6>
        <div class="effects-controls">
          <div class="control-row">
            <label>Shadow:</label>
            <input type="checkbox" v-model="textProps.shadow" class="effect-checkbox" />
            <div v-if="textProps.shadow" class="shadow-controls">
              <input type="color" v-model="textProps.shadowColor" class="color-picker small" />
              <input
                type="range"
                min="0"
                max="10"
                v-model="textProps.shadowBlur"
                class="small-slider"
              />
            </div>
          </div>

          <div class="control-row">
            <label>Stroke:</label>
            <input type="checkbox" v-model="textProps.stroke" class="effect-checkbox" />
            <div v-if="textProps.stroke" class="stroke-controls">
              <input type="color" v-model="textProps.strokeColor" class="color-picker small" />
              <input
                type="range"
                min="1"
                max="5"
                v-model="textProps.strokeWidth"
                class="small-slider"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const customText = ref('')
const textProps = ref({
  fontFamily: 'Arial',
  fontSize: 24,
  color: '#333333',
  bold: false,
  italic: false,
  underline: false,
  textAlign: 'left' as 'left' | 'center' | 'right',
  shadow: false,
  shadowColor: '#000000',
  shadowBlur: 3,
  stroke: false,
  strokeColor: '#000000',
  strokeWidth: 1,
})

const addText = (type: string) => {
  let text = ''
  let fontSize = textProps.value.fontSize

  switch (type) {
    case 'heading':
      text = 'Your Heading Here'
      fontSize = 48
      break
    case 'subheading':
      text = 'Your Subheading Here'
      fontSize = 32
      break
    case 'body':
      text = 'Your body text here'
      fontSize = 18
      break
  }

  console.log('Adding text:', text, 'with properties:', { ...textProps.value, fontSize })
}

const addCustomText = () => {
  if (customText.value.trim()) {
    console.log('Adding custom text:', customText.value, 'with properties:', textProps.value)
    customText.value = ''
  }
}

const toggleBold = () => {
  textProps.value.bold = !textProps.value.bold
}

const toggleItalic = () => {
  textProps.value.italic = !textProps.value.italic
}

const toggleUnderline = () => {
  textProps.value.underline = !textProps.value.underline
}

const setAlignment = (align: 'left' | 'center' | 'right') => {
  textProps.value.textAlign = align
}
</script>

<style scoped>
.text-menu {
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

.text-options {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.quick-text-section h6,
.text-input-section h6,
.font-section h6,
.text-effects-section h6 {
  margin: 0 0 12px 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #555;
}

.quick-text-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quick-text-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: linear-gradient(135deg, #f5f5f5, #e0e0e0);
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.quick-text-btn:hover {
  background: linear-gradient(135deg, #e0e0e0, #d0d0d0);
  transform: translateY(-1px);
}

.text-icon {
  font-weight: bold;
  color: #666;
  min-width: 24px;
}

.text-input-area {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.text-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-family: inherit;
  font-size: 0.9rem;
  resize: vertical;
}

.text-input:focus {
  outline: none;
  border-color: #4caf50;
}

.add-text-btn {
  background: linear-gradient(135deg, #4caf50, #45a049);
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s;
}

.add-text-btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.add-text-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.font-controls,
.effects-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.control-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
}

.control-row label {
  min-width: 70px;
  color: #555;
  font-weight: 500;
}

.font-select {
  flex: 1;
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.8rem;
}

.size-slider {
  flex: 1;
}

.size-display {
  min-width: 35px;
  text-align: right;
  color: #666;
  font-family: monospace;
  font-size: 0.8rem;
}

.color-picker {
  width: 40px;
  height: 25px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.color-picker.small {
  width: 30px;
  height: 20px;
}

.style-buttons {
  gap: 4px;
  justify-content: flex-start;
}

.style-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.style-btn:hover,
.style-btn.active {
  background: #4caf50;
  color: white;
  border-color: #4caf50;
}

.align-buttons {
  gap: 4px;
  justify-content: flex-start;
}

.align-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  transition: all 0.2s;
}

.align-btn:hover,
.align-btn.active {
  background: #2196f3;
  color: white;
  border-color: #2196f3;
}

.effect-checkbox {
  width: 16px;
  height: 16px;
}

.shadow-controls,
.stroke-controls {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-left: 8px;
}

.small-slider {
  width: 60px;
}
</style>
