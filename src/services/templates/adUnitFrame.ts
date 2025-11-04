import type { CanvasElement } from '@/stores/canvas'

export interface AdUnitFrame {
  id: string
  title: string
  dimensions: { width: number; height: number }
  position: { x: number; y: number }
  editButtonOffset?: { x: number; y: number }
}

export class AdUnitFrameService {
  static createFrameElements(frame: AdUnitFrame): CanvasElement[] {
    return [
      // Frame title/label
      {
        id: `${frame.id}-label`,
        type: 'text',
        x: frame.position.x,
        y: frame.position.y,
        text: `${frame.title}`,
        fontSize: 11,
        fill: '#74767cff',
        fontFamily: 'Sans',
        align: 'left',
      },
      // Edit button
      {
        id: `${frame.id}-edit-button`,
        type: 'button',
        x: frame.position.x + (frame.editButtonOffset?.x || 146.7),
        y: frame.position.y + (frame.editButtonOffset?.y || 2.9),
        text: 'Edit',
        fontSize: 11,
        fontFamily: 'Sans',
        fill: '#0053e2',
        align: 'left',
        width: 30,
        height: 15,
      },
    ]
  }

  static wrapAdUnitElements(
    adUnitElements: CanvasElement[],
    frame: AdUnitFrame,
    contentOffset: { x: number; y: number } = { x: 0, y: 16 },
  ): CanvasElement[] {
    // ✅ Adjust all ad unit coordinates to fit within frame
    return adUnitElements.map((element) => ({
      ...element,
      id: `${frame.id}-${element.id}`,
      x: frame.position.x + contentOffset.x + element.x,
      y: frame.position.y + contentOffset.y + element.y,
    }))
  }

  static createFramedAdUnit(
    frame: AdUnitFrame,
    adUnitElements: CanvasElement[],
    contentOffset?: { x: number; y: number },
  ): CanvasElement[] {
    const frameElements = this.createFrameElements(frame)
    const wrappedElements = this.wrapAdUnitElements(adUnitElements, frame, contentOffset)

    return [...frameElements, ...wrappedElements]
  }
}
