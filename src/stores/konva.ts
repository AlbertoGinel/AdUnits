import { defineStore } from 'pinia'
import { ref } from 'vue'
import Konva from 'konva'

export const useCanvasStore = defineStore('canvas', () => {
  // ✅ ONLY the stage - source of truth
  const stage = ref<Konva.Stage | null>(null)

  // ✅ Initialize stage WITH container
  const initializeWithContainer = (container: HTMLDivElement): void => {
    console.log('🎯 Creating stage with container...')

    stage.value = new Konva.Stage({
      container: container,
      width: 1200,
      height: 1200,
    })

    // Create default layers
    const backgroundLayer = new Konva.Layer({ name: 'background' })
    const contentLayer = new Konva.Layer({ name: 'content' })

    stage.value.add(backgroundLayer)
    stage.value.add(contentLayer)

    // Add demo shapes
    const rect1 = new Konva.Rect({
      id: 'demo-rect',
      x: 0,
      y: 0,
      width: 50,
      height: 50,
      fill: '#00D2FF',
      draggable: true,
    })

    const rect2 = new Konva.Rect({
      id: 'demo-rect',
      x: 0,
      y: 50,
      width: 50,
      height: 50,
      fill: '#f200ffff',
      draggable: true,
    })

    const rect3 = new Konva.Rect({
      id: 'demo-rect',
      x: 50,
      y: 0,
      width: 50,
      height: 50,
      fill: '#f200ffff',
      draggable: true,
    })

    contentLayer.add(rect1)
    contentLayer.add(rect2)
    contentLayer.add(rect3)
    stage.value.draw()

    console.log('✅ Stage created and rendered')
  }

  return {
    stage,
    initializeWithContainer,
  }
})
