<template>
  <nav class="top-navbar">
    <div class="navbar-left">
      <div class="aderize-icon" v-html="aderizeLogo"></div>
      <h1 class="app-title">Creative builder</h1>
      <h1 class="connect-account">Walmart account connected</h1>
    </div>

    <div class="navbar-center">
      <span class="project-name">Example Creative for demo</span>
    </div>

    <div class="navbar-right">
      <div class="icon" v-html="notificationBellLogo"></div>
      <div class="icon" v-html="chatBubbleLogo"></div>

      <button class="nav-btn profile-btn">
        <span></span>
      </button>
      <button class="nav-btn share-btn">
        <span class="profile-icon">Share</span>
      </button>
      <button class="nav-btn preview-btn">
        <span class="profile-icon">Preview & submit</span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useIcons } from '@/features/utils/useIcons'

const { getIcon } = useIcons()
const aderizeLogo = getIcon('aderizeLogo')
const notificationBellLogo = getIcon('notificationBell')
const chatBubbleLogo = getIcon('chatBubble')
</script>

<style scoped>
.top-navbar {
  background: var(--True-blue, #0053e2);
  height: 48px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg);
  max-width: 100%;
}

.connect-account {
  color: var(--Sky-Blue, #a9ddf7);
  font-family: var(--font-family-primary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-regular);
  margin: 0;
}

.navbar-left {
  display: flex;
  align-items: center;
}

.app-title {
  color: var(--White, #fff);
  font-family: var(--font-family-primary);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  margin: var(--spacing-md);
}

.navbar-center {
  display: flex;
  align-items: center;
  flex: 1;
  justify-content: center;
}

.project-name {
  padding: 6px 16px;
  border-radius: 20px;
  color: var(--White, #fff);
  font-family: var(--font-family-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-regular);
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-btn {
  cursor: pointer;
  font-family: var(--font-family-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  transition: all 0.2s ease;
  display: flex;
  height: 32px;
  padding: 0 16px;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.nav-btn:hover {
  background: #f5f5f5;
  border-color: #ccc;
}

.profile-btn {
  background-color: var(--White, #fff);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-icon {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
}
.share-btn {
  border-radius: 18px;
  background: var(--Everyday-Blule, #4dbdf5);
}

.preview-btn {
  border-radius: 18px;
  background: var(--Spark-Yellow, #ffc220);
}
</style>
