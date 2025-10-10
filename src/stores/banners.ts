import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { BANNER_TEMPLATES, ADDABLE_ELEMENTS, type BannerTemplate } from '@/types/bannerTemplates'

export interface BannerGroup {
  id: string
  name: string
  description: string
  banners: WorkingBanner[]
  metadata: {
    created_date: string
    modified_date: string
    user_name: string
  }
}

export interface WorkingBanner {
  id: string
  templateId: string
  name: string
  dimensions: {
    width: number
    height: number
    unit: string
  }
  elements: Record<string, WorkingElement>
  addedElements: Record<string, WorkingElement> // User-added elements
  metadata: {
    template_version: string
    created_date: string
    modified_date: string
    user_name: string
  }
}

export interface WorkingElement {
  id: string
  templateId?: string // Reference to template element (if from template)
  type: 'text' | 'image' | 'button' | 'shape' | 'logo'
  position: {
    center_x: number
    center_y: number
  }
  dimensions: {
    width: number
    height: number
  }
  properties: Record<string, unknown>
  isUserAdded: boolean // True if user added this element
  lockedProperties: string[]
  editableProperties: string[]
  constraints?: {
    min_width?: number
    max_width?: number
    min_height?: number
    max_height?: number
    max_content_length?: number
  }
}

