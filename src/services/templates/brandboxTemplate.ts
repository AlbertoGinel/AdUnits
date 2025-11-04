import type { CanvasElement } from '@/stores/canvas'
import type { AdUnitFrame } from './adUnitFrame'

// ✅ Frame configuration for this template
export const brandboxFrameConfig: AdUnitFrame = {
  id: 'brandbox-desktop',
  title: 'Brandbox Desktop',
  dimensions: { width: 245, height: 118 },
  position: { x: 0, y: 117 },
}

// ✅ Pure ad unit content (no frame - coordinates relative to 0,0)
export const getBrandboxAdUnit = (): CanvasElement[] => {
  return [
    // Background
    {
      id: 'background',
      type: 'rect',
      x: 0,
      y: 0,
      width: 245,
      height: 118,
      fill: '#ffffff',
    },
    {
      id: 'brandbox-desktop-image',
      type: 'image',
      x: 0,
      y: 0,
      width: 245,
      height: 47,
      image: '/image.png',
      crop: {
        x: 15,
        y: 459.3,
        width: 2440,
        height: 470,
      },
    },
    {
      id: 'brandbox-desktop-logo',
      type: 'image',
      x: 185,
      y: 66,
      width: 52,
      height: 10.2,
      image: '/logo.png',
    },
    {
      id: 'brandbox-desktop-headline',
      type: 'text',
      x: 8,
      y: 72,
      text: 'Headline goes here',
      fontSize: 7.5,
      fontFamily: 'Sans',
      fontStyle: 'bold',
      fill: '#001e60',
      align: 'left',
    },
    {
      id: 'brandbox-desktop-subhead',
      type: 'text',
      x: 8,
      y: 82,
      text: 'Your subhead goes here',
      fontSize: 5.4,
      fontFamily: 'Sans',
      fill: '#001e60',
      align: 'left',
    },
    {
      id: 'brandbox-desktop-cta-background',
      type: 'rect',
      x: 8.4,
      y: 92.5,
      width: 49,
      height: 16,
      cornerRadius: 8,
      strokeColor: '#001e60',
      fill: '#ffffffff',
      strokeWidth: 0.54,
    },
    {
      id: 'brandbox-desktop-ctatext',
      type: 'text',
      x: 8.4,
      y: 92.5,
      text: 'CTA button',
      fontSize: 5.8,
      fontFamily: 'Sans',
      fill: '#001e60',
      align: 'center',
      width: 49,
      height: 16,
      wrap: 'none',
      verticalAlign: 'middle',
    },
    {
      id: 'brandbox-desktop-disclaimer',
      type: 'text',
      x: 22,
      y: 40,
      width: 220,
      height: 6,
      text: 'This is placeholder disclaimer text and does not constitute legal advice. Use at your own risk.',
      fontSize: 4.6,
      fontFamily: 'Sans',
      fill: '#ffffff',
      align: 'right',
      wrap: 'none',
    },
  ]
}
