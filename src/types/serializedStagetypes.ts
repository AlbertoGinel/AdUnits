export type Id = string

export type SerializableNodeBase = {
  id?: string
  name?: string
  x?: number
  y?: number
  rotation?: number
  scaleX?: number
  scaleY?: number
  offsetX?: number
  offsetY?: number
  opacity?: number
  visible?: boolean
  draggable?: boolean
  listening?: boolean
  zIndex?: number
}

export type TextModel = {
  type: 'text'
  text?: string
  fontFamily?: string
  fontSize?: number
  fontStyle?: string
  fontVariant?: string
  textDecoration?: string
  align?: string
  verticalAlign?: string
  lineHeight?: number
  padding?: number
  wrap?: string
  ellipsis?: boolean
} & SerializableNodeBase

export type ImageModel = {
  type: 'image'
  src?: string
  width?: number
  height?: number

  crop?: {
    x: number
    y: number
    width: number
    height: number
  }
} & SerializableNodeBase

export type SerializableNode = TextModel | ImageModel
