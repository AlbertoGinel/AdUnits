// composables/view/useKonvaStage.ts
import { ref, reactive, computed, type Ref } from 'vue'
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
export function useKonvaStage(
  containerRef: Ref<HTMLElement | null>,
  isReady: Ref<boolean> = ref(true),
) {
  const canvasManager = useCanvasManager()

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
   * Get container dimensions directly from DOM
   */
  const getContainerSize = () => {
    if (!containerRef.value) return { width: 0, height: 0 }
    const rect = containerRef.value.getBoundingClientRect()

    // CRITICAL: Ensure minimum dimensions to prevent 0x0 canvas
    const width = Math.max(rect.width, 800) // Minimum 800px width
    const height = Math.max(rect.height, 600) // Minimum 600px height

    console.log('🎯 KonvaStage: Container size:', {
      rectWidth: rect.width,
      rectHeight: rect.height,
      usedWidth: width,
      usedHeight: height,
    })

    return { width, height }
  }

  /**
   * Stage configuration for v-stage component
   */
  const stageConfig = computed(() => {
    // Always provide safe minimum dimensions
    if (!isReady.value || !containerRef.value) {
      return {
        width: 800, // Safe minimum width
        height: 600, // Safe minimum height
        scaleX: 1,
        scaleY: 1,
        x: 0,
        y: 0,
        draggable: false,
        pixelRatio: window.devicePixelRatio || 1,
      }
    }

    const { width, height } = getContainerSize()
    return {
      width,
      height,
      scaleX: scale.value,
      scaleY: scale.value,
      x: position.x,
      y: position.y,
      draggable: false,
      pixelRatio: window.devicePixelRatio || 1,
    }
  })

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
    const { width: containerWidth, height: containerHeight } = getContainerSize()
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
  }

  /**
   * Zoom to specific ad unit (focus mode)
   */
  function zoomToAdUnit(adUnitId: string) {
    const adUnit = canvasManager.getAdUnit(adUnitId)
    if (!adUnit) return

    const { width: containerWidth, height: containerHeight } = getContainerSize()
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
    const { width, height } = getContainerSize()
    position.x = (width - contentWidth) / 2
    position.y = (height - contentHeight) / 2
  }

  return {
    // State
    stageConfig,
    scale,
    position,
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
