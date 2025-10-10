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
 * - menuPages/ImagesPage1.vue         # Image Library - Search, browse, select images
 * - menuPages/ImagesPage2.vue         # Upload Center - Drag & drop with settings
 * - menuPages/ImagesPage3.vue         # Effects Studio - Filters and adjustments
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
 * 1. 📁 Library Page - Browse existing images, search functionality
 * 2. 📤 Upload Page - Add new images with drag & drop or file browser
 * 3. 🎨 Effects Page - Apply filters and adjustments with live preview
 * 4. 🔄 Circular Navigation - Seamless flow between all pages
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
export { default as ImagesPage1 } from './menuPages/ImagesPage1.vue'
export { default as ImagesPage2 } from './menuPages/ImagesPage2.vue'
export { default as ImagesPage3 } from './menuPages/ImagesPage3.vue'
