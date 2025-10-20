import Konva from 'konva'
import type { WorkingAdUnit, AdUnitGroup } from '@/stores/adUnits'
import type { TextStyle, ImageAsset } from '@/types/creativeFrames'
import { useDevLogger } from '@/devTools/useDevLogger'

/**
 * AdUnits Element Renderer - Creates Konva objects from AdUnit data
 * Works with the simple AdUnits store structure
 */
export class AdUnitsElementRenderer {
  // Dev logger - returns no-ops in production
  private static devLogger = useDevLogger('AdUnitsElementRenderer')

  /**
   * Create complete AdUnit as Konva Group with frame, name, and edit button
   */
  public static createAdUnit(adUnit: WorkingAdUnit): Konva.Group {
    this.devLogger.canvas(`Rendering AdUnit: ${adUnit.name} (${adUnit.adUnitId})`)

    // Get frame padding from configuration
    const framePadding = { top: 50, right: 50, bottom: 50, left: 50 }

    // Calculate frame dimensions using dimensions from adUnit
    const frameWidth = adUnit.dimensions.width + framePadding.left + framePadding.right
    const frameHeight = adUnit.dimensions.height + framePadding.top + framePadding.bottom

    // Create main container group using position from adUnit
    const adUnitContainer = new Konva.Group({
      x: adUnit.position.x,
      y: adUnit.position.y,
      name: `adunit-container-${adUnit.adUnitId}`,
    })

    try {
      // 1. Create outer debugging frame (pink border)
      const outerFrame = new Konva.Rect({
        x: 0,
        y: 0,
        width: frameWidth,
        height: frameHeight,
        fill: 'transparent',
        stroke: '#ff69b4', // Pink debugging border
        strokeWidth: 2,
        dash: [5, 5], // Dashed line for debugging
        name: `outer-frame-${adUnit.adUnitId}`,
      })

      // 2. Create AdUnit name text (no background)
      const nameText = new Konva.Text({
        x: 20,
        y: 20,
        text: adUnit.name,
        fontSize: 16,
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold',
        fill: '#495057',
        name: `name-text-${adUnit.adUnitId}`,
      })

      // 3. Create Edit button text (no background, just clickable text)
      const editText = new Konva.Text({
        x: frameWidth - 60,
        y: 20,
        text: 'Edit',
        fontSize: 14,
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'normal',
        fill: '#007bff',
        name: `edit-text-${adUnit.adUnitId}`,
      })

      // 4. Create actual AdUnit content area (white background)
      const contentArea = new Konva.Rect({
        x: framePadding.left,
        y: framePadding.top,
        width: adUnit.dimensions.width,
        height: adUnit.dimensions.height,
        fill: '#ffffff',
        stroke: '#dee2e6',
        strokeWidth: 1,
        name: `content-area-${adUnit.adUnitId}`,
      })

      // 5. Create AdUnit content group (positioned within content area)
      const adUnitGroup = new Konva.Group({
        x: framePadding.left,
        y: framePadding.top,
        name: `adunit-${adUnit.adUnitId}`,
      })

      // Create text elements from creativeFrames text objects
      const headlineNode = this.createTextElement(adUnit.headline, 'headline')
      const subheadNode = this.createTextElement(adUnit.subhead, 'subhead')
      const ctaNode = this.createTextElement(adUnit.cta, 'cta')

      // Create image placeholders
      adUnit.images?.forEach((image, index) => {
        const imageNode = this.createImageElement(image, index)
        adUnitGroup.add(imageNode)
      })

      // Add text elements to content group
      adUnitGroup.add(headlineNode)
      adUnitGroup.add(subheadNode)
      adUnitGroup.add(ctaNode)

      // Make Edit text interactive
      editText.on('click tap', () => {
        this.devLogger.component(`Edit clicked for AdUnit: ${adUnit.name}`)
        console.log(`Edit AdUnit: ${adUnit.adUnitId}`)
      })

      // Change cursor on hover for Edit text
      editText.on('mouseenter', () => {
        document.body.style.cursor = 'pointer'
      })
      editText.on('mouseleave', () => {
        document.body.style.cursor = 'default'
      })

      // Assemble the complete AdUnit
      adUnitContainer.add(outerFrame) // Pink debugging frame
      adUnitContainer.add(nameText) // AdUnit name (no background)
      adUnitContainer.add(editText) // Edit text (no background)
      adUnitContainer.add(contentArea) // White content background
      adUnitContainer.add(adUnitGroup) // Actual AdUnit content

      this.devLogger.success(`Created AdUnit with frame: ${adUnit.name}`)
      return adUnitContainer
    } catch (error) {
      this.devLogger.error(`Failed to create AdUnit: ${adUnit.adUnitId}`, error)
      return adUnitContainer // Return container even on error
    }
  }

