import { defineStore } from 'pinia'
import type { AdUnitsRecord, AdUnit } from '../../types/mainTypes'
import type { AdUnitElement, ElementType } from '../../types/adUnitElementTypes'
import { hasVisibility, isTextElement, isImageElement } from '../../types/adUnitElementTypes'

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
      return (adUnitId: string, elementKey: string): AdUnitElement | undefined => {
        const adUnit = state.adUnits[adUnitId]
        return adUnit?.elements[elementKey]
      }
    },

    getAllAdUnits: (state) => (): AdUnitsRecord => {
      return { ...state.adUnits }
    },

    getAdUnitIds: (state) => (): string[] => {
      return Object.keys(state.adUnits)
    },

    getAdUnitsCount: (state) => (): number => {
      return Object.keys(state.adUnits).length
    },

    getAdUnitsByLockStatus: (state) => {
      return (elementKey: string, locked: boolean = true): string[] => {
        return Object.keys(state.adUnits).filter((adUnitId) => {
          const element = state.adUnits[adUnitId]?.elements?.[elementKey]
          return element && (locked ? element.locked : !element.locked)
        })
      }
    },

    getDisclaimerVisibilityByLockStatus: (state) => {
      return (locked: boolean = true): string[] => {
        return Object.keys(state.adUnits).filter((adUnitId) => {
          const element = state.adUnits[adUnitId]?.elements?.['disclaimer']
          return (
            element &&
            hasVisibility(element) &&
            (locked ? element.visibilityLock : !element.visibilityLock)
          )
        })
      }
    },

    hasAdUnits: (state) => (): boolean => {
      return Object.keys(state.adUnits).length > 0
    },

    getAdUnitElements: (state) => {
      return (adUnitId: string): AdUnitElement[] => {
        const adUnit = state.adUnits[adUnitId]
        return adUnit ? Object.values(adUnit.elements) : []
      }
    },

    // Enhanced getters for better element type handling
    getElementText: (state) => {
      return (adUnitId: string, elementKey: string): string | null => {
        const element = state.adUnits[adUnitId]?.elements?.[elementKey]
        return element && isTextElement(element) ? element.text || '' : null
      }
    },

    getElementImage: (state) => {
      return (adUnitId: string, elementKey: string): string | null => {
        const element = state.adUnits[adUnitId]?.elements?.[elementKey]
        return element && isImageElement(element) ? element.image || '' : null
      }
    },

    getElementVisibility: (state) => {
      return (adUnitId: string, elementKey: string): boolean | null => {
        const element = state.adUnits[adUnitId]?.elements?.[elementKey]
        return element && hasVisibility(element) ? (element.visibility ?? true) : null
      }
    },

    // Get elements by type across all ad units
    getElementsByType: (state) => {
      return (
        elementType: ElementType,
      ): Array<{ adUnitId: string; elementKey: string; element: AdUnitElement }> => {
        const results: Array<{ adUnitId: string; elementKey: string; element: AdUnitElement }> = []

        Object.entries(state.adUnits).forEach(([adUnitId, adUnit]) => {
          Object.entries(adUnit.elements).forEach(([elementKey, element]) => {
            if (element.type === elementType) {
              results.push({ adUnitId, elementKey, element })
            }
          })
        })

        return results
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

    setElement(adUnitId: string, elementKey: string, element: AdUnitElement) {
      const adUnit = this.adUnits[adUnitId]
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

    updateElement(adUnitId: string, elementKey: string, updates: Partial<AdUnitElement>) {
      const adUnit = this.adUnits[adUnitId]
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
      adUnitIds.forEach((adUnitId) => {
        const adUnit = this.adUnits[adUnitId]
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
  },
})
