import { toolRegistry } from '@/services/toolRegistry'
import { ImagesTool } from '@/services/tools/images'
import { LogosTool } from '@/services/tools/logos'

/**
 * Initialize and register all available tools
 */
export const initializeTools = () => {
  console.log('🚀 Initializing modular tools...')

  // Register the Images tool
  const imagesTool = new ImagesTool()
  toolRegistry.registerTool(imagesTool)

  // Register the Logos tool
  const logosTool = new LogosTool()
  toolRegistry.registerTool(logosTool)

  console.log('✅ Tools initialized successfully')
  console.log('📊 Tool registry stats:', toolRegistry.getStats())
}

/**
 * Auto-activate the first tool for demo purposes
 */
export const activateDefaultTool = async () => {
  const tools = toolRegistry.getAllTools()

  if (tools.length > 0 && tools[0]) {
    console.log('🎯 Auto-activating first tool:', tools[0].name)
    await toolRegistry.setActiveTool(tools[0].id)
  }
}
