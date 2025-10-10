// Konva event types
export interface KonvaEvent {
  target: KonvaNode
  evt: WheelEvent | MouseEvent | TouchEvent | PointerEvent
}

export interface KonvaNode {
  x(): number
  y(): number
  width(): number
  height(): number
  getParent(): KonvaNode | null
  getStage(): KonvaStage
  getPointerPosition(): { x: number; y: number }
}

export interface KonvaStage extends KonvaNode {
  scaleX(): number
  scaleY(): number
}

export interface KonvaDragEvent extends KonvaEvent {
  target: KonvaNode
}
