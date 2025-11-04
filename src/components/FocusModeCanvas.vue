<template>
  <div class="edit-canvas">
    <v-stage :config="editStageConfig" :key="renderKey">
      <v-layer>
        <!-- Show ONLY current ad unit elements (repositioned) -->
        <template v-for="element in editElements" :key="element.id">
          <KonvaText v-if="element.type === 'text'" :element="element" />
          <KonvaRect v-else-if="element.type === 'rect'" :element="element" />
          <KonvaImage v-else-if="element.type === 'image'" :element="element" />
          <KonvaButton
            v-if="element.type === 'button' && !element.id?.includes('edit-button')"
            :element="element"
          />
        </template>
      </v-layer>
    </v-stage>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { KonvaText, KonvaRect, KonvaImage } from '@/components/konvaComponents'
import KonvaButton from '@/components/konvaComponents/KonvaButton.vue'
import type { AdUnit } from '@/stores/canvas'

interface Props {
  adUnit: AdUnit
}

const props = defineProps<Props>()

const renderKey = ref(0)

// ✅ Filter out frame elements (title, edit button) and reposition for edit mode
const editElements = computed(() => {
  const framePos = props.adUnit.frameConfig.position

  return props.adUnit.elements
    .filter((element) => {
      // Keep content elements, filter out frame UI elements
      return !element.id?.includes('-title') && !element.id?.includes('-edit-button')
    })
    .map((element) => ({
      ...element,
      x: element.x - framePos.x, // Adjust to relative positioning
      y: element.y - framePos.y - 16, // Account for frame title offset
    }))
})

// ✅ Canvas size matches ad unit dimensions exactly
const editStageConfig = computed(() => ({
  width: props.adUnit.frameConfig.dimensions.width,
  height: props.adUnit.frameConfig.dimensions.height,
}))

onMounted(() => {
  renderKey.value++
  console.log(`🎯 FocusMode Canvas mounted for: ${props.adUnit.title}`)
  console.log(`📏 Canvas size: ${editStageConfig.value.width}×${editStageConfig.value.height}`)
  console.log(`🧩 Focusing on ${editElements.value.length} elements`)
})
</script>

<style scoped>
.edit-canvas {
  border: 2px solid #ccc;
  padding: 20px;
  border-radius: 8px;
  background: #b5b5b5;
}
</style>
