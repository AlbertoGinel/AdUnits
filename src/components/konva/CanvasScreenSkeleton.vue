<template>
  <div class="canvas-screen">
    <div class="skeleton-canvas">
      <!-- Grid pattern for bulk mode skeleton -->
      <div v-if="viewState?.isBulkMode?.value" class="bulk-mode-parent">
        <div class="div1"></div>
        <div class="div2"></div>
        <div class="div3"></div>
        <div class="div4"></div>
        <div class="div5"></div>
        <div class="div6"></div>
        <div class="div7"></div>
        <div class="div8"></div>
        <div class="div9"></div>
      </div>

      <!-- Single focused item for focus mode skeleton -->
      <div v-else-if="viewState?.isFocusMode?.value" class="focus-mode-parent">
        <div class="div1"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useViewState } from '@/composables/view/useViewState'

const viewState = useViewState()
</script>

<style scoped>
.canvas-screen {
  width: 100%;
  height: 100%;
  overflow: hidden;
  border: 0px solid blue;
  box-sizing: border-box;
  position: relative;
}

.skeleton-canvas {
  width: 100%;
  height: 100%;
  background: #f8f9fa;
  border-radius: 4px;
  position: relative;
  padding: 16px;
  box-sizing: border-box;
}

/* Bulk mode skeleton - custom grid layout */
.bulk-mode-parent {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  grid-template-rows: repeat(10, 1fr);
  grid-column-gap: 16px;
  grid-row-gap: 16px;
  width: 100%;
  height: 100%;
}

.bulk-mode-parent .div1 {
  grid-area: 1 / 1 / 2 / 6;
  background: #e9ecef;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.bulk-mode-parent .div2 {
  grid-area: 2 / 1 / 3 / 8;
  background: #e9ecef;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.bulk-mode-parent .div3 {
  grid-area: 3 / 1 / 5 / 10;
  background: #e9ecef;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.bulk-mode-parent .div4 {
  grid-area: 5 / 1 / 8 / 5;
  background: #e9ecef;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.bulk-mode-parent .div5 {
  grid-area: 5 / 5 / 8 / 8;
  background: #e9ecef;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.bulk-mode-parent .div6 {
  grid-area: 5 / 8 / 7 / 10;
  background: #e9ecef;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.bulk-mode-parent .div7 {
  grid-area: 8 / 1 / 11 / 4;
  background: #e9ecef;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.bulk-mode-parent .div8 {
  grid-area: 8 / 4 / 11 / 8;
  background: #e9ecef;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.bulk-mode-parent .div9 {
  grid-area: 8 / 8 / 11 / 11;
  background: #e9ecef;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

/* Focus mode skeleton - single large item */
.focus-mode-parent {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  grid-template-rows: repeat(10, 1fr);
  grid-column-gap: 8px;
  grid-row-gap: 8px;
  width: 100%;
  height: 100%;
}

.focus-mode-parent .div1 {
  grid-area: 1 / 1 / 5 / 8;
  background: #e9ecef;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}

/* Skeleton controls */
.skeleton-controls {
  position: absolute;
  bottom: 16px;
  right: 16px;
  display: flex;
  gap: 8px;
}

.skeleton-zoom-control {
  width: 32px;
  height: 32px;
  background: #e9ecef;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.skeleton-reset-button {
  width: 80px;
  height: 32px;
  background: #e9ecef;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

/* Shimmer animation */
@keyframes skeleton-shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

/* Add shimmer animation to all skeleton elements */
.bulk-mode-parent .div1::before,
.bulk-mode-parent .div2::before,
.bulk-mode-parent .div3::before,
.bulk-mode-parent .div4::before,
.bulk-mode-parent .div5::before,
.bulk-mode-parent .div6::before,
.bulk-mode-parent .div7::before,
.bulk-mode-parent .div8::before,
.bulk-mode-parent .div9::before,
.focus-mode-parent .div1::before,
.skeleton-zoom-control::before,
.skeleton-reset-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
  animation: skeleton-shimmer 1.5s infinite;
}

/* Add subtle fade-in animation */
@keyframes fadeIn {
  from {
    opacity: 0.5;
  }
  to {
    opacity: 1;
  }
}

.skeleton-canvas {
  animation: fadeIn 0.3s ease-out;
}
</style>
