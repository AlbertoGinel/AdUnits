import type { IToolService, IToolRegistry, ToolEvent, ToolContext } from '@/types/toolService'
import { ref, reactive } from 'vue'

/**
 * Central registry for all modular tools
 * Manages tool registration, activation, and lifecycle
 */
class ToolRegistry implements IToolRegistry {
  private tools = reactive<Map<string, IToolService>>(new Map())
  private activeToolId = ref<string | null>(null)
  private context: ToolContext | null = null
  private eventListeners: ((event: ToolEvent) => void)[] = []

  /**
   * Register a new tool in the system
   */
  registerTool(tool: IToolService): void {
    console.log(`📝 Registering tool: ${tool.name} (${tool.id})`)

    if (this.tools.has(tool.id)) {
      console.warn(`⚠️ Tool ${tool.id} is already registered, overriding...`)
    }

    this.tools.set(tool.id, tool)

    console.log(`✅ Tool ${tool.name} registered successfully`)
  }

  /**
   * Unregister a tool from the system
   */
  unregisterTool(toolId: string): void {
    const tool = this.tools.get(toolId)

    if (tool) {
      // Deactivate if currently active
      if (this.activeToolId.value === toolId) {
        this.deactivateCurrentTool()
      }

      this.tools.delete(toolId)
      console.log(`🗑️ Tool ${toolId} unregistered`)
    }
  }

  /**
   * Get a specific tool by ID
   */
  getTool(toolId: string): IToolService | undefined {
    return this.tools.get(toolId)
  }

  /**
   * Get all registered tools
   */
  getAllTools(): IToolService[] {
    return Array.from(this.tools.values())
  }

  /**
   * Get tools filtered by category
   */
  getToolsByCategory(category: string): IToolService[] {
    return this.getAllTools().filter((tool) => tool.category === category)
  }

  /**
   * Get currently active tool ID
   */
  getActiveToolId(): string | null {
    return this.activeToolId.value
  }

  /**
   * Set the active tool
   */
  async setActiveTool(toolId: string): Promise<void> {
    const tool = this.tools.get(toolId)

    if (!tool) {
      console.error(`❌ Tool ${toolId} not found`)
      return
    }

    // Deactivate current tool if any
    if (this.activeToolId.value) {
      await this.deactivateCurrentTool()
    }

    console.log(`🎯 Activating tool: ${tool.name}`)

    try {
      // Activate new tool
      if (tool.onActivate) {
        await tool.onActivate()
      }

      this.activeToolId.value = toolId

      this.emitEvent({
        type: 'stateChange',
        toolId: toolId,
        data: { active: true },
      })

      console.log(`✅ Tool ${tool.name} activated`)
    } catch (error) {
      console.error(`❌ Failed to activate tool ${tool.name}:`, error)

      this.emitEvent({
        type: 'error',
        toolId: toolId,
        message: `Failed to activate tool: ${error}`,
      })
    }
  }

  /**
   * Deactivate the currently active tool
   */
  private async deactivateCurrentTool(): Promise<void> {
    if (!this.activeToolId.value) return

    const tool = this.tools.get(this.activeToolId.value)
    if (!tool) return

    console.log(`🔻 Deactivating tool: ${tool.name}`)

    try {
      if (tool.onDeactivate) {
        await tool.onDeactivate()
      }

      this.emitEvent({
        type: 'stateChange',
        toolId: tool.id,
        data: { active: false },
      })

      console.log(`✅ Tool ${tool.name} deactivated`)
    } catch (error) {
      console.error(`❌ Failed to deactivate tool ${tool.name}:`, error)
    }

    this.activeToolId.value = null
  }

  /**
   * Set the tool context (banner store, etc.)
   */
  setContext(context: ToolContext): void {
    this.context = context
    console.log('🔧 Tool context updated')
  }

  /**
   * Get the current tool context
   */
  getContext(): ToolContext | null {
    return this.context
  }

  /**
   * Add event listener for tool events
   */
  addEventListener(listener: (event: ToolEvent) => void): void {
    this.eventListeners.push(listener)
  }

  /**
   * Remove event listener
   */
  removeEventListener(listener: (event: ToolEvent) => void): void {
    const index = this.eventListeners.indexOf(listener)
    if (index > -1) {
      this.eventListeners.splice(index, 1)
    }
  }

  /**
   * Emit an event to all listeners
   */
  private emitEvent(event: ToolEvent): void {
    this.eventListeners.forEach((listener) => {
      try {
        listener(event)
      } catch (error) {
        console.error('Event listener error:', error)
      }
    })
  }

  /**
   * Get statistics about registered tools
   */
  getStats(): Record<string, unknown> {
    const tools = this.getAllTools()
    const categories = [...new Set(tools.map((t) => t.category))]

    return {
      totalTools: tools.length,
      categories: categories.length,
      categoryCounts: categories.reduce(
        (acc, cat) => {
          acc[cat] = tools.filter((t) => t.category === cat).length
          return acc
        },
        {} as Record<string, number>,
      ),
      activeToolId: this.activeToolId.value,
    }
  }
}

// Export singleton instance
export const toolRegistry = new ToolRegistry()

// Helper function to register multiple tools at once
export const registerTools = (tools: IToolService[]): void => {
  tools.forEach((tool) => toolRegistry.registerTool(tool))
}

// Helper function to get active tool
export const useActiveTool = () => {
  return {
    activeToolId: toolRegistry.getActiveToolId(),
    activeTool: toolRegistry.getActiveToolId()
      ? toolRegistry.getTool(toolRegistry.getActiveToolId()!)
      : null,
  }
}
