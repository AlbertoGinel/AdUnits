<script setup lang="ts">
import { useEditTools } from '@/features/editTools/useEditTools'

const { selectedTool, activeSubView } = useEditTools()
</script>

<template>
  <p>{{ selectedTool }}</p>
  <p>{{ activeSubView }}</p>
</template>
