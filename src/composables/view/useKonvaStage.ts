// composables/view/useKonvaStage.ts
import { ref, reactive, computed, onMounted, onBeforeUnmount, type Ref } from 'vue'
import { useCanvasManager } from './useCanvasManager'
import type Konva from 'konva'

interface Position {
  x: number
  y: number
}

interface KonvaEvent {
  evt: MouseEvent | WheelEvent
  target: Konva.Stage | Konva.Layer | Konva.Shape
}

/**
 * Manages Konva stage zoom/pan with responsive container sizing
 * Ephemeral UI state (not persisted)
 */
export function useKonvaStage(containerRef: Ref<HTMLElement | null>) {
  const canvasManager = useCanvasManager()

  // Container dimensions (observed)
  const containerSize = reactive({ width: 0, height: 0 })

  // Zoom/Pan state
  const scale = ref(1)
  const position = reactive<Position>({ x: 0, y: 0 })
  const isPanning = ref(false)
  const panStart = reactive<Position>({ x: 0, y: 0 })

  // Zoom limits
  const MIN_SCALE = 0.1
  const MAX_SCALE = 5
  const PADDING = 5

  /**
   * Stage configuration for v-stage component
   */
  const stageConfig = computed(() => ({
    width: containerSize.width,
    height: containerSize.height,
    scaleX: scale.value,
    scaleY: scale.value,
    x: position.x,
    y: position.y,
    draggable: false,
    pixelRatio: window.devicePixelRatio || 1,
  }))

  /**
   * Content bounds from store (stage dimensions)
   */
  const contentBounds = computed(() => {
    const stage = canvasManager.getStage()
    return {
      width: stage.width,
      height: stage.height,
    }
  })

  /**
   * Calculate optimal zoom to fit content with padding
   */
  function zoomToFit() {
    const containerWidth = containerSize.width
    const containerHeight = containerSize.height
    const contentWidth = contentBounds.value.width
    const contentHeight = contentBounds.value.height

    if (containerWidth === 0 || containerHeight === 0) return

    // Calculate scale to fit content with padding
    const scaleX = (containerWidth - PADDING * 2) / contentWidth
    const scaleY = (containerHeight - PADDING * 2) / contentHeight
    const newScale = Math.min(scaleX, scaleY, MAX_SCALE)

    // Center horizontally, align to top vertically
    const scaledWidth = contentWidth * newScale
    const centerX = (containerWidth - scaledWidth) / 2
    const topY = PADDING

    scale.value = newScale
    position.x = centerX
    position.y = topY

    console.log('🎯 Zoom to fit:', {
      container: `${containerWidth}x${containerHeight}`,
      content: `${contentWidth}x${contentHeight}`,
      scale: newScale.toFixed(2),
      position: { x: Math.round(centerX), y: Math.round(topY) },
    })
  }

  /**
   * Zoom to specific ad unit (focus mode)
   */
  function zoomToAdUnit(adUnitId: string) {
    console.log('🎯 Zoom to ad unit is being executed 🎯🎯🎯🎯')

    const adUnit = canvasManager.getAdUnit(adUnitId)
    if (!adUnit) return

    const containerWidth = containerSize.width
    const containerHeight = containerSize.height
    if (containerWidth === 0 || containerHeight === 0) return

    // Frame dimensions (ignore position - in focus mode, frame is at 0,0)
    const frameWidth = adUnit.frameConfig.dimensions.width
    const frameHeight = adUnit.frameConfig.dimensions.height

    // Add 20% margin for breathing room
    const marginMultiplier = 1.2
    const effectiveWidth = frameWidth * marginMultiplier
    const effectiveHeight = frameHeight * marginMultiplier

    // Calculate scale to fit frame with margin
    const scaleX = (containerWidth - PADDING * 2) / effectiveWidth
    const scaleY = (containerHeight - PADDING * 2) / effectiveHeight
    const newScale = Math.min(scaleX, scaleY, MAX_SCALE)

    // Apply scale
    scale.value = newScale

    // In focus mode, the frame renders at (0, 0) in the stage
    // Center horizontally
    const scaledFrameWidth = frameWidth * newScale
    const containerCenterX = containerWidth / 2
    position.x = containerCenterX - scaledFrameWidth / 2

    // Align to top vertically
    position.y = PADDING

    console.log('🎯 Zoom to ad unit:', {
      adUnitId,
      frameDimensions: `w:${frameWidth}, h:${frameHeight}`,
      effectiveSize: `w:${effectiveWidth.toFixed(0)}, h:${effectiveHeight.toFixed(0)}`,
      scale: newScale.toFixed(2),
      stagePosition: { x: Math.round(position.x), y: Math.round(position.y) },
    })
  }

  /**
   * Zoom toward a specific point (for wheel zoom)
   */
  function zoomToPoint(newScale: number, pointX: number, pointY: number) {
    // Clamp scale
    newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale))

    // Calculate zoom point in stage coordinates
    const oldScale = scale.value
    const mousePointTo = {
      x: (pointX - position.x) / oldScale,
      y: (pointY - position.y) / oldScale,
    }

    // Apply new scale
    scale.value = newScale

    // Adjust position to zoom toward point
    position.x = pointX - mousePointTo.x * newScale
    position.y = pointY - mousePointTo.y * newScale
  }

  /**
   * Handle mouse wheel (zoom toward cursor)
   */
  function handleWheel(e: KonvaEvent) {
    const evt = e.evt as WheelEvent
    evt.preventDefault()

    const scaleBy = 1.1
    const stage = e.target.getStage()
    const pointer = stage?.getPointerPosition()

    if (!pointer) return

    // Zoom in or out
    const direction = evt.deltaY > 0 ? -1 : 1
    const newScale = scale.value * (direction > 0 ? scaleBy : 1 / scaleBy)

    zoomToPoint(newScale, pointer.x, pointer.y)
  }

  /**
   * Handle mouse down (start pan)
   */
  function handleMouseDown(e: KonvaEvent) {
    const evt = e.evt as MouseEvent

    // Left mouse button (without Ctrl) starts pan
    if (evt.button === 0 && !evt.ctrlKey) {
      evt.preventDefault()
      isPanning.value = true
      panStart.x = evt.clientX - position.x
      panStart.y = evt.clientY - position.y

      // Change cursor
      if (containerRef.value) {
        containerRef.value.style.cursor = 'grabbing'
      }
    }
  }

  /**
   * Handle mouse move (pan)
   */
  function handleMouseMove(e: KonvaEvent) {
    if (!isPanning.value) return

    const evt = e.evt as MouseEvent
    evt.preventDefault()
    position.x = evt.clientX - panStart.x
    position.y = evt.clientY - panStart.y
  }

  /**
   * Handle mouse up (end pan)
   */
  function handleMouseUp(e: KonvaEvent) {
    if (isPanning.value) {
      const evt = e.evt as MouseEvent
      evt.preventDefault()
      isPanning.value = false

      // Restore cursor
      if (containerRef.value) {
        containerRef.value.style.cursor = 'default'
      }
    }
  }

  /**
   * Reset zoom to 100% and center
   */
  function resetZoom() {
    scale.value = 1
    const contentWidth = contentBounds.value.width
    const contentHeight = contentBounds.value.height
    position.x = (containerSize.width - contentWidth) / 2
    position.y = (containerSize.height - contentHeight) / 2
  }

  /**
   * Observe container size changes
   */
  let resizeObserver: ResizeObserver | null = null

  function observeContainer() {
    if (!containerRef.value) return

    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        containerSize.width = width
        containerSize.height = height
      }
    })

    resizeObserver.observe(containerRef.value)
  }

  function stopObserving() {
    if (resizeObserver) {
      resizeObserver.disconnect()
      resizeObserver = null
    }
  }

  // Setup
  onMounted(() => {
    observeContainer()
  })

  onBeforeUnmount(() => {
    stopObserving()
  })

  return {
    // State
    stageConfig,
    scale,
    position,
    containerSize,
    isPanning,

    // Actions
    zoomToFit,
    zoomToAdUnit,
    zoomToPoint,
    resetZoom,

    // Event handlers
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  }
}
