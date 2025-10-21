import Konva from 'konva'
import type { WorkingAdUnit } from '@/stores/adUnits'
import { CREATIVE_FRAMES } from '@/types/creativeFrames'
import { AdUnitsElementRenderer } from './AdUnitsElementRenderer'
import { useDevLogger } from '@/devTools/useDevLogger'
import { useKonvaDevTools } from '@/devTools/useKonvaDevTools'

/**
 * AdUnits Canvas Service - Goes over array of adUnits and triggers construction
 */
export class AdUnitsCanvasService {
  private stage: Konva.Stage | null = null
  private layer: Konva.Layer | null = null
  private devLogger = useDevLogger('AdUnitsCanvasService')
  private konvaDevTools = useKonvaDevTools()

  public getStage(): Konva.Stage | null {
    return this.stage
  }

  public destroy(): void {
    this.devLogger.service('Destroying AdUnits canvas service...')
    if (this.stage) {
      this.stage.destroy()
      this.stage = null
    }
    this.layer = null
    this.konvaDevTools.cleanup()
  }

  public initializeCanvas(container: HTMLElement): void {
    this.devLogger.service(
      `Initializing AdUnits canvas: ${container.offsetWidth}x${container.offsetHeight}`,
    )

    if (this.stage) {
      this.stage.destroy()
    }

    this.stage = new Konva.Stage({
      container: container as HTMLDivElement,
      width: container.offsetWidth,
      height: container.offsetHeight,
    })

    this.layer = new Konva.Layer()
    this.stage.add(this.layer)

    this.setupPanZoom()
    this.setupResizeHandler(container)
    this.konvaDevTools.enable(this.stage)
  }

  /**
   * Main function: Go over array of adUnits and generate each one in canvas
   */
  public renderAdUnits(adUnits: WorkingAdUnit[]): void {
    if (!this.layer) {
      this.devLogger.error('Canvas not initialized')
      return
    }

    console.log('🖼️ AdUnitsCanvasService.renderAdUnits called with:', adUnits)
    this.devLogger.canvas(`Rendering ${adUnits.length} AdUnits`)
    this.layer.destroyChildren()

    // Go through each adUnit and create it
    adUnits.forEach((adUnit, index) => {
      console.log(`🖼️ Creating adUnit ${index}:`, adUnit)
      const adUnitNode = this.createAdUnit(adUnit)
      this.layer!.add(adUnitNode)
    })

    this.layer.draw()
    console.log('🖼️ Canvas drawn with', adUnits.length, 'adUnits')
    this.devLogger.success(`Rendered ${adUnits.length} adUnits`)
  }

  /**
   * Create a single AdUnit following the exact structure you described
   */
  private createAdUnit(adUnit: WorkingAdUnit): Konva.Group {
    // Get constants from CREATIVE_FRAMES
    const framePadding = CREATIVE_FRAMES.framePadding
    const adUnitTitle = CREATIVE_FRAMES.AdUnitTitle

    // Move to the position of the adUnit - this becomes our new 0,0
    const adUnitContainer = new Konva.Group({
      x: adUnit.position.x,
      y: adUnit.position.y,
      name: `adunit-${adUnit.adUnitId}`,
    })

    // Calculate frame dimensions
    const titleHeight = adUnitTitle.fontSize + 10 // font size + padding
    const frameWidth = framePadding.left + adUnit.dimensions.width + framePadding.right
    const frameHeight =
      framePadding.top +
      titleHeight +
      framePadding.bottom +
      adUnit.dimensions.height +
      framePadding.bottom

    // 1. Create pink empty frame at 0,0
    const pinkFrame = new Konva.Rect({
      x: 0,
      y: 0,
      width: frameWidth,
      height: frameHeight,
      fill: 'transparent',
      stroke: '#ff69b4', // Pink
      strokeWidth: 2,
      dash: [5, 5],
      name: `pink-frame-${adUnit.adUnitId}`,
    })

    // 2. Move to framePadding.left, framePadding.top and place title text
    const titleText = new Konva.Text({
      x: framePadding.left,
      y: framePadding.top,
      text: adUnit.name,
      fontSize: adUnitTitle.fontSize,
      fontFamily: adUnitTitle.fontFamily,
      fill: adUnitTitle.fill,
      name: `title-${adUnit.adUnitId}`,
    })

    // Assemble adUnit frame (pink frame + title only)
    adUnitContainer.add(pinkFrame)
    adUnitContainer.add(titleText)

    // Render AdUnit elements (headlines, subheads, etc.)
    const contentOffset = {
      x: framePadding.left,
      y: framePadding.top + titleHeight + framePadding.bottom,
    }
    const bodyDimensions = {
      width: adUnit.dimensions.width,
      height: adUnit.dimensions.height,
    }
    AdUnitsElementRenderer.renderAdElements(adUnit, adUnitContainer, contentOffset, bodyDimensions)

    // Calculate corners for logging
    const originCorner = { x: adUnit.position.x, y: adUnit.position.y }
    const bottomRightCorner = {
      x: adUnit.position.x + frameWidth,
      y: adUnit.position.y + frameHeight,
    }

    this.devLogger.canvas(
      `Created AdUnit: ${adUnit.name} | Origin: (${originCorner.x}, ${originCorner.y}) | Bottom-Right: (${bottomRightCorner.x}, ${bottomRightCorner.y})`,
    )

    return adUnitContainer
  }

