<template>
  <nav class="top-navbar">
    <div class="navbar-content">
      <div class="navbar-left">
        <h1 class="app-title">Banner Editor</h1>
      </div>

      <div class="navbar-center">
        <span class="project-name">Untitled Project</span>
      </div>

      <div class="navbar-right">
        <button class="nav-btn">Save</button>
        <button class="nav-btn">Export</button>
        <button class="nav-btn">Share</button>
        <button class="nav-btn profile-btn">
          <span class="profile-icon">👤</span>
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
// Component logic will be added here
</script>

<style scoped>
.top-navbar {
  background: white;
  color: #333;
  height: 60px;
  flex-shrink: 0;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 24px;
  max-width: 100%;
}

.navbar-left {
  display: flex;
  align-items: center;
}

.app-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.navbar-center {
  display: flex;
  align-items: center;
  flex: 1;
  justify-content: center;
}

.project-name {
  background: #f5f5f5;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  color: #666;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-btn {
  background: white;
  color: #333;
  border: 1px solid #e0e0e0;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.nav-btn:hover {
  background: #f5f5f5;
  border-color: #ccc;
}

.profile-btn {
  border-radius: 50%;
  width: 36px;
  height: 36px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-icon {
  font-size: 1.2rem;
}
</style>
