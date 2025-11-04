import type { AdUnit } from '@/stores/canvas'
import type { AdUnitDefinition } from './registry'
import { AdUnitFrameService } from './adUnitFrame'

export class AdUnitLoader {
  /**
   * Load a single ad unit from its definition
   */
  static async loadAdUnit(definition: AdUnitDefinition): Promise<AdUnit> {
    // Load pure content elements
    const contentElements = await definition.loader()

    // Create frame configuration
    const frameConfig = {
      id: definition.id,
      title: definition.name,
      dimensions: definition.dimensions,
      position: definition.position,
    }

    // Apply universal frame + positioning
    const framedElements = AdUnitFrameService.createFramedAdUnit(
      frameConfig,
      contentElements,
      definition.contentOffset,
    )

    return {
      id: definition.id,
      title: definition.name,
      frameConfig,
      elements: framedElements,
    }
  }

  /**
   * Load multiple ad units from definitions
   */
  static async loadMultiple(definitions: AdUnitDefinition[]): Promise<AdUnit[]> {
    console.log(`📦 Loading ${definitions.length} ad units...`)

    const adUnits = await Promise.all(definitions.map((def) => this.loadAdUnit(def)))

    console.log(
      `✅ Loaded ad units:`,
      adUnits.map((unit) => unit.title),
    )
    return adUnits
  }
}
