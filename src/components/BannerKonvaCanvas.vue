<template>
  <div class="banner-canvas-container">
    <div class="canvas-header">
      <h3>{{ bannerGroup?.name || 'Banner Group' }}</h3>
      <div class="canvas-controls">
        <button @click="fitToScreen" class="control-btn">Fit to Screen</button>
        <button @click="resetZoom" class="control-btn">Reset Zoom</button>
        <span class="zoom-level">{{ Math.round(scale * 100) }}%</span>
      </div>
    </div>

    <div class="canvas-wrapper" ref="canvasWrapper">
      <v-stage
        ref="stage"
        :config="stageConfig"
        @wheel="handleWheel"
        @mousedown="handleStageMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
      >
        <v-layer ref="layer">
          <!-- Render each banner as a group -->
          <v-group
            v-for="banner in bannerGroup?.banners"
            :key="banner.id"
            :config="getBannerGroupConfig(banner)"
          >
            <!-- Banner background -->
            <v-rect
              :config="getBannerBackgroundConfig(banner)"
              @click="() => selectBanner(banner.id)"
              @tap="() => selectBanner(banner.id)"
            />

            <!-- Banner title -->
            <v-text :config="getBannerTitleConfig(banner)" />

            <!-- Render banner elements -->
            <v-group
              v-for="element in getBannerElements(banner)"
              :key="element.id"
              :config="getElementGroupConfig(element)"
              @click="() => selectElement(element.id)"
              @tap="() => selectElement(element.id)"
              @dragstart="handleElementDragStart"
              @dragend="(e: KonvaDragEvent) => handleElementDragEnd(e, element.id)"
            >
              <!-- Text elements -->
              <v-text v-if="element.type === 'text'" :config="getTextConfig(element)" />

              <!-- Image elements (placeholder rectangles for now) -->
              <v-rect
                v-else-if="element.type === 'image' || element.type === 'logo'"
                :config="getImageConfig(element)"
              />
              <v-text
                v-if="element.type === 'image' || element.type === 'logo'"
                :config="getImageTextConfig(element)"
              />

              <!-- Button elements -->
              <v-rect v-else-if="element.type === 'button'" :config="getButtonConfig(element)" />
              <v-text v-if="element.type === 'button'" :config="getButtonTextConfig(element)" />

              <!-- Shape elements -->
              <v-rect v-else-if="element.type === 'shape'" :config="getShapeConfig(element)" />

              <!-- Selection indicator -->
              <v-rect
                v-if="selectedElementId === element.id"
                :config="getSelectionConfig(element)"
              />
            </v-group>

            <!-- Banner selection indicator -->
            <v-rect
              v-if="activeBannerId === banner.id"
              :config="getBannerSelectionConfig(banner)"
            />
          </v-group>
        </v-layer>
      </v-stage>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, watch } from 'vue'
import { useBannerStore } from '@/stores/banners'
import type { WorkingBanner, WorkingElement } from '@/stores/banners'
import type { KonvaEvent, KonvaDragEvent } from '@/types/konva'

const bannerStore = useBannerStore()

// Initialize store
bannerStore.initializeStore()

// Reactive references
const canvasWrapper = ref<HTMLDivElement>()
const stage = ref()
const layer = ref()

// Canvas state
const scale = ref(1)
const stagePos = ref({ x: 0, y: 0 })
const canvasSize = ref({ width: 1200, height: 800 })

// Layout calculations
const BANNER_MARGIN = 30
const BANNER_TITLE_HEIGHT = 25
const MIN_BANNER_MARGIN = 20
const MIN_SCALE = 0.1
const MAX_SCALE = 3

// Computed properties
const bannerGroup = computed(() => bannerStore.bannerGroup)
const activeBannerId = computed(() => bannerStore.activeBannerId)
const selectedElementId = computed(() => bannerStore.selectedElementId)

const stageConfig = computed(() => ({
  width: canvasSize.value.width,
  height: canvasSize.value.height,
  scaleX: scale.value,
  scaleY: scale.value,
  x: stagePos.value.x,
  y: stagePos.value.y,
  draggable: true,
}))

