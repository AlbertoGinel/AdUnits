<template>
  <div class="templates-menu">
    <div class="section-header">
      <h5>Templates</h5>
    </div>
    <div class="coming-soon">
      <p>Templates menu coming soon...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// Templates menu component - placeholder
</script>

<style scoped>
.templates-menu {
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

.coming-soon {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-style: italic;
}
</style>
