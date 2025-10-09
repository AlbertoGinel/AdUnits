<template>
  <div class="background-menu">
    <div class="section-header">
      <h5>Background</h5>
    </div>
    <div class="coming-soon">
      <p>Background menu coming soon...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// Background menu component - placeholder
</script>

<style scoped>
.background-menu {
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