// Layout logic for responsive flow with better organization
const getBannerLayout = () => {
  if (!bannerGroup.value?.banners.length) return []

  const banners = bannerGroup.value.banners
  const layouts: Array<{ banner: WorkingBanner; x: number; y: number }> = []

  let currentX = BANNER_MARGIN
  let currentY = BANNER_MARGIN
  let rowHeight = 0

  // Use a more conservative container width to ensure good spacing
  const containerWidth = (canvasSize.value.width / scale.value) * 0.95 - BANNER_MARGIN * 2

  console.log(`📐 Layout calculation for ${banners.length} banners:`)

  banners.forEach((banner, index) => {
    const bannerWidth = banner.dimensions.width
    const bannerHeight = banner.dimensions.height + BANNER_TITLE_HEIGHT

    console.log(`  ${index + 1}. ${banner.name}: ${bannerWidth}x${banner.dimensions.height}`)

    // Check if banner fits in current row (with some padding)
    if (currentX + bannerWidth > containerWidth && layouts.length > 0) {
      // Move to next row
      currentY += rowHeight + BANNER_MARGIN
      currentX = BANNER_MARGIN
      rowHeight = 0
      console.log(`    → New row at y: ${currentY}`)
    }

    layouts.push({
      banner,
      x: currentX,
      y: currentY,
    })

    currentX += bannerWidth + MIN_BANNER_MARGIN
    rowHeight = Math.max(rowHeight, bannerHeight)
  })

  console.log(`📐 Layout complete: ${layouts.length} banners arranged`)
  return layouts
}

const getBannerGroupConfig = (banner: WorkingBanner) => {
  const layouts = getBannerLayout()
  const layout = layouts.find((l) => l.banner.id === banner.id)

  return {
    x: layout?.x || 0,
    y: layout?.y || 0,
  }
}

const getBannerBackgroundConfig = (banner: WorkingBanner) => ({
  width: banner.dimensions.width,
  height: banner.dimensions.height,
  fill: '#ffffff',
  stroke: '#e0e0e0',
  strokeWidth: 1,
  y: BANNER_TITLE_HEIGHT,
  listening: true,
  name: `banner-${banner.id}`,
})

const getBannerTitleConfig = (banner: WorkingBanner) => ({
  text: banner.name,
  x: 0,
  y: 0,
  fontSize: 14,
  fontFamily: 'Arial, sans-serif',
  fill: '#333333',
  width: banner.dimensions.width,
  align: 'center',
})

const getBannerSelectionConfig = (banner: WorkingBanner) => ({
  width: banner.dimensions.width,
  height: banner.dimensions.height,
  stroke: '#2196f3',
  strokeWidth: 3,
  y: BANNER_TITLE_HEIGHT,
  listening: false,
  dash: [5, 5],
})

const getBannerElements = (banner: WorkingBanner) => {
  return Object.values({ ...banner.elements, ...banner.addedElements })
}

const getElementGroupConfig = (element: WorkingElement) => ({
  x: element.position.center_x - element.dimensions.width / 2,
  y: element.position.center_y - element.dimensions.height / 2 + BANNER_TITLE_HEIGHT,
  draggable: element.editableProperties.includes('position'),
  name: `element-${element.id}`,
})

const getTextConfig = (element: WorkingElement) => {
  const font = element.properties.font as Record<string, unknown> | undefined
  return {
    text: String(element.properties.content || 'Text'),
    width: element.dimensions.width,
    height: element.dimensions.height,
    fontSize: font?.size || 14,
    fontFamily: font?.family || 'Arial, sans-serif',
    fill: font?.color || '#333333',
    fontStyle: font?.weight || 'normal',
    align: font?.alignment || 'left',
    verticalAlign: 'middle',
    listening: true,
  }
}

const getImageConfig = (element: WorkingElement) => ({
  width: element.dimensions.width,
  height: element.dimensions.height,
  fill: '#f0f0f0',
  stroke: '#cccccc',
  strokeWidth: 1,
  listening: true,
})

const getImageTextConfig = (element: WorkingElement) => ({
  text: element.type === 'logo' ? '🏢' : '📷',
  width: element.dimensions.width,
  height: element.dimensions.height,
  fontSize: Math.min(element.dimensions.width, element.dimensions.height) * 0.3,
  fill: '#999999',
  align: 'center',
  verticalAlign: 'middle',
  listening: false,
})

const getButtonConfig = (element: WorkingElement) => {
  const bg = element.properties.background as Record<string, unknown> | undefined
  const border = bg?.border as Record<string, unknown> | undefined
  return {
    width: element.dimensions.width,
    height: element.dimensions.height,
    fill: String(bg?.color || '#007bff'),
    cornerRadius: Number(bg?.border_radius || 4),
    stroke: String(border?.color || 'transparent'),
    strokeWidth: Number(border?.width || 0),
    listening: true,
  }
}

const getButtonTextConfig = (element: WorkingElement) => {
  const textProps = element.properties.text as Record<string, unknown> | undefined
  const font = textProps?.font as Record<string, unknown> | undefined
  return {
    text: String(textProps?.content || 'Button'),
    width: element.dimensions.width,
    height: element.dimensions.height,
    fontSize: Number(font?.size || 14),
    fontFamily: String(font?.family || 'Arial, sans-serif'),
    fill: String(font?.color || '#ffffff'),
    align: 'center',
    verticalAlign: 'middle',
    listening: false,
  }
}

