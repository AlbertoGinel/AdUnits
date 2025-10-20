/**
 * Development Logger Composable
 * Returns no-op functions in production, full logging in development
 * Uses native console log levels for browser filtering
 */

export function useDevLogger(componentName = 'Unknown') {
  // Early return for production - no functionality at all
  if (!import.meta.env.DEV) {
    return {
      log: () => {},
      info: () => {},
      warn: () => {},
      error: () => {},
      debug: () => {},
      canvas: () => {},
      service: () => {},
      success: () => {},
      component: () => {},
      store: () => {},
      state: () => {},
      group: () => {},
      groupEnd: () => {},
      time: () => {},
      timeEnd: () => {},
    }
  }

  // Development functionality
  const PREFIX = 'd- '

  const categoryStyles: Record<string, string> = {
    Canvas: `${PREFIX}🖼️ Canvas`,
    Success: `${PREFIX}✅ Success`,
    Error: `${PREFIX}❌ Error`,
    Warning: `${PREFIX}⚠️ Warning`,
    Service: `${PREFIX}⚙️ Service`,
    Component: `${PREFIX}🧩 Component`,
    Store: `${PREFIX}📦 Store`,
  }

  const formatMessage = (message: string, category?: string) => {
    const prefix = category
      ? categoryStyles[category] || `${PREFIX}📝 ${category}`
      : `${PREFIX}📝 Log`
    return `${prefix} | ${componentName} | ${message}`
  }

  return {
    // Native console log levels - filterable in browser DevTools
    log: (message: string, category?: string) => {
      console.log(formatMessage(message, category))
    },

    info: (message: string, category?: string) => {
      console.info(formatMessage(message, category))
    },

    warn: (message: string, category?: string) => {
      console.warn(formatMessage(message, category))
    },

    error: (message: string, error?: unknown, category?: string) => {
      console.error(formatMessage(message, category), error)
    },

    debug: (message: string, category?: string) => {
      console.debug(formatMessage(message, category))
    },

    // Convenience methods with appropriate log levels
    canvas: (message: string) => {
      console.info(formatMessage(message, 'Canvas')) // INFO level for canvas operations
    },

    service: (message: string) => {
      console.info(formatMessage(message, 'Service')) // INFO level for service operations
    },

    success: (message: string) => {
      console.log(formatMessage(message, 'Success')) // LOG level for success messages
    },

    component: (message: string) => {
      console.debug(formatMessage(message, 'Component')) // DEBUG level for component lifecycle
    },

    store: (message: string) => {
      console.debug(formatMessage(message, 'Store')) // DEBUG level for store operations
    },

    // State logging for reactive values
    state: (name: string, value: unknown) => {
      console.debug(formatMessage(`State: ${name} = ${JSON.stringify(value)}`, 'Component'))
    }, // Grouping
    group: (title: string) => {
      console.group(`${PREFIX}📋 ${componentName} | ${title}`)
    },

    groupEnd: () => {
      console.groupEnd()
    },

    // Timing
    time: (label: string) => {
      console.time(`${PREFIX}⏱️ ${componentName} | ${label}`)
    },

    timeEnd: (label: string) => {
      console.timeEnd(`${PREFIX}⏱️ ${componentName} | ${label}`)
    },
  }
}
