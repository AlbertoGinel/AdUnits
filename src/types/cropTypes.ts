/**
 * Crop-related type definitions
 */

/**
 * Crop area bounds in image pixel coordinates
 */
export interface CropData {
  x: number // Crop X in image pixels
  y: number // Crop Y in image pixels
  width: number // Crop width in image pixels
  height: number // Crop height in image pixels
}

/**
 * Frame configuration in stage coordinates
 */
export interface FrameConfig {
  x: number // Display position X (stage coordinates)
  y: number // Display position Y (stage coordinates)
  width: number // Display width (stage coordinates)
  height: number // Display height (stage coordinates)
}

/**
 * Transform scale values
 */
export interface TransformScale {
  scaleX: number // Horizontal scale multiplier
  scaleY: number // Vertical scale multiplier
}

/**
 * Validation result for crop changes
 */
export interface CropValidationResult {
  isValid: boolean
  correctedFrameConfig?: FrameConfig
  correctedScale?: TransformScale
}

/**
 * Crop change event types
 */
export type CropChangeEventType = 'drag' | 'transform'
