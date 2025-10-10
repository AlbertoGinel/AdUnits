# 🖼️ Images Tool Package

A comprehensive image management tool for the banner editor, built with Vue.js components and modular service architecture.

## 📁 Package Structure

```
/services/tools/images/
├── 📋 ImagesTool.ts              # 🏢 Service Boss - Coordinates all functionality
├── 📄 index.ts                   # 📦 Package exports and documentation
├── 📖 README.md                  # 📚 This documentation file
│
├── 🧩 components/
│   ├── ImagesToolButton.vue      # 🔘 Custom toolbar button with page indicator
│   └── ImagesToolMenu.vue        # 🖼️ Main menu container with transitions
│
└── 📱 menuPages/
    ├── ImagesPage1.vue           # 📁 Image Library - Search & selection
    ├── ImagesPage2.vue           # 📤 Upload Center - Drag & drop
    └── ImagesPage3.vue           # 🎨 Effects Studio - Filters & adjustments
```

## 🎯 Features

### 📁 Image Library (Page 1)

- ✅ **Real-time Search**: Filter images as you type
- ✅ **Grid Layout**: Responsive image thumbnails
- ✅ **Selection System**: Click to select images
- ✅ **Add New Button**: Quick access to upload

### 📤 Upload Center (Page 2)

- ✅ **Drag & Drop**: Intuitive file dropping
- ✅ **File Browser**: Click to browse files
- ✅ **Upload Settings**: Auto-resize and size controls
- ✅ **Validation**: File type and size checking

### 🎨 Effects Studio (Page 3)

- ✅ **Filter Grid**: Visual effect selection
- ✅ **Live Preview**: Real-time effect application
- ✅ **Intensity Controls**: Adjustable effect strength
- ✅ **Effect Types**: Blur, Brightness, Contrast, Sepia, etc.

## 🎮 User Journey

```
📁 Library → 📤 Upload → 🎨 Effects → 📁 Library
   ↑___________________________________________|
                (Circular Navigation)
```

1. **Browse Library**: Search and select existing images
2. **Upload New**: Add images via drag & drop or file browser
3. **Apply Effects**: Enhance images with filters and adjustments
4. **Back to Library**: Seamless circular navigation

## 🏗️ Architecture

### 🎯 Service Boss Pattern

The `ImagesTool.ts` acts as the **service boss** that:

- Implements `IToolService` interface
- Provides Vue components for UI
- Handles all action dispatching
- Manages internal tool state
- Coordinates between components

### 🧩 Component-Based UI

- **ImagesToolButton**: Custom toolbar button with page badge
- **ImagesToolMenu**: Main container with page navigation
- **ImagesPageX**: Individual page components with specific functionality

### 📡 Event-Driven Communication

```typescript
// Tool ←→ Components communication
tool.executeAction(action) → Tool processes → Components update
Components @action → Tool handles → State changes → UI updates
```

## 📋 Usage

### Basic Integration

```typescript
import { ImagesTool } from '@/services/tools/images'

// Register the tool
toolRegistry.registerTool(new ImagesTool())

// Tool automatically provides:
// - Custom button in toolbar
// - Multi-page menu in sidebar
// - Complete image functionality
```

### Advanced Usage

```typescript
import { ImagesTool, ImagesToolButton, ImagesToolMenu, ImagesPage1 } from '@/services/tools/images'

// Use individual components if needed
// (for custom implementations)
```

## 🎨 Styling

Each component has **scoped styles** with:

- 🎪 **Hover Effects**: Interactive feedback
- 🌊 **Smooth Transitions**: Page changes with slide animations
- 🎯 **Visual Indicators**: Active states, page dots, badges
- 📱 **Responsive Design**: Works on all screen sizes

## 🔧 Extending

### Adding New Pages

1. Create new Vue component in `menuPages/`
2. Add to `ImagesToolMenu.vue` navigation
3. Add action handling in `ImagesTool.ts`
4. Export from `index.ts` if needed

### Custom Effects

1. Add effect to `ImagesPage3.vue` effects array
2. Implement effect logic in `handleSelectEffect()`
3. Add any new UI controls as needed

## 🚀 Benefits

- ✅ **Modular**: Self-contained package with all dependencies
- ✅ **Reusable**: Components can be used independently
- ✅ **Maintainable**: Clear separation of concerns
- ✅ **Extensible**: Easy to add new pages or features
- ✅ **Type-Safe**: Full TypeScript support
- ✅ **Performance**: Efficient Vue.js reactivity
- ✅ **Professional**: Production-ready code quality
