import { useNodesStore } from '@/stores/nodes'

export class PopulateService {
  /**
   * Add nodes to the nodes store - canvas will redraw automatically
   */
  static addBlueSquare(): void {
    console.log('🎯 Adding nodes to store...')

    try {
      const nodesStore = useNodesStore()

      const background = nodesStore.createImageNode({
        id: 'background-image',
        name: 'Background',
        x: 0,
        y: 0,
        scale: 1, // ✅ 100% of original size
        src: '/svg/empty_Frames.svg',
        zIndex: -1,
      })

      const headlineNodeMA = nodesStore.createTextNode({
        id: 'marquee-app-headline',
        text: 'Headline goes here',
        x: 14,
        y: 47,
        fontSize: 8.1,
        fontFamily: 'Sans',
        fontStyle: 'bold',
        zIndex: 1,
      })

      const ctaMA = nodesStore.createTextNode({
        id: 'marquee-app-cta',
        text: 'CTAbutton',
        x: 23.8,
        y: 86.3,
        fontSize: 4.8,
        fontFamily: 'Sans',
        align: 'center',
        zIndex: 1,
      })

      const logoMA = nodesStore.createImageNode({
        id: 'logoMA',
        name: 'logoMA',
        x: 13.2,
        y: 28.8,
        scale: 0.5, // ✅ 50% of original size
        src: '/logo.png',
        zIndex: 2,
      })

      const imageMA = nodesStore.createImageNode({
        id: 'imageMA',
        name: 'imageMA',
        x: 244.5,
        y: 16,
        src: '/image.png',
        zIndex: 1,
        crop: {
          x: 0,
          y: 0,
          width: 244.5,
          height: 95,
        },
        scale: 1,
      })

      // Add in random order to test sorting
      nodesStore.addNode(background)
      nodesStore.addNode(headlineNodeMA)
      nodesStore.addNode(ctaMA)
      nodesStore.addNode(logoMA)
      nodesStore.addNode(imageMA)

      console.log('✅ Node created and added via store methods')
    } catch (error) {
      console.error('❌ Failed to add nodes:', error)
    }
  }
}
