import Konva from 'konva'
import type { WorkingAdUnit } from '@/stores/adUnits'
import { useDevLogger } from '@/devTools/useDevLogger'

/**
 * AdUnits Element Renderer - Renders individual elements within AdUnits
 */
export class AdUnitsElementRenderer {
  private static devLogger = useDevLogger('AdUnitsElementRenderer')

  /**
   * Render all elements inside an AdUnit (headlines, subheads, cta, etc.)
   */
  public static renderAdElements(
    adUnit: WorkingAdUnit,
    container: Konva.Group,
    contentOffset: { x: number; y: number },
    bodyDimensions: { width: number; height: number },
  ): void {
    // Create content group using the pre-calculated offset from AdUnitsCanvasService
    const contentGroup = new Konva.Group({
      x: contentOffset.x,
      y: contentOffset.y,
      name: `content-${adUnit.adUnitId}`,
    })

    // Create white body rectangle at 0,0 relative to contentGroup
    const whiteBody = new Konva.Rect({
      x: 0,
      y: 0,
      width: bodyDimensions.width,
      height: bodyDimensions.height,
      fill: '#ffffff',
      stroke: '#cccccc',
      strokeWidth: 1,
      name: `body-${adUnit.adUnitId}`,
    })
    contentGroup.add(whiteBody)

    // Render all text elements
    this.renderText(adUnit, contentGroup, 'headline')
    this.renderText(adUnit, contentGroup, 'subhead')
    this.renderText(adUnit, contentGroup, 'cta')
    this.renderText(adUnit, contentGroup, 'legalDisclaimerText')

    // Add content group to container
    container.add(contentGroup)
  }

  /**
   * Render generic text element (headline, subhead, cta, legalDisclaimerText)
   */
  public static renderText(
    adUnit: WorkingAdUnit,
    contentGroup: Konva.Group,
    textType: 'headline' | 'subhead' | 'cta' | 'legalDisclaimerText',
  ): void {
    const textStyle = adUnit[textType]

    const textElement = new Konva.Text({
      x: textStyle.x,
      y: textStyle.y,
      text: textStyle.text,
      fontSize: textStyle.fontSize,
      fontFamily: textStyle.fontFamily,
      fill: textStyle.fill,
      fontStyle: textStyle.fontWeight && textStyle.fontWeight >= 400 ? 'bold' : 'normal',
      name: `${textType}-${adUnit.adUnitId}`,
    })

    contentGroup.add(textElement)

    this.devLogger.canvas(
      `Rendered ${textType}: "${textStyle.text}" at (${textStyle.x}, ${textStyle.y}) in ${adUnit.adUnitId}`,
    )
  }
}
