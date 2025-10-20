import Konva from 'konva'
import type { AdUnitGroup } from '@/stores/adUnits'
import { AdUnitsElementRenderer } from './AdUnitsElementRenderer'
import { useDevLogger } from '@/devTools/useDevLogger'
import { useKonvaDevTools } from '@/devTools/useKonvaDevTools'

/**
 * AdUnits Canvas Service - Renders AdUnits to Konva canvas
 * Works with the simple AdUnits store structure
 */
export class AdUnitsCanvasService {
  private stage: Konva.Stage | null = null
  private layer: Konva.Layer | null = null

  // Dev composables - return no-ops in production
  private devLogger = useDevLogger('AdUnitsCanvasService')
  private konvaDevTools = useKonvaDevTools()

  // Expose stage for DevTools access
  public getStage(): Konva.Stage | null {
    return this.stage
  }

  // Cleanup method for proper component unmounting
  public destroy(): void {
    this.devLogger.service('Destroying AdUnits canvas service...')

    if (this.stage) {
      this.stage.destroy()
      this.stage = null
    }

    this.layer = null

    // Clean up DevTools references
    this.konvaDevTools.cleanup()
  }

  public initializeCanvas(container: HTMLElement): void {
    this.devLogger.service(
      `Initializing AdUnits canvas: ${container.offsetWidth}x${container.offsetHeight}`,
    )

    // Destroy existing stage if it exists
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

    // Enable pan and zoom functionality
    this.setupPanZoom()

    // Handle resize automatically
    this.setupResizeHandler(container)

    // Enable Konva DevTools
    this.konvaDevTools.enable(this.stage)
  }

  private setupResizeHandler(container: HTMLElement): void {
    // Handle window resize
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

    this.devLogger.service('Setting up pan and zoom functionality...')

    // Variables to track dragging state
    let isDragging = false
    let lastPointerPosition = { x: 0, y: 0 }

    // Mouse/touch pan functionality
    this.stage.on('mousedown touchstart', (e) => {
      // Only start panning if clicking on empty area (not on elements)
      if (e.target === this.stage) {
        isDragging = true
        const pos = this.stage!.getPointerPosition()
        if (pos) {
          lastPointerPosition = pos
        }
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

      const newX = this.stage!.x() + dx
      const newY = this.stage!.y() + dy

      this.stage!.position({ x: newX, y: newY })
      lastPointerPosition = pos
    })

    this.stage.on('mouseup touchend', () => {
      isDragging = false
      this.stage!.container().style.cursor = 'default'
    })

    // Mouse wheel zoom functionality
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

      // Limit zoom range
      const oldScale = stage.scaleX()
      const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy

      // Constrain zoom between 0.1x and 5x
      if (newScale < 0.1 || newScale > 5) return

      stage.scale({ x: newScale, y: newScale })

      const newPos = {
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      }

      stage.position(newPos)
      this.devLogger.canvas(`Zoomed to ${Math.round(newScale * 100)}%`)
    })