  /**
   * Create AdUnit Group with all AdUnits positioned
   */
  public static createAdUnitGroup(adUnitGroup: AdUnitGroup): Konva.Group {
    this.devLogger.canvas(`Creating AdUnit Group: ${adUnitGroup.name}`)

    const mainGroup = new Konva.Group({
      name: `adunit-group-${adUnitGroup.id}`,
    })

    // Create each Working AdUnit
    Object.values(adUnitGroup.adUnits).forEach((adUnit) => {
      if (adUnit) {
        const adUnitNode = this.createAdUnit(adUnit)
        mainGroup.add(adUnitNode)
      }
    })

    this.devLogger.success(
      `Created AdUnit Group with ${Object.keys(adUnitGroup.adUnits).length} ad units`,
    )
    return mainGroup
  }

  /**
   * Create text element from creativeFrames TextStyle object
   */
  private static createTextElement(textStyle: TextStyle, elementType: string): Konva.Text {
    const textNode = new Konva.Text({
      x: textStyle.x,
      y: textStyle.y,
      text: textStyle.text,
      fontSize: textStyle.fontSize,
      fontFamily: textStyle.fontFamily,
      fill: textStyle.fill,
      name: `${elementType}-text`,
      align: 'left',
      verticalAlign: 'top',
    })

    this.devLogger.canvas(
      `Created ${elementType} text: "${textStyle.text}" at (${textStyle.x}, ${textStyle.y})`,
    )
    return textNode
  }

  /**
   * Create simple text element from string with default positioning
   */
  private static createSimpleTextElement(
    text: string,
    elementType: string,
    adUnitId: string,
  ): Konva.Text {
    // Calculate default positions based on element type and adUnit type
    const position = this.getDefaultTextPosition(elementType, adUnitId)
    const style = this.getDefaultTextStyle(elementType)

    const textNode = new Konva.Text({
      x: position.x,
      y: position.y,
      text: text,
      fontSize: style.fontSize,
      fontFamily: style.fontFamily,
      fill: style.fill,
      fontStyle: style.fontStyle,
      name: `${elementType}-text`,
      align: 'left',
      verticalAlign: 'top',
    })

    this.devLogger.canvas(
      `Created ${elementType} text: "${text}" at (${position.x}, ${position.y})`,
    )
    return textNode
  }

  /**
   * Get default text positioning based on element type and adUnit
   */
  private static getDefaultTextPosition(
    elementType: string,
    adUnitId: string,
  ): { x: number; y: number } {
    const isDesktop = adUnitId.includes('Desktop')
    const isMarquee = adUnitId.includes('marquee')
    const isSkyline = adUnitId.includes('skyline')

    if (elementType === 'headline') {
      if (isMarquee) {
        return isDesktop ? { x: 20, y: 15 } : { x: 20, y: 20 }
      }
      if (isSkyline) {
        return { x: 20, y: 30 }
      }
      return { x: 20, y: 20 }
    }

    if (elementType === 'subhead') {
      if (isMarquee) {
        return isDesktop ? { x: 20, y: 40 } : { x: 20, y: 45 }
      }
      if (isSkyline) {
        return { x: 20, y: 60 }
      }
      return { x: 20, y: 50 }
    }

    if (elementType === 'cta') {
      if (isMarquee && isDesktop) {
        return { x: 580, y: 25 }
      }
      if (isSkyline) {
        return { x: 20, y: 520 }
      }
      return { x: 200, y: 190 }
    }

    return { x: 20, y: 20 }
  }

