// KCanvas event types
export interface KCanvasEvent {
  target: KCanvasNode
  evt: WheelEvent | MouseEvent | TouchEvent | PointerEvent
}

export interface KCanvasNode {
  x(): number
  y(): number
  width(): number
  height(): number
  getParent(): KCanvasNode | null
  getStage(): KCanvasStage
  getPointerPosition(): { x: number; y: number }
}

export interface KCanvasStage extends KCanvasNode {
  scaleX(): number
  scaleY(): number
}

export interface KCanvasDragEvent extends KCanvasEvent {
  target: KCanvasNode
}
