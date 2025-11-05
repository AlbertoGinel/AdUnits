import type { CanvasElement } from '@/stores/canvas'
import type { AdUnitFrame } from './adUnitFrame'

// ✅ Frame configuration for this template
export const marqueeFrameConfig: AdUnitFrame = {
  id: 'marquee-app',
  title: 'Marquee App',
  dimensions: { width: 450, height: 95 },
  position: { x: 0, y: 0 },
}

// ✅ Pure ad unit content (no frame - coordinates relative to 0,0)
export const getMarqueeAdUnit = (): CanvasElement[] => {
  return [
    // Background
    {
      id: 'background',
      type: 'rect',
      x: 0,
      y: 0,
      width: 450,
      height: 95,
      fill: '#ffffff',
    },
    // Image (right side)
    {
      id: 'image',
      type: 'image',
      x: 225,
      y: 0,
      width: 225,
      height: 95,
      image: '',
      crop: {
        x: 100,
        y: 355,
        width: 2811,
        height: 1187,
      },
      tag: 'image',
    },
    // Headline
    {
      id: 'headline',
      type: 'text',
      x: 13,
      y: 31,
      text: '',
      fontSize: 11,
      fontFamily: 'Sans',
      fontStyle: 'bold',
      fill: '#001e60',
      align: 'left',
      tag: 'headline',
    },
    {
      id: 'logo',
      type: 'image',
      x: 13,
      y: 12,
      width: 54,
      height: 10.63,
      image: '',
      tag: 'logo',
    },
    {
      id: 'cta-background',
      type: 'rect',
      x: 13.5,
      y: 56,
      width: 55,
      height: 18,
      cornerRadius: 9,
      strokeColor: '#001e60',
      fill: '#ffffffff',
      strokeWidth: 0.6,
    },
    {
      id: 'cta',
      type: 'text',
      x: 13.5,
      y: 56,
      width: 55,
      height: 18,
      text: '',
      fontSize: 6.5,
      fontFamily: 'Sans',
      fill: '#001e60',
      align: 'center',
      wrap: 'none',
      verticalAlign: 'middle',
      tag: 'cta',
    },
    {
      id: 'disclaimer',
      type: 'text',
      x: 229,
      y: 88,
      width: 220,
      height: 6,
      text: '',
      fontSize: 4.6,
      fontFamily: 'Sans',
      fill: '#ffffff',
      align: 'right',
      wrap: 'none',
      tag: 'disclaimer',
    },
  ]
}
