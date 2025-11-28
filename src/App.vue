<script setup lang="ts">
import { onMounted } from 'vue'
import { useAppInitializer } from '@/composables/setupFrames/useAppInitializer'

// Initialize app on mount
const { initializeApp } = useAppInitializer()

// Guard against multiple initialization
let isInitializing = false
let isInitialized = false

onMounted(async () => {
  if (isInitializing) {
    console.log('⚠️ App initialization already in progress, skipping...')
    return
  }

  if (isInitialized) {
    console.log('✅ App already initialized, skipping...')
    return
  }

  isInitializing = true
  console.log('🎬 App mounted, starting initialization...')

  const success = await initializeApp()

  if (success) {
    isInitialized = true
    console.log('🎉 App is ready to use!')
  } else {
    console.error('💥 App initialization failed - check console for errors')
  }

  isInitializing = false
})
</script>

<template>
  <div id="app">
    <RouterView />
  </div>
</template>

<style>
* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: #f5f5f5;
}

#app {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

/* Global styles */
button {
  font-family: inherit;
}

input,
textarea,
select {
  font-family: inherit;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
