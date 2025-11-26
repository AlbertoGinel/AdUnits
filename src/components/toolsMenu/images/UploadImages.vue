<!-- components/toolsMenu/UploadImages.vue -->
<template>
  <div class="empty-state">
    <div class="empty-content">
      <div class="empty-icon">🛠️</div>
      <h3 class="empty-title">UploadImages</h3>
    </div>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 400px;
  padding: 40px;
}

.empty-content {
  text-align: center;
  max-width: 400px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.6;
}

.empty-title {
  font-size: 24px;
  font-weight: 600;
  color: #343a40;
  margin-bottom: 12px;
}

.empty-description {
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 32px;
  line-height: 1.6;
}

.tool-hints {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: flex-start;
  margin: 0 auto;
  width: fit-content;
}

.hint-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  transition: all 0.2s;
  cursor: default;
}

.hint-item:hover {
  background: #e9ecef;
  transform: translateX(4px);
}

.hint-icon {
  font-size: 24px;
}

.hint-item span:last-child {
  font-size: 14px;
  color: #495057;
  font-weight: 500;
}
</style>