  /**
   * Get default text styling based on element type
   */
  private static getDefaultTextStyle(elementType: string): {
    fontSize: number
    fontFamily: string
    fill: string
    fontStyle: string
  } {
    switch (elementType) {
      case 'headline':
        return {
          fontSize: 18,
          fontFamily: 'Arial, sans-serif',
          fill: '#333333',
          fontStyle: 'bold',
        }
      case 'subhead':
        return {
          fontSize: 14,
          fontFamily: 'Arial, sans-serif',
          fill: '#666666',
          fontStyle: 'normal',
        }
      case 'cta':
        return {
          fontSize: 12,
          fontFamily: 'Arial, sans-serif',
          fill: '#007bff',
          fontStyle: 'bold',
        }
      default:
        return {
          fontSize: 12,
          fontFamily: 'Arial, sans-serif',
          fill: '#333333',
          fontStyle: 'normal',
        }
    }
  }

  /**
   * Create image placeholder element
   */
  private static createImageElement(image: ImageAsset, index: number): Konva.Group {
    const imageGroup = new Konva.Group({
      x: image.position.x,
      y: image.position.y,
      name: `image-${image.name}-${index}`,
    })

    // Create image placeholder background
    const background = new Konva.Rect({
      x: 0,
      y: 0,
      width: 100, // Default size - could be configured
      height: 100,
      fill: '#f8f9fa',
      stroke: '#dee2e6',
      strokeWidth: 1,
      name: 'image-background',
    })

    // Create image placeholder text
    const placeholder = new Konva.Text({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      text: `📷\n${image.name}`,
      fontSize: 12,
      fontFamily: 'Arial',
      fill: '#6c757d',
      align: 'center',
      verticalAlign: 'middle',
      name: 'image-placeholder',
    })

    imageGroup.add(background)
    imageGroup.add(placeholder)

    this.devLogger.canvas(`Created image placeholder: ${image.name}`)
    return imageGroup
  }

  /**
   * Update text element property
   */
  public static updateTextElement(
    textNode: Konva.Text,
    property: keyof TextStyle,
    value: string | number,
  ): boolean {
    try {
      if (property === 'text') {
        textNode.text(value as string)
      } else if (property === 'fontSize') {
        textNode.fontSize(value as number)
      } else if (property === 'fill') {
        textNode.fill(value as string)
      } else if (property === 'x') {
        textNode.x(value as number)
      } else if (property === 'y') {
        textNode.y(value as number)
      } else if (property === 'fontFamily') {
        textNode.fontFamily(value as string)
      }

      this.devLogger.success(`Updated ${property} to ${value}`)
      return true
    } catch (error) {
      this.devLogger.error(`Failed to update ${String(property)}`, error)
      return false
    }
  }

  /**
   * Find text node by element type within an AdUnit group
   */
  public static findTextNode(
    adUnitGroup: Konva.Group,
    elementType: 'headline' | 'subhead' | 'cta',
  ): Konva.Text | null {
    const nodes = adUnitGroup.find(`.${elementType}-text`)
    return nodes.length > 0 ? (nodes[0] as Konva.Text) : null
  }

  /**
   * Get AdUnit dimensions for positioning calculations
   */
  public static getAdUnitBounds(adUnit: WorkingAdUnit): {
    x: number
    y: number
    width: number
    height: number
  } {
    return {
      x: adUnit.position.x,
      y: adUnit.position.y,
      width: adUnit.dimensions.width,
      height: adUnit.dimensions.height,
    }
  }
}
