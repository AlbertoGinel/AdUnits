<template>
  <div class="tools-area">
    <div class="tools-area-header">
      <h4>{{ currentToolName }}</h4>
    </div>
    <div class="tools-area-content">
      <component :is="currentToolComponent" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Placeholder for tool area - will be replaced with banner editing interface

const currentToolName = computed(() => 'Banner Editor')

const currentToolComponent = computed(() => 'div')
</script>

<style scoped>
.tools-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
}

.tools-area-header {
  background: white;
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
}

.tools-area-header h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}

.tools-area-content {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}
</style>
