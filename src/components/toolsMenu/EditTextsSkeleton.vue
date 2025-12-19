<!-- components/toolsMenu/EditTextsSkeleton.vue -->
<template>
  <div class="tool-menu">
    <h3 class="skeleton-section-title skeleton-loading"></h3>

    <!-- Main headline skeleton -->
    <div class="text-section">
      <div class="skeleton-section-title skeleton-loading"></div>
      <div class="skeleton-text-input-area skeleton-loading"></div>
    </div>

    <!-- Sub headline skeleton -->
    <div class="text-section">
      <div class="skeleton-section-title skeleton-loading"></div>
      <div class="skeleton-text-input-area skeleton-loading"></div>
    </div>

    <!-- Button CTA skeleton -->
    <div class="text-section">
      <div class="skeleton-section-title skeleton-loading"></div>
      <div class="skeleton-text-input-area small skeleton-loading"></div>
    </div>

    <hr class="divider" />

    <!-- Disclaimer skeleton -->
    <div class="disclaimer-section">
      <div class="skeleton-section-title skeleton-loading"></div>
      <div class="skeleton-disclaimer-textarea skeleton-loading"></div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
/* Match EditTexts.vue exactly */
.tool-menu {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 16px;
  background: #ffffff;
  border-radius: 8px;
  position: relative;
}

.menu-title {
  font-size: 18px;
  font-weight: 600;
  color: #212529;
  margin: 0 0 8px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #f8f9fa;
}

/* Match TextFieldSection.vue exactly */
.text-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

/* Match DisclaimerSection.vue exactly */
.disclaimer-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

/* Skeleton versions of real elements */
.skeleton-section-title {
  font-size: 14px;
  font-weight: 600;
  color: #495057;
  margin: 0;
  line-height: 1.4;
  background: #e9ecef;
  border-radius: 4px;
  width: 120px;
  height: 20px;
  position: relative;
  overflow: hidden;
}

.skeleton-text-input-area {
  width: 100%;
  height: 44px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  background: #f8f9fa;
  position: relative;
  overflow: hidden;
}

.skeleton-text-input-area.small {
  height: 36px;
}

.skeleton-disclaimer-textarea {
  width: 100%;
  height: 100px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  background: #f8f9fa;
  position: relative;
  overflow: hidden;
}

/* Shimmer animation for loading state */
.skeleton-loading::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
  animation: skeleton-shimmer 2s infinite;
}

.skeleton-section-title.skeleton-loading::before {
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
}

@keyframes skeleton-shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

.divider {
  border: none;
  border-top: 1px solid #dee2e6;
  margin: 16px 0;
}

/* Retry overlay */
.retry-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  border-radius: 8px;
}

.retry-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  max-width: 280px;
}

.retry-card h4 {
  font-size: 16px;
  font-weight: 600;
  color: #212529;
  margin: 0 0 8px 0;
}

.retry-card p {
  font-size: 13px;
  color: #6c757d;
  margin: 0 0 16px 0;
}

.retry-button {
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
}

.retry-button:hover {
  background: #0056b3;
}
</style>
