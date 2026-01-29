import { defineStore } from 'pinia'
import type { AdUnit, AdUnitElement } from '../../types/adUnitElementTypes'
import {
  hasVisibility,
  isImageElement,
  isTextElement,
  lockFieldMap,
} from '../../types/adUnitElementTypes'
import type { ElementType, EditableElementType, EditablePropertiesOf } from '../../types/mainTypes'

export type AdUnitsRecord = Record<string, AdUnit>

export const useAdUnitStore = defineStore('adUnits', {
  // State
  state: (): { adUnits: AdUnitsRecord } => ({
    adUnits: {},
  }),

  // Getters
  getters: {
    getAdUnit: (state) => {
      return (id: string): AdUnit | undefined => {
        return state.adUnits[id]
      }
    },

    getElement: (state) => {
      return (adUnitID: string, elementKey: string): AdUnitElement | undefined => {
        const adUnit = state.adUnits[adUnitID]
        return adUnit?.elements[elementKey]
      }
    },

    getAllAdUnits: (state) => (): AdUnitsRecord => {
      return { ...state.adUnits }
    },

    getImageOfAdUnit: (state) => {
      return (adUnitID: string): string | null => {
        const element = state.adUnits[adUnitID]?.elements?.image
        return element && isImageElement(element) ? element.imageID : null
      }
    },

    getAdUnitIds: (state) => (): string[] => {
      return Object.keys(state.adUnits)
    },

    getAdUnitsCount: (state) => (): number => {
      return Object.keys(state.adUnits).length
    },

    getAdUnitsByLockStatus: (state) => {
      return (elementKey: EditableElementType, locked: boolean = true): string[] => {
        return Object.keys(state.adUnits).filter((adUnitID) => {
          const element = state.adUnits[adUnitID]?.elements?.[elementKey]
          return element && 'locked' in element && (locked ? element.locked : !element.locked)
        })
      }
    },

    getDisclaimerVisibilityByLockStatus: (state) => {
      return (locked: boolean = true): string[] => {
        return Object.keys(state.adUnits).filter((adUnitID) => {
          const element = state.adUnits[adUnitID]?.elements?.['disclaimer']
          return (
            element &&
            hasVisibility(element) &&
            'visibilityLock' in element &&
            (locked ? element.visibilityLock : !element.visibilityLock)
          )
        })
      }
    },

    hasAdUnits: (state) => (): boolean => {
      return Object.keys(state.adUnits).length > 0
    },

    getAdUnitElements: (state) => {
      return (adUnitID: string): AdUnitElement[] => {
        const adUnit = state.adUnits[adUnitID]
        if (adUnit) {
          const elementsArray = Object.values(adUnit.elements)
          return elementsArray
        }
        return []
      }
    },

    // Enhanced getters for better element type handling
    getElementText: (state) => {
      return (adUnitID: string, elementKey: string): string | null => {
        const element = state.adUnits[adUnitID]?.elements?.[elementKey]
        return element && isTextElement(element) ? element.text : null
      }
    },

    getElementImageID: (state) => {
      return (adUnitID: string, elementKey: string): string | null => {
        const element = state.adUnits[adUnitID]?.elements?.[elementKey]
        return element && isImageElement(element) ? element.imageID : null
      }
    },

    getElementVisibility: (state) => {
      return (adUnitID: string, elementKey: string): boolean | null => {
        const element = state.adUnits[adUnitID]?.elements?.[elementKey]
        return element && hasVisibility(element) ? (element.visibility ?? true) : null
      }
    },

    getCropData: (state) => {
      return (adUnitID: string): { x: number; y: number; width: number; height: number } | null => {
        const element = state.adUnits[adUnitID]?.elements?.image
        return element && 'cropData' in element ? element.cropData || null : null
      }
    },

    // Get elements by type across all ad units
    getElementsByType: (state) => {
      return (
        elementType: ElementType,
      ): Array<{ adUnitID: string; elementKey: string; element: AdUnitElement }> => {
        const results: Array<{ adUnitID: string; elementKey: string; element: AdUnitElement }> = []

        Object.entries(state.adUnits).forEach(([adUnitID, adUnit]) => {
          Object.entries(adUnit.elements).forEach(([elementKey, element]) => {
            if (element.type === elementType) {
              results.push({ adUnitID, elementKey, element })
            }
          })
        })

        return results
      }
    },

    isLocked: (state) => {
      return <T extends EditableElementType, P extends EditablePropertiesOf<T>>(
        adUnitId: string,
        elementKey: T,
        property: P,
      ): boolean => {
        const element = state.adUnits[adUnitId]?.elements[elementKey]
        if (!element) return false

        const lockField = lockFieldMap[property as keyof typeof lockFieldMap]
        if (!(lockField in element)) return false

        // Type assertion: we know lockField is 'locked' or 'visibilityLock', both are boolean
        return (element as Record<string, unknown>)[lockField] === true
      }
    },
    getAdUnitsByPropertyLock: (state) => {
      return <T extends EditableElementType, P extends EditablePropertiesOf<T>>(
        elementKey: T,
        property: P,
        isLocked: boolean = true, // Default to locked
      ): string[] => {
        return Object.keys(state.adUnits).filter((adUnitId) => {
          const element = state.adUnits[adUnitId]?.elements[elementKey]
          if (!element) return false

          const lockField = lockFieldMap[property as keyof typeof lockFieldMap]
          if (!(lockField in element)) return false

          const lockValue = (element as Record<string, unknown>)[lockField] === true
          return isLocked ? lockValue : !lockValue
        })
      }
    },
  },

  // Actions
  actions: {
    // Setters - completely replace state
    setAdUnits(newAdUnits: AdUnitsRecord) {
      this.adUnits = { ...newAdUnits }
    },

    setAdUnit(adUnit: AdUnit) {
      this.adUnits[adUnit.id] = adUnit
    },

    setElement(adUnitID: string, elementKey: string, element: AdUnitElement) {
      const adUnit = this.adUnits[adUnitID]
      if (adUnit) {
        adUnit.elements[elementKey] = element
      }
    },

    // CRUD operations
    addAdUnit(adUnit: AdUnit) {
      this.adUnits[adUnit.id] = adUnit
    },

    updateAdUnit(id: string, updates: Partial<AdUnit>) {
      const existing = this.adUnits[id]
      if (existing) {
        this.adUnits[id] = { ...existing, ...updates }
      }
    },

    updateElement(adUnitID: string, elementKey: string, updates: Partial<AdUnitElement>) {
      const adUnit = this.adUnits[adUnitID]
      const element = adUnit?.elements[elementKey]

      if (adUnit && element) {
        adUnit.elements[elementKey] = { ...element, ...updates }
      }
    },

    updateVertical(
      adUnitIds: string[],
      elementKey: string,
      propertyName: keyof AdUnitElement,
      value: unknown,
    ) {
      adUnitIds.forEach((adUnitID) => {
        const adUnit = this.adUnits[adUnitID]
        const element = adUnit?.elements?.[elementKey]

        if (adUnit && element) {
          // Type-safe property assignment using unknown intermediate cast
          ;(element as unknown as Record<string, unknown>)[propertyName] = value
        }
      })
    },

    removeAdUnit(id: string) {
      delete this.adUnits[id]
    },

    clearAdUnits() {
      this.adUnits = {}
    },

    cascadeUnlock<T extends EditableElementType, P extends EditablePropertiesOf<T>>(
      elementKey: T,
      property: P,
    ): void {
      const lockField = lockFieldMap[property as keyof typeof lockFieldMap]
      let unlockedCount = 0

      Object.keys(this.adUnits).forEach((adUnitId) => {
        const element = this.adUnits[adUnitId]?.elements[elementKey]

        // Skip if element doesn't exist
        if (!element) return

        // Skip if lock field doesn't exist on this element
        if (!(lockField in element)) return // Set lock field to false
        ;(element as Record<string, unknown>)[lockField] = false
        unlockedCount++
      })

      console.log(
        `🔓 Unlocked ${String(elementKey)}.${String(property)} in ${unlockedCount} AdUnits`,
      )
    },

    setCropData(
      adUnitID: string,
      cropData: { x: number; y: number; width: number; height: number },
    ) {
      const adUnit = this.adUnits[adUnitID]
      const imageElement = adUnit?.elements?.image

      if (adUnit && imageElement && 'cropData' in imageElement) {
        this.updateElement(adUnitID, 'image', { cropData })
      }
    },
  },
})
