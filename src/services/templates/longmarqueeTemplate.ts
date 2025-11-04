import type { CanvasElement } from '@/stores/canvas'
import type { AdUnitFrame } from './adUnitFrame'

// ✅ Frame configuration for this template
export const longmarqueeFrameConfig: AdUnitFrame = {
  id: 'longmarquee',
  title: 'Long Marquee',
  dimensions: { width: 860, height: 95 },
  position: { x: 0, y: 0 },
}

// ✅ Pure ad unit content (no frame - coordinates relative to 0,0)
export const getLongmarqueeAdUnit = (): CanvasElement[] => {
  return [
    // Background
    {
      id: 'background',
      type: 'rect',
      x: 0,
      y: 0,
      width: 860,
      height: 95,
      fill: '#ffffff',
      strokeWidth: 1.3709,
    },
    // Headline placeholder
    {
      id: 'headline',
      type: 'rect',
      x: 91.897354,
      y: 12.173,
      width: 115.5555,
      height: 9.6361008,
      fill: '#808080',
      strokeWidth: 10.7166,
    },
    // Logo placeholder
    {
      id: 'logo',
      type: 'rect',
      x: 10,
      y: 42,
      width: 57.984299,
      height: 11.410001,
      fill: '#808080',
      strokeWidth: 8.26053,
    },
    // Subhead placeholder
    {
      id: 'subhead',
      type: 'rect',
      x: 91.1166,
      y: 29.1434,
      width: 85.288239,
      height: 7.0384998,
      fill: '#808080',
      strokeWidth: 7.86857,
    },
    // CTA Button placeholder
    {
      id: 'cta-button',
      type: 'rect',
      x: 90.933884,
      y: 63.567627,
      width: 56.709694,
      height: 18.679754,
      fill: '#808080',
      strokeWidth: 10.4526,
    },
    // Image placeholder
    {
      id: 'image',
      type: 'rect',
      x: 457.599,
      y: 0,
      width: 402.401,
      height: 95,
      fill: '#808080',
      strokeWidth: 62.7916,
    },
    // Disclaimer
    {
      id: 'disclaimer',
      type: 'rect',
      x: 585.414,
      y: 77.290001,
      width: 261.22501,
      height: 5.861999,
      fill: '#003380',
      strokeWidth: 12.5673,
    },
  ]
}
