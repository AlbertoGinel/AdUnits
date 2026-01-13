<!-- components/ui/ToastContainer.vue -->
<template>
  <div class="toast-container">
    <div
      v-for="toast in notifications.toasts.value"
      :key="toast.id"
      :class="['toast', `toast-${toast.type}`]"
    >
      <div class="toast-content">
        <h4 class="toast-title">{{ toast.title }}</h4>
        <p class="toast-message">{{ toast.message }}</p>

        <div v-if="toast.actions" class="toast-actions">
          <button
            v-for="action in toast.actions"
            :key="action.label"
            @click="action.action"
            class="toast-action-btn"
          >
            {{ action.label }}
          </button>
        </div>
      </div>

      <button @click="notifications.removeToast(toast.id)" class="toast-close">×</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNotifications } from '@/features/feedbackAsync/useNotifications'

const notifications = useNotifications()
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.toast {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  padding: 16px;
  min-width: 320px;
  max-width: 400px;
  display: flex;
  gap: 12px;
  border-left: 4px solid;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.toast-error {
  border-left-color: #dc3545;
}
.toast-success {
  border-left-color: #28a745;
}
.toast-warning {
  border-left-color: #ffc107;
}
.toast-info {
  border-left-color: #007bff;
}

.toast-content {
  flex: 1;
}

.toast-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #212529;
}

.toast-message {
  font-size: 13px;
  color: #6c757d;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.toast-actions {
  display: flex;
  gap: 8px;
}

.toast-action-btn {
  padding: 4px 12px;
  border: 1px solid #007bff;
  background: white;
  color: #007bff;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.toast-action-btn:hover {
  background: #007bff;
  color: white;
}

.toast-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #6c757d;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.toast-close:hover {
  background: #f8f9fa;
  color: #212529;
}
</style>
