/**
 * 🖼️ Images Tool Package - Complete Media Management Solution
 *
 * This package provides a comprehensive image management tool for the banner editor,
 * built with Vue.js components and a modular service architecture.
 *
 * 📦 Package Contents:
 *
 * 🏢 Service Boss:
 * - ImagesTool.ts                     # Main service class that coordinates everything
 *
 * 🧩 UI Components:
 * - components/ImagesToolButton.vue   # Custom toolbar button with page indicator
 * - components/ImagesToolMenu.vue     # Main menu container with smooth transitions
 *
 * 📱 Menu Pages:
 * - menuPages/editMainImage.vue       # Edit Main Image - Primary editing interface
 * - menuPages/UploadImages.vue        # Upload Images - Add new images with drag & drop
 * - menuPages/ChangeImage.vue         # Change Image - Select different image from library
 *
 * 🎯 Features:
 * ✅ Multi-page navigation with smooth transitions
 * ✅ Real-time image search and filtering
 * ✅ Drag & drop file upload with validation
 * ✅ Image effects with live preview controls
 * ✅ Responsive grid layouts for all screen sizes
 * ✅ Page indicator dots and navigation controls
 * ✅ Custom styling with hover states and animations
 *
 * 🎮 User Journey:
 * 1. �️ Edit Main Image - Primary editing interface (default page)
 * 2. 📤 Upload Images - Add new images with drag & drop or file browser
 * 3. 🔄 Change Image - Select different image from library
 * 4. ↩️ Navigation - Add Images → Upload, Change → Change Image, Back to Edit Main Image
 *
 * 💡 Architecture:
 * - Service-based modular design
 * - Component-driven UI architecture
 * - Event-driven communication between components
 * - State management through tool registry
 * - Full TypeScript support with proper typing
 *
 * 📋 Usage:
 * ```typescript
 * import { ImagesTool } from '@/services/tools/images'
 *
 * // Register the tool
 * toolRegistry.registerTool(new ImagesTool())
 *
 * // Tool automatically provides:
 * // - Custom button component for toolbar
 * // - Multi-page menu component for sidebar
 * // - Complete image management functionality
 * ```
 */

export { ImagesTool } from './ImagesTool'

// Export components for advanced usage (optional)
export { default as ImagesToolButton } from './components/ImagesToolButton.vue'
export { default as ImagesToolMenu } from './components/ImagesToolMenu.vue'
export { default as EditMainImage } from './menuPages/editMainImage.vue'
export { default as UploadImages } from './menuPages/UploadImages.vue'
export { default as ChangeImage } from './menuPages/ChangeImage.vue'