export const useBannerStore = defineStore('banners', () => {
  // State
  const availableTemplates = ref<BannerTemplate[]>(BANNER_TEMPLATES)
  const currentBannerGroup = ref<BannerGroup | null>(null)
  const activeBannerId = ref<string | null>(null)
  const selectedElementId = ref<string | null>(null)

  // Debug logging for DevTools
  console.log('🎨 Banner Store Initialized')
  console.log(
    `📑 Loaded ${availableTemplates.value.length} banner templates:`,
    availableTemplates.value.map((t) => `${t.name} (${t.dimensions.width}x${t.dimensions.height})`),
  )

  // History for undo/redo (limited to property changes)
  const history = ref<BannerGroup[]>([])
  const historyIndex = ref(-1)
  const maxHistorySize = 20

  // Getters
  const activeBanner = computed(() => {
    if (!currentBannerGroup.value || !activeBannerId.value) return null
    return currentBannerGroup.value.banners.find((b) => b.id === activeBannerId.value)
  })

  const selectedElement = computed(() => {
    const banner = activeBanner.value
    if (!banner || !selectedElementId.value) return null
    return banner.elements[selectedElementId.value] || banner.addedElements[selectedElementId.value]
  })

  const allElements = computed(() => {
    const banner = activeBanner.value
    if (!banner) return {}
    return {
      ...banner.elements,
      ...banner.addedElements,
    }
  })

  const bannerGroup = computed(() => currentBannerGroup.value)

  const templateCategories = computed(() => {
    const categories = new Set(availableTemplates.value.map((t) => t.category))
    return Array.from(categories)
  })

  // Actions - Template Management
  const getTemplatesByCategory = (category: string): BannerTemplate[] => {
    return availableTemplates.value.filter((t) => t.category === category)
  }

  const getTemplate = (templateId: string): BannerTemplate | undefined => {
    return availableTemplates.value.find((t) => t.id === templateId)
  }

  // Actions - Banner Group Creation (responsive banner set)
  const createBannerGroup = (templateIds: string[], groupName?: string): string => {
    const banners: WorkingBanner[] = []

    // Create a banner for each template (responsive versions)
    templateIds.forEach((templateId) => {
      const template = getTemplate(templateId)
      if (!template) {
        throw new Error(`Template ${templateId} not found`)
      }

      // Convert template elements to working elements
      const workingElements: Record<string, WorkingElement> = {}

      Object.entries(template.elements).forEach(([key, templateElement]) => {
        workingElements[key] = {
          id: templateElement.id,
          templateId: templateElement.id,
          type: templateElement.type,
          position: { ...templateElement.position },
          dimensions: { ...templateElement.dimensions },
          properties: JSON.parse(JSON.stringify(templateElement.properties)),
          isUserAdded: false,
          lockedProperties: [...templateElement.locked_properties],
          editableProperties: [...templateElement.editable_properties],
          constraints: templateElement.constraints ? { ...templateElement.constraints } : undefined,
        }
      })

      const workingBanner: WorkingBanner = {
        id: generateId(),
        templateId: template.id,
        name: `${template.name}`,
        dimensions: { ...template.dimensions },
        elements: workingElements,
        addedElements: {},
        metadata: {
          template_version: template.metadata.version,
          created_date: new Date().toISOString(),
          modified_date: new Date().toISOString(),
          user_name: 'User',
        },
      }

      banners.push(workingBanner)
    })

    const bannerGroup: BannerGroup = {
      id: generateId(),
      name: groupName || `Ad Campaign - ${new Date().toLocaleDateString()}`,
      description: 'Responsive banner group',
      banners,
      metadata: {
        created_date: new Date().toISOString(),
        modified_date: new Date().toISOString(),
        user_name: 'User',
      },
    }

    currentBannerGroup.value = bannerGroup
    activeBannerId.value = banners[0]?.id || null
    selectedElementId.value = null
    saveToHistory()

    return bannerGroup.id
  }

  // Set active banner within the group
  const setActiveBanner = (bannerId: string) => {
    activeBannerId.value = bannerId
  }

  // Actions - Group-wide Property Updates (apply to ALL banners)
  const updateElementPropertyInAllBanners = (
    elementId: string,
    propertyPath: string,
    value: unknown,
  ): boolean => {
    if (!currentBannerGroup.value) return false

    let updateCount = 0

    currentBannerGroup.value.banners.forEach((banner) => {
      const element = banner.elements[elementId] || banner.addedElements[elementId]

      if (element) {
        // Check if property is editable
        if (element.editableProperties.includes(propertyPath)) {
          // Validate constraints
          if (validatePropertyUpdate(element, propertyPath, value)) {
            // Update the property using dot notation path
            setNestedProperty(element.properties, propertyPath, value)
            banner.metadata.modified_date = new Date().toISOString()
            updateCount++
          }
        }
      }
    })

    if (updateCount > 0) {
      currentBannerGroup.value.metadata.modified_date = new Date().toISOString()
      saveToHistory()
      return true
    }

    return false
  }

  const updateTextContentInAllBanners = (elementId: string, newContent: string): boolean => {
    return updateElementPropertyInAllBanners(elementId, 'content', newContent)
  }

  const updateImageSourceInAllBanners = (elementId: string, newSource: string): boolean => {
    return updateElementPropertyInAllBanners(elementId, 'source', newSource)
  }

  const updateColorInAllBanners = (
    elementId: string,
    colorProperty: string,
    newColor: string,
  ): boolean => {
    return updateElementPropertyInAllBanners(elementId, colorProperty, newColor)
  }

  // Actions - Individual Banner Property Updates (active banner only)
  const updateElementProperty = (
    elementId: string,
    propertyPath: string,
    value: unknown,
  ): boolean => {
    const banner = activeBanner.value
    if (!banner) return false

    const element = banner.elements[elementId] || banner.addedElements[elementId]

    if (!element) return false

    // Check if property is editable
    if (!element.editableProperties.includes(propertyPath)) {
      console.warn(`Property ${propertyPath} is not editable for element ${elementId}`)
      return false
    }

    // Validate constraints
    if (!validatePropertyUpdate(element, propertyPath, value)) {
      console.warn(`Property ${propertyPath} validation failed for element ${elementId}`)
      return false
    }

    // Update the property using dot notation path
    setNestedProperty(element.properties, propertyPath, value)

    // Update modified date
    banner.metadata.modified_date = new Date().toISOString()
    if (currentBannerGroup.value) {
      currentBannerGroup.value.metadata.modified_date = new Date().toISOString()
    }

    saveToHistory()
    return true
  }

  // Actions - Add User Elements to active banner (limited types)
  const addUserElement = (
    elementType: keyof typeof ADDABLE_ELEMENTS,
    position?: { x: number; y: number },
  ): string => {
    const banner = activeBanner.value
    if (!banner) {
      throw new Error('No active banner')
    }

    const elementConfig = ADDABLE_ELEMENTS[elementType]
    if (!elementConfig) {
      throw new Error(`Element type ${elementType} is not addable`)
    }

    const elementId = `user_${elementType}_${Date.now()}`
    const defaultPosition = position || { x: 100, y: 100 }

    const newElement: WorkingElement = {
      id: elementId,
      type: elementConfig.type as 'text' | 'image' | 'button' | 'shape' | 'logo',
      position: {
        center_x: defaultPosition.x,
        center_y: defaultPosition.y,
      },
      dimensions: {
        width: 100,
        height: 50,
      },
      properties: JSON.parse(JSON.stringify(elementConfig.default_properties)),
      isUserAdded: true,
      lockedProperties: [],
      editableProperties: [...elementConfig.editable_properties],
    }

    banner.addedElements[elementId] = newElement
    selectedElementId.value = elementId

    banner.metadata.modified_date = new Date().toISOString()
    if (currentBannerGroup.value) {
      currentBannerGroup.value.metadata.modified_date = new Date().toISOString()
    }
    saveToHistory()

    return elementId
  }

  // Actions - Remove User Elements from active banner (only user-added elements can be removed)
  const removeUserElement = (elementId: string): boolean => {
    const banner = activeBanner.value
    if (!banner) return false

    const element = banner.addedElements[elementId]
    if (!element || !element.isUserAdded) {
      console.warn('Cannot remove template elements')
      return false
    }

    delete banner.addedElements[elementId]

    if (selectedElementId.value === elementId) {
      selectedElementId.value = null
    }

    banner.metadata.modified_date = new Date().toISOString()
    if (currentBannerGroup.value) {
      currentBannerGroup.value.metadata.modified_date = new Date().toISOString()
    }
    saveToHistory()

    return true
  }

  // Actions - Element Selection
  const setSelectedElement = (elementId: string | null) => {
    selectedElementId.value = elementId
  }

  // Actions - History Management (limited)
  const saveToHistory = () => {
    if (!currentBannerGroup.value) return

    // Remove any history after current index
    history.value = history.value.slice(0, historyIndex.value + 1)

    // Add current state to history
    history.value.push(JSON.parse(JSON.stringify(currentBannerGroup.value)))

    // Limit history size
    if (history.value.length > maxHistorySize) {
      history.value = history.value.slice(-maxHistorySize)
    }

    historyIndex.value = history.value.length - 1
  }

  const undo = () => {
    if (historyIndex.value > 0 && currentBannerGroup.value) {
      historyIndex.value--
      currentBannerGroup.value = JSON.parse(JSON.stringify(history.value[historyIndex.value]))
    }
  }

  const redo = () => {
    if (historyIndex.value < history.value.length - 1) {
      historyIndex.value++
      currentBannerGroup.value = JSON.parse(JSON.stringify(history.value[historyIndex.value]))
    }
  }

  const canUndo = computed(() => historyIndex.value > 0)
  const canRedo = computed(() => historyIndex.value < history.value.length - 1)

  // Actions - Export
  const exportBannerGroup = (): string => {
    if (!currentBannerGroup.value) {
      throw new Error('No active banner group to export')
    }

    const exportData = {
      bannerGroup: currentBannerGroup.value,
    }

    return JSON.stringify(exportData, null, 2)
  }

  // Utility Functions
  const validatePropertyUpdate = (
    element: WorkingElement,
    propertyPath: string,
    value: unknown,
  ): boolean => {
    if (!element.constraints) return true

    // Validate text content length
    if (propertyPath === 'content' && element.constraints.max_content_length) {
      if (typeof value === 'string' && value.length > element.constraints.max_content_length) {
        return false
      }
    }

    // Validate dimensions
    if (propertyPath === 'dimensions.width' && typeof value === 'number') {
      if (element.constraints.min_width && value < element.constraints.min_width) return false
      if (element.constraints.max_width && value > element.constraints.max_width) return false
    }

    if (propertyPath === 'dimensions.height' && typeof value === 'number') {
      if (element.constraints.min_height && value < element.constraints.min_height) return false
      if (element.constraints.max_height && value > element.constraints.max_height) return false
    }

    return true
  }

  const setNestedProperty = (obj: Record<string, unknown>, path: string, value: unknown) => {
    const keys = path.split('.')
    let current: Record<string, unknown> = obj

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (!key) continue

      if (!(key in current) || typeof current[key] !== 'object' || current[key] === null) {
        current[key] = {}
      }
      current = current[key] as Record<string, unknown>
    }

    const lastKey = keys[keys.length - 1]
    if (lastKey) {
      current[lastKey] = value
    }
  }

  const generateId = (): string => {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Initialize with default responsive banner group
  const initializeStore = () => {
    if (!currentBannerGroup.value && availableTemplates.value.length > 0) {
      // Create a responsive banner group with multiple sizes
      const templateIds = availableTemplates.value.slice(0, 2).map((t) => t.id) // Take first 2 templates
      if (templateIds.length > 0) {
        createBannerGroup(templateIds, 'Default Ad Campaign')
      }
    }
  }

  return {
    // State
    availableTemplates,
    currentBannerGroup,
    activeBannerId,
    selectedElementId,

    // Getters
    activeBanner,
    selectedElement,
    allElements,
    bannerGroup,
    templateCategories,
    canUndo,
    canRedo,

    // Actions
    getTemplatesByCategory,
    getTemplate,
    createBannerGroup,
    setActiveBanner,
    updateElementProperty,
    updateElementPropertyInAllBanners,
    updateTextContentInAllBanners,
    updateImageSourceInAllBanners,
    updateColorInAllBanners,
    addUserElement,
    removeUserElement,
    setSelectedElement,
    undo,
    redo,
    exportBannerGroup,
    initializeStore,
  }
})
