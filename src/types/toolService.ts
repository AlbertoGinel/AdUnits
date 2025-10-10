/**
 * Base interface for modular tools in the banner editor
 * Each tool provides button configuration, menu interface, and actions
 */

export interface ToolButtonConfig {
  id: string
  label: string
  icon: string
  tooltip?: string
  position?: 'top' | 'bottom'
  disabled?: boolean
  badge?: string | number
}

export interface ToolMenuSection {
  id: string
  title?: string
  type: 'input' | 'button' | 'select' | 'slider' | 'colorPicker' | 'fileUpload' | 'toggle' | 'group'
  label?: string
  placeholder?: string
  value?: unknown
  options?: Array<{ label: string; value: unknown }>
  min?: number
  max?: number
  step?: number
  accept?: string // for file uploads
  children?: ToolMenuSection[] // for groups
  action?: string // action identifier for buttons
  disabled?: boolean
  description?: string
}

export interface ToolMenuConfig {
  title: string
  sections: ToolMenuSection[]
  width?: number
  height?: number
}

export interface ToolAction {
  type: string
  payload?: Record<string, unknown>
  target?: 'element' | 'banner' | 'group' | 'global'
}

export interface ToolActionResult {
  success: boolean
  message?: string
  data?: unknown
}

/**
 * Main interface that all tools must implement
 */
export interface IToolService {
  // Tool identification
  readonly id: string
  readonly name: string
  readonly category: 'content' | 'design' | 'media' | 'layout' | 'utility'
  readonly version: string

  // Component-based approach (new way)
  getButtonComponent?(): unknown // Vue component
  getMenuComponent?(): unknown // Vue component

  // Configuration approach (legacy - still supported)
  getButtonConfig?(): ToolButtonConfig
  getMenuConfig?(): ToolMenuConfig

  // Tool lifecycle
  onActivate?(): void | Promise<void>
  onDeactivate?(): void | Promise<void>

  // Action handling
  executeAction(action: ToolAction): Promise<ToolActionResult>

  // State management
  getState?(): Record<string, unknown>
  setState?(state: Record<string, unknown>): void

  // Validation
  canExecuteAction?(action: ToolAction): boolean
} /**
 * Tool registry for managing all available tools
 */
export interface IToolRegistry {
  registerTool(tool: IToolService): void
  unregisterTool(toolId: string): void
  getTool(toolId: string): IToolService | undefined
  getAllTools(): IToolService[]
  getToolsByCategory(category: string): IToolService[]
  getActiveToolId(): string | null
  setActiveTool(toolId: string): void
}

/**
 * Events that tools can emit
 */
export interface ToolEvent {
  type: 'stateChange' | 'actionComplete' | 'error' | 'notification'
  toolId: string
  data?: unknown
  message?: string
}

/**
 * Tool context - provides access to banner store and other services
 */
export interface ToolContext {
  bannerStore: Record<string, unknown> // Will be properly typed when integrated
  emit: (event: ToolEvent) => void
  getCurrentElement: () => Record<string, unknown> | null
  getCurrentBanner: () => Record<string, unknown> | null
  getBannerGroup: () => Record<string, unknown> | null
}
