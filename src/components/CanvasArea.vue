<template>
  <div class="canvas-area">
    <div class="canvas-header">
      <h3>Canvas Area</h3>
    </div>
    <div class="canvas-content">
      <div class="canvas-info">
        <p>Canvas properties and settings will appear here.</p>
        <div class="canvas-properties"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Canvas area component logic
</script>

<style scoped>
.canvas-area {
  background: white;
  color: #333;
  display: flex;
  flex-direction: column;
  border-left: 1px solid #e0e0e0;
}

.canvas-header {
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  background: #f9f9f9;
}

.canvas-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.canvas-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.canvas-info {
  background: #f9f9f9;
  border-radius: 6px;
  padding: 16px;
  border: 1px solid #e0e0e0;
}

.canvas-info p {
  margin: 0 0 16px 0;
  color: #666;
}

.canvas-properties {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.property-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e8e8e8;
}

.property-item:last-child {
  border-bottom: none;
}

.property-item label {
  font-weight: 500;
  color: #555;
}

.property-item span {
  font-family: monospace;
  background: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.9rem;
  border: 1px solid #ddd;
  color: #333;
}
</style>
