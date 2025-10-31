import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SerializableNode } from '@/types/serializedStagetypes'

export const useNodesStore = defineStore('nodes', () => {
  // ✅ Simple array of serialized nodes with 2 initial nodes
  const nodes = ref<SerializableNode[]>([])

  // ✅ Strong store methods
  const createTextNode = (options: {
    id: string
    text: string
    x?: number
    y?: number
    fontSize?: number
    fontFamily?: string
    fontStyle?: string
    align?: string
    zIndex?: number
  }): SerializableNode => {
    return {
      type: 'text',
      id: options.id,
      name: options.text,
      x: options.x || 0,
      y: options.y || 0,
      text: options.text,
      fontSize: options.fontSize || 16,
      fontFamily: options.fontFamily || 'Arial',
      fontStyle: options.fontStyle || 'normal',
      align: options.align || 'left',
      zIndex: options.zIndex || 0,
      draggable: true,
      visible: true,
    }
  }

  const createImageNode = (options: {
    id: string
    src: string
    x?: number
    y?: number

    scale?: number // ✅ Creation parameter only - not stored
    name?: string
    zIndex?: number
    crop?: {
      x: number
      y: number
      width: number
      height: number
    }
  }): SerializableNode => {
    // ✅ Create the node data - width/height will be set when image loads
    const nodeData = {
      type: 'image' as const,
      id: options.id,
      name: options.name || 'Image',
      x: options.x || 0,
      y: options.y || 0,
      // ✅ width and height will be calculated from image + scale in canvas
      src: options.src,
      zIndex: options.zIndex || 0,
      crop: options.crop,
      draggable: true,
      visible: true,
      // ✅ Temporarily store scale for first load calculation (will be removed after use)
      ...(options.scale && options.scale !== 1 ? { _initialScale: options.scale } : {}),
    }

    return nodeData
  }

  const addNode = (node: SerializableNode): void => {
    nodes.value.push(node)
    console.log('✅ Node added to store:', node.id)
  }

  return {
    nodes,
    createTextNode,
    createImageNode,
    addNode,
  }
})
