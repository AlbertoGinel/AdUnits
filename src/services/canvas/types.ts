/**
 * Canvas-specific types that extend the existing kcanvas types
 */

export interface ElementConfig {
  type: 'text' | 'rect' | 'group' | 'image' | 'circle'
  config?: Record<string, unknown> // Optional for groups
  children?: ElementConfig[]
}

export interface CanvasPosition {
  x: number
  y: number
}

export interface CanvasDimensions {
  width: number
  height: number
}

export interface BannerLayout {
  position: CanvasPosition
  dimensions: CanvasDimensions
  title: string
}
