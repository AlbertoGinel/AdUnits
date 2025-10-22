import Konva from 'konva'
import type { WorkingAdUnit } from '@/stores/adUnits'
import type { ImageAsset } from '@/types/creativeFrames'
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
    whiteBody.zIndex(-10) // Very low to ensure it's always at bottom

    // Render all images
    adUnit.images.forEach((image, index) => {
      this.renderImage(image, contentGroup, adUnit.adUnitId, index)
    })

    // Render all text elements
    this.renderText(adUnit, contentGroup, 'headline')
    this.renderText(adUnit, contentGroup, 'subhead')
    this.renderText(adUnit, contentGroup, 'cta')
    this.renderText(adUnit, contentGroup, 'legalDisclaimerText')

    // Render CTA button
    this.renderCtaButton(adUnit, contentGroup)

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
      fontStyle: textStyle.fontStyle,
      name: `${textType}-${adUnit.adUnitId}`,
    })

    contentGroup.add(textElement)
    textElement.zIndex(1)

    this.devLogger.canvas(
      `Rendered ${textType}: "${textStyle.text}" at (${textStyle.x}, ${textStyle.y}) in ${adUnit.adUnitId}`,
    )
  }

  /**
   * Render image element with crop and position
   */
  public static renderImage(
    image: ImageAsset,
    contentGroup: Konva.Group,
    adUnitId: string,
    index: number,
  ): void {
    // Use test image from public folder
    const testImageUrl = '/example.png'

    // Create image element
    const imageObj = new Image()
    imageObj.onload = () => {
      // Create Konva image
      const konvaImage = new Konva.Image({
        x: image.position.x,
        y: image.position.y,
        image: imageObj,
        name: `image-${image.name}-${index}`,
      })

      // Apply crop settings
      let cropInfo = 'none'

      if (image.crop) {
        if ('rectangular' in image.crop) {
          // Rectangular crop - specific area selection
          const crop = image.crop.rectangular
          konvaImage.setAttrs({
            cropX: crop.x,
            cropY: crop.y,
            cropWidth: crop.w,
            cropHeight: crop.h,
            width: crop.w,
            height: crop.h,
          })
          cropInfo = `rectangular ${crop.w}×${crop.h} at (${crop.x},${crop.y})`
        } else if ('focal' in image.crop) {
          // Focal crop - center-based cropping
          const focal = image.crop.focal
          const imageWidth = imageObj.naturalWidth
          const imageHeight = imageObj.naturalHeight

          // Convert focal point (0-1 range) to pixel coordinates
          const focalX = focal.x * imageWidth
          const focalY = focal.y * imageHeight

          // For now, use a default crop size or the image's natural size
          // You might want to add default crop dimensions to the image data
          const defaultCropSize = Math.min(imageWidth, imageHeight)

          // Center the crop around the focal point
          const cropX = Math.max(0, focalX - defaultCropSize / 2)
          const cropY = Math.max(0, focalY - defaultCropSize / 2)
          const cropW = Math.min(defaultCropSize, imageWidth - cropX)
          const cropH = Math.min(defaultCropSize, imageHeight - cropY)

          konvaImage.setAttrs({
            cropX: cropX,
            cropY: cropY,
            cropWidth: cropW,
            cropHeight: cropH,
            width: cropW,
            height: cropH,
          })
          cropInfo = `focal ${cropW}×${cropH} centered at (${focalX.toFixed(0)},${focalY.toFixed(0)})`
        }
      }

      contentGroup.add(konvaImage)
      konvaImage.zIndex(-5) // Negative but higher than background
      contentGroup.getLayer()?.draw() // Redraw layer after image loads

      this.devLogger.canvas(
        `Rendered image: ${image.name} at (${image.position.x}, ${image.position.y}) with crop ${cropInfo} in ${adUnitId}`,
      )
    }

    imageObj.onerror = () => {
      this.devLogger.error(`Failed to load image: ${testImageUrl} for ${image.name}`)
    }

    imageObj.src = testImageUrl
  }

  /**
   * Render CTA button element
   */
  public static renderCtaButton(adUnit: WorkingAdUnit, contentGroup: Konva.Group): void {
    const ctaButton = adUnit.ctaButton

    const ctaButtonRect = new Konva.Rect({
      x: ctaButton.x,
      y: ctaButton.y,
      width: ctaButton.width,
      height: ctaButton.height,
      cornerRadius: ctaButton.cornerRadius,
      fill: ctaButton.fill === 'none' ? undefined : ctaButton.fill,
      stroke: ctaButton.stroke,
      strokeWidth: ctaButton.strokeWidth,
      name: `cta-button-${adUnit.adUnitId}`,
    })

    contentGroup.add(ctaButtonRect)

    this.devLogger.canvas(
      `Rendered CTA button: at (${ctaButton.x}, ${ctaButton.y}) with size ${ctaButton.width}×${ctaButton.height} in ${adUnit.adUnitId}`,
    )
  }

  public static renderRollbackButton() {}
}
