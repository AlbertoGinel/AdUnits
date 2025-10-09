<template>
  <section class="central-area">
    <div class="central-content">
      <h2>Central Area</h2>
      <p>This is the main central workspace area where content will be displayed.</p>
    </div>
  </section>
</template>

<script setup lang="ts">
// Central area component logic
</script>

<style scoped>
.central-area {
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333;
  position: relative;
}

.central-content {
  text-align: center;
  background: #f9f9f9;
  padding: 32px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.central-content h2 {
  margin: 0 0 16px 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
}

.central-content p {
  margin: 0;
  font-size: 1rem;
  color: #666;
}
</style>
