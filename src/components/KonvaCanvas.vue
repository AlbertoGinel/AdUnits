<template>
  <div ref="containerRef" class="canvas-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import Konva from 'konva'
import { useNodesStore } from '@/stores/nodes'
//import type { SerializableNode } from '@/types/serializedStagetypes'

const containerRef = ref<HTMLDivElement>()
const nodesStore = useNodesStore()
let stage: Konva.Stage | null = null

onMounted(() => {
  if (containerRef.value) {
    // Create stage
    stage = new Konva.Stage({
      container: containerRef.value,
      width: 1200,
      height: 800,
    })

    // Create layer
    const layer = new Konva.Layer()
    stage.add(layer)

    // Initial draw
    drawFromNodes()

    // ✅ Redraw whenever nodes change
    watch(
      () => nodesStore.nodes,
      () => {
        console.log('🎯 Nodes changed, redrawing canvas')
        drawFromNodes()
      },
      { deep: true },
    )
  }
})

const drawFromNodes = async () => {
  if (!stage) return

  const layer = stage.getLayers()[0]
  if (!layer) return

  layer.removeChildren() // Clear existing

  // ✅ Sort nodes by zIndex before rendering
  const sortedNodes = [...nodesStore.nodes].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))

  // ✅ Debug: Log the sorting effect
  console.log(
    '🔍 Original nodes order:',
    nodesStore.nodes.map((n) => `${n.id}(z:${n.zIndex})`),
  )
  console.log(
    '🔍 Sorted nodes order:',
    sortedNodes.map((n) => `${n.id}(z:${n.zIndex})`),
  )

  // ✅ Load all nodes in correct zIndex order (handle async images)
  const konvaNodes: (Konva.Shape | Konva.Group)[] = []

  // ✅ Track changes to apply AFTER rendering (outside watcher scope)
  const nodesToUpdate: Array<{ node: any; updates: any }> = []

  for (const node of sortedNodes) {
    console.log(`🎨 Processing node: ${node.id} (zIndex: ${node.zIndex}) - type: ${node.type}`)

    if (node.type === 'text') {
      const textNode = new Konva.Text({
        id: node.id,
        x: node.x || 0,
        y: node.y || 0,
        text: node.text || '',
        fontSize: node.fontSize || 16,
        fontFamily: node.fontFamily || 'Arial',
        fontStyle: node.fontStyle || 'normal',
        align: node.align || 'left',
        fill: '#000000',
        draggable: node.draggable || false,
      })
      konvaNodes.push(textNode)
      console.log(`✅ Created text node: ${node.id}`)
    } else if (node.type === 'image' && node.src) {
      // ✅ Wait for image to load before continuing
      const konvaImage = await new Promise<Konva.Image>((resolve) => {
        const imageObj = new Image()
        imageObj.onload = () => {
          const originalWidth = imageObj.naturalWidth
          const originalHeight = imageObj.naturalHeight

          // ✅ Calculate dimensions: stored > scale applied to original > original
          let displayWidth: number
          let displayHeight: number

          if (node.width && node.height) {
            // Already has stored dimensions (from previous scale calculation or manual resize)
            displayWidth = node.width
            displayHeight = node.height
            console.log(
              `📐 Using stored dimensions for ${node.id}: ${displayWidth}×${displayHeight}`,
            )
          } else {
            // ✅ Calculate initial dimensions but DON'T store yet (to avoid watcher loop)
            const tempScale = ((node as Record<string, unknown>)._initialScale as number) || 1
            displayWidth = originalWidth * tempScale
            displayHeight = originalHeight * tempScale

            console.log(
              `📐 Calculated dimensions for ${node.id}: ${originalWidth}×${originalHeight} * ${tempScale} = ${displayWidth}×${displayHeight}`,
            )

            // ✅ Queue update instead of immediate store modification
            nodesToUpdate.push({
              node,
              updates: {
                width: displayWidth,
                height: displayHeight,
                _initialScale: undefined, // Remove temp scale
              },
            })
          }
          const imageConfig: Konva.ImageConfig = {
            id: node.id,
            x: node.x || 0,
            y: node.y || 0,
            image: imageObj,
            width: displayWidth,
            height: displayHeight,
            draggable: node.draggable || false,
          }

          // ✅ Always add crop - neutral if not specified
          let finalCrop = node.crop
          if (!finalCrop) {
            // Auto-create neutral crop using display dimensions
            finalCrop = {
              x: 0,
              y: 0,
              width: displayWidth,
              height: displayHeight,
            }
            console.log(
              `✂️ Auto-created neutral crop for ${node.id}: ${displayWidth}×${displayHeight}`,
            )

            // ✅ Queue crop update instead of immediate store modification
            const existingUpdate = nodesToUpdate.find((u) => u.node === node)
            if (existingUpdate) {
              existingUpdate.updates.crop = finalCrop
            } else {
              nodesToUpdate.push({ node, updates: { crop: finalCrop } })
            }
          } else {
            console.log(`✂️ Using existing crop for ${node.id}:`, node.crop)
          }
          imageConfig.crop = {
            x: finalCrop.x,
            y: finalCrop.y,
            width: finalCrop.width,
            height: finalCrop.height,
          }

          const img = new Konva.Image(imageConfig)
          resolve(img)
        }
        imageObj.src = node.src!
      })
      konvaNodes.push(konvaImage)
      console.log(
        `✅ Created image node: ${node.id} (auto-detected dimensions + ${node.crop ? 'custom' : 'neutral'} crop)`,
      )
    } else {
      console.warn(`⚠️ Unknown node type or missing src: ${node.type}`, node)
    }
  }

  // ✅ Add all nodes to layer in correct zIndex order
  konvaNodes.forEach((konvaNode, index) => {
    layer.add(konvaNode)
    console.log(`🎨 Added to layer ${index + 1}: ${konvaNode.id()}`)
  })

  layer.draw()
  console.log(`✅ Canvas redrawn with ${konvaNodes.length} nodes in correct zIndex order`)
  console.log('🏁 Final layer order:', konvaNodes.map((n) => `${n.id()}`).join(' → '))

  // ✅ Apply store updates AFTER rendering is complete (using nextTick to avoid watcher loop)
  if (nodesToUpdate.length > 0) {
    console.log(`📝 Applying ${nodesToUpdate.length} node updates to store...`)

    // Use nextTick to apply updates outside the current reactive cycle
    await nextTick(() => {
      nodesToUpdate.forEach(({ node, updates }) => {
        Object.assign(node, updates)
        console.log(`💾 Updated ${node.id} in store:`, updates)
      })
    })
  }
}
</script>

<style scoped>
.canvas-container {
  border: 1px solid #ccc;
}
</style>
