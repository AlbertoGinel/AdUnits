// composables/view/useKonvaStage.ts
import { ref, reactive, computed, type Ref } from 'vue'
import { useCanvasManager } from './useCanvasManager'
import { useCanvasData } from '../data/useCanvasData'
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
  const canvasData = useCanvasData()

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

    return { width: rect.width, height: rect.height }
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
   * Content bounds - Dynamic based on view mode
   */
  const contentBounds = computed(() => {
    const currentView = canvasData.getCurrentView()

    if (currentView === 'focusMode') {
      // Focus mode: Use current ad unit dimensions
      const currentAdUnitId = canvasData.getCurrentAdUnitId()
      if (currentAdUnitId) {
        const adUnit = canvasData.getAdUnit(currentAdUnitId)
        if (adUnit?.frameConfig?.dimensions) {
          return {
            width: adUnit.frameConfig.dimensions.width,
            height: adUnit.frameConfig.dimensions.height,
          }
        }
      }
    }

    // Bulk mode: Use stage dimensions (fallback for focus mode too)
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
    zoomToPoint,
    resetZoom,

    // Event handlers
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  }
}
