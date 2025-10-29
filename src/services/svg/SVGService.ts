import { useCanvasStore } from '@/stores/konva'
import Konva from 'konva'

export class SVGService {
  /**
   * Load SVG as background image in Konva canvas
   */
  static async loadSVGBackground(): Promise<void> {
    console.log('🎯 Loading SVG background...')

    try {
      const store = useCanvasStore()

      if (!store.stage) {
        console.warn('⚠️ Stage not ready, skipping SVG background load')
        return
      }

      console.log('🔍 Stage found, loading from: /svg/Frames.svg')

      // Load SVG as Konva Image with better error handling
      const image = await new Promise<Konva.Image>((resolve, reject) => {
        Konva.Image.fromURL(
          '/svg/empty_Frames.svg',
          (konvaImage) => {
            console.log(
              '📄 SVG loaded successfully, image size:',
              konvaImage.width(),
              'x',
              konvaImage.height(),
            )
            resolve(konvaImage)
          },
          (error) => {
            console.error('❌ Failed to load SVG file:', error)
            reject(error)
          },
        )
      })

      // Add to background layer
      const backgroundLayer = store.stage.findOne('.background') as Konva.Layer

      backgroundLayer.add(image)
      backgroundLayer.draw()
    } catch (error) {
      console.error('❌ Failed to load SVG background:', error)
    }
  }
}