const getShapeConfig = (element: WorkingElement) => ({
  width: element.dimensions.width,
  height: element.dimensions.height,
  fill: String(element.properties.fill_color || '#3498db'),
  stroke: String(element.properties.stroke_color || '#2c3e50'),
  strokeWidth: Number(element.properties.stroke_width || 2),
  listening: true,
})

const getSelectionConfig = (element: WorkingElement) => ({
  width: element.dimensions.width + 4,
  height: element.dimensions.height + 4,
  x: -2,
  y: -2,
  stroke: '#2196f3',
  strokeWidth: 2,
  listening: false,
  dash: [3, 3],
})

// Event handlers
const selectBanner = (bannerId: string) => {
  bannerStore.setActiveBanner(bannerId)
  bannerStore.setSelectedElement(null)
}

const selectElement = (elementId: string) => {
  bannerStore.setSelectedElement(elementId)
}

const handleStageMouseDown = (e: KonvaEvent) => {
  if (e.target === e.target.getStage()) {
    bannerStore.setSelectedElement(null)
  }
}

const handleMouseMove = () => {
  // Handle mouse move if needed
}

const handleMouseUp = () => {
  // Handle mouse up if needed
}

const handleElementDragStart = () => {
  // Optional: handle drag start
}

const handleElementDragEnd = (e: KonvaDragEvent, elementId: string) => {
  const node = e.target.getParent()
  if (!node) return

  const newX = node.x() + node.width() / 2
  const newY = node.y() + node.height() / 2 - BANNER_TITLE_HEIGHT

  // Update element position in store
  bannerStore.updateElementProperty(elementId, 'position.center_x', newX)
  bannerStore.updateElementProperty(elementId, 'position.center_y', newY)
}

const handleWheel = (e: KonvaEvent) => {
  e.evt.preventDefault()

  const scaleBy = 1.1
  const stage = e.target.getStage()
  const oldScale = stage.scaleX()
  const pointer = stage.getPointerPosition()

  const mousePointTo = {
    x: (pointer.x - stage.x()) / oldScale,
    y: (pointer.y - stage.y()) / oldScale,
  }

  const wheelEvent = e.evt as WheelEvent
  let newScale = wheelEvent.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy
  newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale))

  scale.value = newScale

  const newPos = {
    x: pointer.x - mousePointTo.x * newScale,
    y: pointer.y - mousePointTo.y * newScale,
  }

  stagePos.value = newPos
}

const fitToScreen = () => {
  if (!bannerGroup.value?.banners.length) return

  console.log(`🔍 Fitting ${bannerGroup.value.banners.length} banners to screen`)

  const layouts = getBannerLayout()
  let maxX = 0
  let maxY = 0

  layouts.forEach(({ banner, x, y }) => {
    const bannerRight = x + banner.dimensions.width
    const bannerBottom = y + banner.dimensions.height + BANNER_TITLE_HEIGHT
    maxX = Math.max(maxX, bannerRight)
    maxY = Math.max(maxY, bannerBottom)
  })

  const padding = BANNER_MARGIN * 3 // Extra padding for better view
  const availableWidth = canvasSize.value.width - padding
  const availableHeight = canvasSize.value.height - padding

  const scaleX = availableWidth / maxX
  const scaleY = availableHeight / maxY

  // Use a slightly smaller scale for better visual breathing room
  const newScale = Math.min(scaleX, scaleY, 0.9)

  scale.value = Math.max(newScale, MIN_SCALE)
  stagePos.value = { x: padding / 2, y: padding / 2 }

  console.log(`🔍 Fit complete: scale=${scale.value.toFixed(2)}, content=${maxX}x${maxY}`)
}

const resetZoom = () => {
  scale.value = 1
  stagePos.value = { x: 0, y: 0 }
}

const updateCanvasSize = () => {
  if (canvasWrapper.value) {
    const rect = canvasWrapper.value.getBoundingClientRect()
    canvasSize.value = {
      width: rect.width,
      height: rect.height,
    }
  }
}

// Lifecycle
onMounted(() => {
  updateCanvasSize()

  window.addEventListener('resize', updateCanvasSize)

  nextTick(() => {
    if (bannerGroup.value?.banners.length) {
      setTimeout(fitToScreen, 100)
    }
  })
})

// Watch for banner group changes
watch(
  () => bannerGroup.value,
  () => {
    nextTick(() => {
      fitToScreen()
    })
  },
  { deep: true },
)
</script>

<style scoped>
.banner-canvas-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
}

.canvas-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  flex-shrink: 0;
}

.canvas-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.1rem;
  font-weight: 600;
}

.canvas-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.control-btn {
  padding: 6px 12px;
  background: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.control-btn:hover {
  background: #e0e0e0;
}

.zoom-level {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
  min-width: 40px;
  text-align: center;
}

.canvas-wrapper {
  flex: 1;
  overflow: hidden;
  cursor: grab;
}

.canvas-wrapper:active {
  cursor: grabbing;
}
</style>