    this.devLogger.success('Pan and zoom enabled')
  }

  public renderAdUnitGroup(adUnitGroup: AdUnitGroup): void {
    if (!this.layer) {
      this.devLogger.error('Canvas not initialized')
      return
    }

    this.devLogger.canvas(`Rendering AdUnit Group: ${adUnitGroup.name}`)

    // Clear existing content
    this.layer.destroyChildren()

    // Create the AdUnit group using the renderer
    const adUnitGroupNode = AdUnitsElementRenderer.createAdUnitGroup(adUnitGroup)
    this.layer.add(adUnitGroupNode)

    // Add canvas title
    this.addCanvasTitle(adUnitGroup.name)

    this.layer.draw()
  }

  private addCanvasTitle(groupName: string): void {
    if (!this.layer) return

    const title = new Konva.Text({
      text: `AdUnit Group: ${groupName}`,
      x: 10,
      y: 10,
      fontSize: 16,
      fontFamily: 'Arial',
      fill: '#333333',
      name: 'canvas-title',
    })

    this.layer.add(title)
  }

  /**
   * Update a specific text element across all AdUnits
   */
  public updateTextAcrossAdUnits(
    elementType: 'headline' | 'subhead' | 'cta',
    property: string,
    value: string | number,
  ): void {
    if (!this.layer) return

    this.devLogger.canvas(`Updating ${elementType}.${property} across all AdUnits`)

    // Find all AdUnit groups
    const adUnitGroups = this.layer.find('.adunit-group')
    let updateCount = 0

    adUnitGroups.forEach((group) => {
      if (group instanceof Konva.Group) {
        // Find AdUnit nodes within this group
        const adUnitNodes = group.find((node: Konva.Node) => node.name()?.startsWith('adunit-'))

        adUnitNodes.forEach((adUnitNode) => {
          if (adUnitNode instanceof Konva.Group) {
            const textNode = AdUnitsElementRenderer.findTextNode(adUnitNode, elementType)
            if (textNode) {
              const success = AdUnitsElementRenderer.updateTextElement(
                textNode,
                property as keyof import('@/types/creativeFrames').TextStyle,
                value,
              )
              if (success) updateCount++
            }
          }
        })
      }
    })

    if (updateCount > 0) {
      this.layer.draw()
      this.devLogger.success(`Updated ${elementType} in ${updateCount} AdUnits`)
    }
  }

  /**
   * Get all AdUnit bounds for positioning calculations
   */
  public getAdUnitBounds(): Array<{
    id: string
    bounds: { x: number; y: number; width: number; height: number }
  }> {
    if (!this.layer) return []

    const bounds: Array<{
      id: string
      bounds: { x: number; y: number; width: number; height: number }
    }> = []

    const adUnitNodes = this.layer.find((node: Konva.Node) => node.name()?.startsWith('adunit-'))

    adUnitNodes.forEach((node) => {
      if (node instanceof Konva.Group) {
        const clientRect = node.getClientRect()
        bounds.push({
          id: node.name() || 'unknown',
          bounds: {
            x: clientRect.x,
            y: clientRect.y,
            width: clientRect.width,
            height: clientRect.height,
          },
        })
      }
    })

    return bounds
  }

  /**
   * Reset zoom and pan to default position
   */
  public resetZoom(): void {
    if (!this.stage) return

    this.stage.scale({ x: 1, y: 1 })
    this.stage.position({ x: 0, y: 0 })
    this.devLogger.canvas('Reset zoom and pan to default')
  }

  /**
   * Fit all AdUnits to screen with padding
   */
  public fitToScreen(): void {
    if (!this.stage || !this.layer) return

    const bounds = this.getAdUnitBounds()
    if (bounds.length === 0) return

    // Calculate overall bounding box
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity

    bounds.forEach(({ bounds: b }) => {
      minX = Math.min(minX, b.x)
      minY = Math.min(minY, b.y)
      maxX = Math.max(maxX, b.x + b.width)
      maxY = Math.max(maxY, b.y + b.height)
    })

    const contentWidth = maxX - minX
    const contentHeight = maxY - minY
    const stageWidth = this.stage.width()
    const stageHeight = this.stage.height()

    // Add padding (10% of stage size)
    const padding = Math.min(stageWidth, stageHeight) * 0.1

    // Calculate scale to fit with padding
    const scaleX = (stageWidth - padding * 2) / contentWidth
    const scaleY = (stageHeight - padding * 2) / contentHeight
    const scale = Math.min(scaleX, scaleY, 1) // Don't zoom in beyond 100%

    // Calculate position to center content
    const x = (stageWidth - contentWidth * scale) / 2 - minX * scale
    const y = (stageHeight - contentHeight * scale) / 2 - minY * scale

    this.stage.scale({ x: scale, y: scale })
    this.stage.position({ x, y })

    this.devLogger.canvas(`Fit to screen: scale=${Math.round(scale * 100)}%`)
  }

  /**
   * Get current zoom level as percentage
   */
  public getZoomLevel(): number {
    return this.stage ? Math.round(this.stage.scaleX() * 100) : 100
  }
}
