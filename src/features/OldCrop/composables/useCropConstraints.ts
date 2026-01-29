import type { CropData } from './useCropMode'

export interface CropConstraints {
  imageDimensions: { width: number; height: number }
  frameSize: { width: number; height: number }
}

/**
 * Crop constraint utilities
 */
export function useCropConstraints() {
  /**
   * Constrain crop to ensure visible frame stays within image bounds
   * and maintains proper aspect ratio
   */
  const constrainCrop = (
    proposedCrop: Partial<CropData>,
    constraints: CropConstraints,
  ): CropData => {
    const { imageDimensions, frameSize } = constraints

    // Calculate target aspect ratio from frame size
    const targetAspectRatio = frameSize.width / frameSize.height

    // Default to full image if no current crop
    const current: CropData = {
      x: 0,
      y: 0,
      width: imageDimensions.width,
      height: imageDimensions.height,
    }

    // Start with current values, override with proposed
    const newCrop: CropData = {
      x: proposedCrop.x !== undefined ? proposedCrop.x : current.x,
      y: proposedCrop.y !== undefined ? proposedCrop.y : current.y,
      width: proposedCrop.width !== undefined ? proposedCrop.width : current.width,
      height: proposedCrop.height !== undefined ? proposedCrop.height : current.height,
    }

    // Enforce aspect ratio if only one dimension changed
    if (proposedCrop.width !== undefined && proposedCrop.height === undefined) {
      console.log('🔧 Aspect Ratio: Width-only change, calculating height')
      const oldHeight = newCrop.height
      newCrop.height = newCrop.width / targetAspectRatio
      console.log(`   Height adjusted from ${oldHeight} to ${newCrop.height}`)
    } else if (proposedCrop.height !== undefined && proposedCrop.width === undefined) {
      console.log('🔧 Aspect Ratio: Height-only change, calculating width')
      const oldWidth = newCrop.width
      newCrop.width = newCrop.height * targetAspectRatio
      console.log(`   Width adjusted from ${oldWidth} to ${newCrop.width}`)
    } else if (proposedCrop.width !== undefined && proposedCrop.height !== undefined) {
      // Both dimensions provided, check if aspect ratio matches
      const currentAspect = newCrop.width / newCrop.height
      const diff = Math.abs(currentAspect - targetAspectRatio)

      if (diff > 0.01) {
        console.log('🔧 Aspect Ratio: Both dimensions provided, aspect mismatch detected')
        console.log(
          `   Current aspect: ${currentAspect.toFixed(3)} Target aspect: ${targetAspectRatio.toFixed(3)}`,
        )
        const oldHeight = newCrop.height
        newCrop.height = newCrop.width / targetAspectRatio
        console.log(`   Height adjusted from ${oldHeight} to ${newCrop.height}`)
      }
    }

    // Constrain minimum size (frame must always be fully visible)
    const minScale = Math.max(
      frameSize.width / imageDimensions.width,
      frameSize.height / imageDimensions.height,
    )
    const minWidth = frameSize.width / minScale
    const minHeight = frameSize.height / minScale

    if (newCrop.width < minWidth) {
      console.log(`🔧 Constrain: Width below minimum, clamped from ${newCrop.width} to ${minWidth}`)
      newCrop.width = minWidth
      newCrop.height = minWidth / targetAspectRatio
    }
    if (newCrop.height < minHeight) {
      console.log(
        `🔧 Constrain: Height below minimum, clamped from ${newCrop.height} to ${minHeight}`,
      )
      newCrop.height = minHeight
      newCrop.width = minHeight * targetAspectRatio
    }

    // Constrain to image bounds - width/height
    if (newCrop.width > imageDimensions.width) {
      console.log(
        `🔧 Constrain: Width exceeds bounds, clamped from ${newCrop.width} to ${imageDimensions.width}`,
      )
      newCrop.width = imageDimensions.width
      newCrop.height = newCrop.width / targetAspectRatio
    }
    if (newCrop.height > imageDimensions.height) {
      console.log(
        `🔧 Constrain: Height exceeds bounds, clamped from ${newCrop.height} to ${imageDimensions.height}`,
      )
      newCrop.height = imageDimensions.height
      newCrop.width = newCrop.height * targetAspectRatio
    }

    // Constrain position
    const oldX = newCrop.x
    const oldY = newCrop.y
    newCrop.x = Math.max(0, Math.min(newCrop.x, imageDimensions.width - newCrop.width))
    newCrop.y = Math.max(0, Math.min(newCrop.y, imageDimensions.height - newCrop.height))

    if (newCrop.x !== oldX || newCrop.y !== oldY) {
      console.log(
        `🔧 Constrain: Position clamped from {x: ${oldX}, y: ${oldY}} to {x: ${newCrop.x}, y: ${newCrop.y}}`,
      )
    }

    console.log('✅ Final crop:', newCrop)
    return newCrop
  }

  /**
   * Convert stage coordinates to image coordinates
   */
  const stageToImageCoords = (
    stageX: number,
    stageY: number,
    imagePosition: { x: number; y: number },
    imageScale: number,
  ): { x: number; y: number } => {
    return {
      x: (stageX - imagePosition.x) / imageScale,
      y: (stageY - imagePosition.y) / imageScale,
    }
  }

  /**
   * Convert image coordinates to stage coordinates
   */
  const imageToStageCoords = (
    imageX: number,
    imageY: number,
    imagePosition: { x: number; y: number },
    imageScale: number,
  ): { x: number; y: number } => {
    return {
      x: imageX * imageScale + imagePosition.x,
      y: imageY * imageScale + imagePosition.y,
    }
  }

  /**
   * Calculate the scale needed to fit the full image in the stage
   * while respecting the current crop data
   */
  const calculateImageScale = (
    imageDimensions: { width: number; height: number },
    frameSize: { width: number; height: number },
    cropData: CropData,
    stageSize: { width: number; height: number },
  ): number => {
    // Calculate what scale the crop area should be to fit the frame
    const cropToFrameScaleX = frameSize.width / cropData.width
    const cropToFrameScaleY = frameSize.height / cropData.height
    const cropToFrameScale = Math.min(cropToFrameScaleX, cropToFrameScaleY)

    // Scale the full image accordingly
    const fullImageWidth = imageDimensions.width * cropToFrameScale
    const fullImageHeight = imageDimensions.height * cropToFrameScale

    // Ensure the full image fits in the stage with some padding
    const stageScaleX = (stageSize.width * 0.8) / fullImageWidth
    const stageScaleY = (stageSize.height * 0.8) / fullImageHeight
    const stageScale = Math.min(stageScaleX, stageScaleY, 1)

    return cropToFrameScale * stageScale
  }

  /**
   * Calculate the position to center the crop area on stage
   */
  const calculateImagePosition = (
    imageDimensions: { width: number; height: number },
    cropData: CropData,
    imageScale: number,
    stageSize: { width: number; height: number },
  ): { x: number; y: number } => {
    // Position image so that crop area is centered on stage
    const cropCenterX = cropData.x + cropData.width / 2
    const cropCenterY = cropData.y + cropData.height / 2

    const stageCenterX = stageSize.width / 2
    const stageCenterY = stageSize.height / 2

    return {
      x: stageCenterX - cropCenterX * imageScale,
      y: stageCenterY - cropCenterY * imageScale,
    }
  }

  return {
    constrainCrop,
    stageToImageCoords,
    imageToStageCoords,
    calculateImageScale,
    calculateImagePosition,
  }
}