  //ZOOM

  private setupResizeHandler(container: HTMLElement): void {
    const resizeObserver = new ResizeObserver(() => {
      if (this.stage && container) {
        const newWidth = container.offsetWidth
        const newHeight = container.offsetHeight
        this.stage.width(newWidth)
        this.stage.height(newHeight)
        this.devLogger.canvas(`Auto-resized: ${newWidth}x${newHeight}`)
      }
    })
    resizeObserver.observe(container)
  }

  private setupPanZoom(): void {
    if (!this.stage) return

    let isDragging = false
    let lastPointerPosition = { x: 0, y: 0 }

    this.stage.on('mousedown touchstart', (e) => {
      if (e.target === this.stage) {
        isDragging = true
        const pos = this.stage!.getPointerPosition()
        if (pos) lastPointerPosition = pos
        this.stage!.container().style.cursor = 'grabbing'
      }
    })

    this.stage.on('mousemove touchmove', (e) => {
      if (!isDragging) return
      e.evt.preventDefault()
      const pos = this.stage!.getPointerPosition()
      if (!pos) return
      const dx = pos.x - lastPointerPosition.x
      const dy = pos.y - lastPointerPosition.y
      this.stage!.position({ x: this.stage!.x() + dx, y: this.stage!.y() + dy })
      lastPointerPosition = pos
    })

    this.stage.on('mouseup touchend', () => {
      isDragging = false
      this.stage!.container().style.cursor = 'default'
    })

    // Simple zoom
    this.stage.on('wheel', (e) => {
      e.evt.preventDefault()
      const scaleBy = 1.1
      const stage = this.stage!
      const pointer = stage.getPointerPosition()
      if (!pointer) return

      const mousePointTo = {
        x: (pointer.x - stage.x()) / stage.scaleX(),
        y: (pointer.y - stage.y()) / stage.scaleY(),
      }

      const direction = e.evt.deltaY > 0 ? -1 : 1
      const oldScale = stage.scaleX()
      const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy

      if (newScale < 0.1 || newScale > 5) return

      stage.scale({ x: newScale, y: newScale })
      stage.position({
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      })
    })
  }

  public resetZoom(): void {
    if (!this.stage) return
    this.stage.scale({ x: 1, y: 1 })
    this.stage.position({ x: 0, y: 0 })
    this.devLogger.canvas('Reset zoom and pan to default')
  }

  public fitToScreen(): void {
    // TODO: Implement fit to screen based on adUnit bounds
    this.resetZoom()
  }

  public getZoomLevel(): number {
    return this.stage ? Math.round(this.stage.scaleX() * 100) : 100
  }
}
