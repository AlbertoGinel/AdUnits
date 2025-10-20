/**
 * Konva DevTools Composable
 * Returns no-op functions in production, full DevTools integration in development
 */

export function useKonvaDevTools() {
  // Early return for production - no functionality
  if (!import.meta.env.DEV) {
    return {
      enable: () => {},
      cleanup: () => {},
      isEnabled: () => false,
    }
  }

  // Development functionality
  const enable = (stage: any) => {
    try {
      // Make stage globally accessible
      ;(window as any).konvaStage = stage

      // Try to enable DevTools immediately
      if ((window as any).KonvaDev) {
        ;(window as any).KonvaDev.enable()
        console.log('k- ✅ Success | Konva DevTools enabled immediately')
      } else {
        // Wait for DevTools to load
        setTimeout(() => {
          if ((window as any).KonvaDev) {
            ;(window as any).KonvaDev.enable()
            console.log('k- ✅ Success | Konva DevTools enabled (delayed)')
          } else {
            console.warn('k- ⚠️ Warning | Konva DevTools not found - install browser extension')
          }
        }, 500)
      }
    } catch (error) {
      console.error('k- ❌ Error | Failed to enable Konva DevTools', error)
    }
  }

  const cleanup = () => {
    if ((window as any).konvaStage) {
      delete (window as any).konvaStage
      console.log('k- 🖼️ Canvas | Cleaned up Konva DevTools references')
    }
  }

  const isEnabled = () => {
    return !!(window as any).konvaStage && !!(window as any).KonvaDev
  }

  return {
    enable,
    cleanup,
    isEnabled,
  }
}
