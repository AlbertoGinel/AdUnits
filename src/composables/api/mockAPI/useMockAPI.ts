// composables/api/useMockAPI.ts
/**
 * Mock API with integrated IndexedDB backend
 * Simulates real API endpoints with persistent storage
 * Self-contained mock system for development
 *
 * 🚀 PRODUCTION: Delete this entire file to remove all debug data
 */

import type { CreativeContentData } from '@/types/creative'

/**
 * 📊 EMBEDDED DEBUG DATA - Replace external JSON files
 * Delete this entire file for production deployment
 */

import lifeStyleImg from './lifeStyle.png'
import logoImg from './logo.png'
import redBackgroundImg from './red-background.jpg'

// Embedded serverAssets.json data
const MOCK_ASSETS_DATA = {
  status: 200,
  content: [
    {
      id: '6f5c3c22-9d3e-4c2c-9c7c-7bb8f6e3e3c1',
      type: 'picture',
      creative_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      path: lifeStyleImg,
      error: '',
    },
    {
      id: 'b2f0f8f4-1f7d-4efb-a8f1-9f4d0c1c76d9',
      type: 'picture',
      creative_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      path: logoImg,
      error: '',
    },
    {
      id: '0d7a2c4b-2b54-4710-8b6d-2e2df91c4923',
      type: 'picture',
      creative_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      path: redBackgroundImg,
      error: '',
    },
  ],
}

// Embedded serverCreatives.json data
const MOCK_CREATIVE_DATA = {
  status: 200,
  creativeData: {
    id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    version: 1,
    data: {
      creative_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      adUnits: {
        'marquee-app': {
          elements: {
            image: {
              image: '6f5c3c22-9d3e-4c2c-9c7c-7bb8f6e3e3c1',
              crop: { x: 100, y: 355, width: 2811, height: 1187 },
              locked: false,
            },
            logo: { image: 'b2f0f8f4-1f7d-4efb-a8f1-9f4d0c1c76d9', locked: false },
            headline: { text: 'headline from the server', locked: false },
            cta: { text: 'cta from server', locked: false },
            disclaimer: {
              text: 'Results may vary. Individual experience depends on usage patterns and system configuration. All features described are subject to change without notice. Performance claims are based on ideal conditions and may not reflect real-world usage. Limited time offer restrictions may apply. Not responsible for typographical errors in promotional materials. Service availability may be interrupted for maintenance. Some advanced features require compatible hardware and software. User agreement and terms of service apply to all usage. Commercial use may require separate licensing licensing licensing lili.',
              visibility: true,
              visibilityLock: false,
              locked: false,
            },
            disclaimerBG: { visibility: true, visibilityLock: false },
          },
        },
        'brandbox-desktop': {
          elements: {
            image: {
              image: '6f5c3c22-9d3e-4c2c-9c7c-7bb8f6e3e3c1',
              crop: { x: 15, y: 459, width: 2440, height: 470 },
              locked: false,
            },
            logo: { image: 'b2f0f8f4-1f7d-4efb-a8f1-9f4d0c1c76d9', locked: false },
            headline: { text: 'Tittle text', locked: false },
            subhead: { text: 'subhead from the server', locked: false },
            cta: { text: 'server cta', locked: false },
            disclaimer: {
              text: 'Results may vary. Individual experience depends on usage patterns and system configuration. All features described are subject to change without notice. Performance claims are based on ideal conditions and may not reflect real-world usage. Limited time offer restrictions may apply. Not responsible for typographical errors in promotional materials. Service availability may be interrupted for maintenance. Some advanced features require compatible hardware and software. User agreement and terms of service apply to all usage. Commercial use may require separate licensing licensing licensing lili.',
              visibility: true,
              visibilityLock: false,
              locked: false,
            },
            disclaimerBG: { visibility: true, visibilityLock: false },
          },
        },
        longmarquee: {
          elements: {
            image: {
              image: '6f5c3c22-9d3e-4c2c-9c7c-7bb8f6e3e3c1',
              crop: { x: 15, y: 459, width: 2440, height: 470 },
              locked: false,
            },
            logo: { image: 'b2f0f8f4-1f7d-4efb-a8f1-9f4d0c1c76d9', locked: false },
            headline: { text: 'headline from the server', locked: false },
            subhead: { text: 'subhead from the server', locked: false },
            cta: { text: 'cta from server', locked: false },
            disclaimer: {
              text: 'Results may vary. Individual experience depends on usage patterns and system configuration. All features described are subject to change without notice. Performance claims are based on ideal conditions and may not reflect real-world usage. Limited time offer restrictions may apply. Not responsible for typographical errors in promotional materials. Service availability may be interrupted for maintenance. Some advanced features require compatible hardware and software. User agreement and terms of service apply to all usage. Commercial use may require separate licensing licensing licensing lili.',
              visibility: true,
              visibilityLock: false,
              locked: false,
            },
            disclaimerBG: { visibility: true, visibilityLock: false },
          },
        },
      },
      layers: {
        headline: { type: 'text', defaultValue: 'Headline goes here' },
        logo: { type: 'image', defaultValue: 'b2f0f8f4-1f7d-4efb-a8f1-9f4d0c1c76d9' },
        subhead: { type: 'text', defaultValue: 'Your subhead goes here' },
        cta: { type: 'text', defaultValue: 'CTA button' },
        image: { type: 'image', defaultValue: '6f5c3c22-9d3e-4c2c-9c7c-7bb8f6e3e3c1' },
        disclaimer: {
          type: 'text',
          defaultValue: 'This content is provided solely for general informational purposes.',
          visibility: true,
          darkColour: '#000000',
          lightColour: '#ffffff',
        },
        disclaimerBG: {
          type: 'rect',
          defaultValue:
            'Results may vary. Individual experience depends on usage patterns and system configuration. All features described are subject to change without notice. Performance claims are based on ideal conditions and may not reflect real-world usage. Limited time offer restrictions may apply. Not responsible for typographical errors in promotional materials. Service availability may be interrupted for maintenance. Some advanced features require compatible hardware and software. User agreement and terms of service apply to all usage. Commercial use may require separate licensing. All trademarks and logos are property of their respective owners. No guarantee of specific outcomes or results.',
          visibility: true,
        },
      },
      images: [
        {
          id: '6f5c3c22-9d3e-4c2c-9c7c-7bb8f6e3e3c1',
          type: 'image',
          name: 'goodYearWheels',
          altText: 'Goodyear car wheels on lifestyle photo',
        },
        {
          id: 'b2f0f8f4-1f7d-4efb-a8f1-9f4d0c1c76d9',
          type: 'logo',
          name: 'goodYearBlue',
          altText: 'Goodyear company logo in blue',
        },
        {
          id: '0d7a2c4b-2b54-4710-8b6d-2e2df91c4923',
          type: 'image',
          name: 'redBackground',
          altText: 'Red gradient background texture',
        },
      ],
    } as CreativeContentData,
  },
}

/**
 * Internal interfaces for mock system
 */
interface StoredAsset {
  id: string
  type: string
  creative_id: string
  path: string // URL when GET, blob when POST (asymmetric)
  error: string
  blob?: Blob // Only for uploaded assets in storage
  name?: string
  mimeType?: string
}

interface StoredCreativeData {
  id: string
  creative_id: string
  version: number
  data: CreativeContentData // ✅ Properly typed creative content
}

/**
 * Mock Database Operations (Internal)
 * Handles IndexedDB operations for the mock API
 */
function createMockDatabase() {
  const DB_NAME = 'MockCreativeDB'
  const DB_VERSION = 1

  // Store names
  const STORES = {
    ASSETS: 'assets',
    CREATIVE_DATA: 'creativeData',
  }

  let db: IDBDatabase | null = null
  let isInitializing = false

  /**
   * Initialize IndexedDB
   */
  const initDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      if (db) {
        console.log('✅ Reusing existing MockDatabase connection')
        resolve(db)
        return
      }

      if (isInitializing) {
        // Wait for existing initialization to complete
        const checkInit = () => {
          if (db) {
            resolve(db)
          } else if (!isInitializing) {
            reject(new Error('Database initialization failed'))
          } else {
            setTimeout(checkInit, 50)
          }
        }
        checkInit()
        return
      }

      isInitializing = true
      console.log('🗄️ Initializing MockDatabase (IndexedDB)...')

      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => {
        isInitializing = false
        console.error('❌ Failed to open IndexedDB:', request.error)
        reject(request.error)
      }

      request.onsuccess = () => {
        db = request.result
        isInitializing = false
        console.log('✅ MockDatabase initialized')
        resolve(db)
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Assets store
        if (!db.objectStoreNames.contains(STORES.ASSETS)) {
          const assetsStore = db.createObjectStore(STORES.ASSETS, { keyPath: 'id' })
          assetsStore.createIndex('creative_id', 'creative_id', { unique: false })
          console.log('📦 Created assets store')
        }

        // Creative data store
        if (!db.objectStoreNames.contains(STORES.CREATIVE_DATA)) {
          const creativeStore = db.createObjectStore(STORES.CREATIVE_DATA, { keyPath: 'id' })
          creativeStore.createIndex('creative_id', 'creative_id', { unique: false })
          console.log('📦 Created creative data store')
        }
      }
    })
  }

  /**
   * Generic store operation helper
   */
  const performStoreOperation = async <T>(
    storeName: string,
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => IDBRequest<T>,
  ): Promise<T> => {
    const database = await initDB()

    return new Promise((resolve, reject) => {
      const transaction = database.transaction([storeName], mode)
      const store = transaction.objectStore(storeName)
      const request = operation(store)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Initialize with default data from JSON files
   */
  const seedDatabase = (() => {
    let isSeeding = false
    let isSeeded = false

    return async () => {
      // ✅ EARLY EXIT: Check in-memory flag first (no logs)
      if (isSeeded) {
        return
      }

      // ✅ EARLY EXIT: Check if already seeding (minimal log)
      if (isSeeding) {
        console.log('(🌱 Seeding) ⏳ Database seeding in progress, waiting...')
        while (isSeeding) {
          await new Promise((resolve) => setTimeout(resolve, 100))
        }
        return
      }

      isSeeding = true

      try {
        // ✅ Check database BEFORE logging anything
        const uuidCreative = await getCreativeData('3fa85f64-5717-4562-b3fc-2c963f66afa6')

        if (uuidCreative) {
          // Data exists, mark as seeded and exit silently
          isSeeded = true
          isSeeding = false
          return
        }

        // ✅ Only log if we're actually seeding
        console.log('(🌱 Seeding) 🌱 Seeding MockDatabase with default data...')
        console.log('(🌱 Seeding) 🔄 Seeding database with UUID creative data...')

        // Use embedded data instead of importing JSON files
        const defaultAssets = MOCK_ASSETS_DATA.content
        const defaultCreative = MOCK_CREATIVE_DATA.creativeData

        // ✅ Fetch images and store as blobs (like a real database)
        console.log('(🌱 Seeding) 📥 Fetching and storing image blobs...')
        for (const asset of defaultAssets) {
          try {
            // Fetch the actual image data
            const response = await fetch(asset.path)
            const blob = await response.blob()

            // Store with blob data, not import path
            await performStoreOperation(STORES.ASSETS, 'readwrite', (store) =>
              store.put({
                id: asset.id,
                type: asset.type,
                creative_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                path: '', // ✅ No path - data is in blob
                error: '',
                blob: blob,
                name: asset.id,
                mimeType: blob.type,
              }),
            )
            console.log(`(🌱 Seeding)   ✅ Stored blob: ${asset.id} (${blob.size} bytes)`)
          } catch (error) {
            console.error(`(🌱 Seeding)   ❌ Failed to fetch ${asset.id}:`, error)
          }
        }

        // Store creative data using put() instead of add()
        await performStoreOperation(STORES.CREATIVE_DATA, 'readwrite', (store) =>
          store.put({
            id: defaultCreative.id || 'creative-data-001',
            creative_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            version: defaultCreative.version || 1,
            data: defaultCreative.data,
          }),
        )

        console.log('(🌱 Seeding) ✅ Database seeded with default data')
        isSeeded = true
      } catch (error) {
        console.error('(🌱 Seeding) ❌ Failed to seed database:', error)
        throw error
      } finally {
        isSeeding = false
      }
    }
  })()

  /**
   * Get all assets for a creative
   */
  const getAllAssets = async (creativeId: string): Promise<StoredAsset[]> => {
    const database = await initDB()

    return new Promise((resolve, reject) => {
      const assets: StoredAsset[] = []

      // Get from main assets store
      const assetsTransaction = database.transaction([STORES.ASSETS], 'readonly')
      const assetsStore = assetsTransaction.objectStore(STORES.ASSETS)
      const assetsIndex = assetsStore.index('creative_id')
      const assetsRequest = assetsIndex.openCursor(IDBKeyRange.only(creativeId))

      assetsRequest.onsuccess = () => {
        const cursor = assetsRequest.result
        if (cursor) {
          // Add asset data (blob field will be filtered out in return statement)
          assets.push(cursor.value)
          cursor.continue()
        } else {
          resolve(assets)
        }
      }

      assetsRequest.onerror = () => reject(assetsRequest.error)
    })
  }

  /**
   * Get creative data
   */
  const getCreativeData = async (creativeId: string): Promise<StoredCreativeData | null> => {
    const database = await initDB()

    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORES.CREATIVE_DATA], 'readonly')
      const store = transaction.objectStore(STORES.CREATIVE_DATA)
      const index = store.index('creative_id')
      const request = index.get(creativeId)

      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Insert new asset into assets store (accepts File object to simulate multipart)
   */
  const insertAsset = async (creativeId: string, file: File): Promise<StoredAsset> => {
    // Generate new random ID for the asset
    const newAssetId = `${crypto.randomUUID()}`

    // Extract metadata from File object (simulating multipart processing)
    const asset: StoredAsset = {
      id: newAssetId,
      type: 'image',
      creative_id: creativeId,
      path: `file://${file.name}`,
      error: '',
      blob: file,
      name: file.name,
      mimeType: file.type,
    }

    // Store in assets store
    await performStoreOperation(STORES.ASSETS, 'readwrite', (store) => store.put(asset))

    console.log('✅ Inserted new asset (multipart simulation):', {
      id: newAssetId,
      filename: file.name,
      size: file.size,
      type: file.type,
      path: asset.path,
    })

    return asset
  }

  /**
   * Get a single asset by id
   */
  const getAssetById = async (assetId: string): Promise<StoredAsset | null> => {
    const database = await initDB()

    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORES.ASSETS], 'readonly')
      const store = transaction.objectStore(STORES.ASSETS)
      const request = store.get(assetId)

      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Update an asset (e.g., attach blob after fetching seeded file)
   */
  const upsertAsset = async (asset: StoredAsset): Promise<void> => {
    await performStoreOperation(STORES.ASSETS, 'readwrite', (store) => store.put(asset))
  }

  /**
   * Update creative data
   */
  const updateCreativeData = async (
    creativeId: string,
    data: CreativeContentData,
    version: number,
  ): Promise<void> => {
    const stored: StoredCreativeData = {
      id: creativeId,
      creative_id: creativeId,
      version,
      data,
    }
    await performStoreOperation(STORES.CREATIVE_DATA, 'readwrite', (store) => store.put(stored))
    console.log('✅ Updated creative data:', creativeId)
  }

  /**
   * Delete asset from assets store
   */
  const deleteAsset = async (assetId: string): Promise<boolean> => {
    try {
      await performStoreOperation(STORES.ASSETS, 'readwrite', (store) => store.delete(assetId))

      console.log('🗑️ Deleted asset:', assetId)
      return true
    } catch (error) {
      console.error('❌ Failed to delete asset:', error)
      return false
    }
  }

  /**
   * Clear all data (for testing)
   */
  const clearDatabase = async () => {
    const database = await initDB()

    return new Promise<void>((resolve, reject) => {
      const transaction = database.transaction([STORES.ASSETS, STORES.CREATIVE_DATA], 'readwrite')

      // Clear main data stores (keep uploads separate)
      transaction.objectStore(STORES.ASSETS).clear()
      transaction.objectStore(STORES.CREATIVE_DATA).clear()

      transaction.oncomplete = () => {
        console.log('🧹 Main database cleared (uploads preserved)')
        resolve()
      }

      transaction.onerror = () => reject(transaction.error)
    })
  }

  return {
    initDB,
    seedDatabase,
    getAllAssets,
    getCreativeData,
    getAssetById,
    upsertAsset,
    insertAsset,
    updateCreativeData,
    deleteAsset,
    clearDatabase,
  }
}

/**
 * Mock API Configuration
 */
const MOCK_CONFIG = {
  errorRate: 0.0, //errorRate 100% is 1.0
  minDelay: 1000,
  maxDelay: 3000,
  enableErrors: true,
}

/**
 * ✅ SINGLETON: Create ONE database instance at module level
 * This ensures the database is initialized only once and reused across all API calls
 */
const mockDB = createMockDatabase()

/**
 * Mock API for development - using IndexedDB backend
 * Returns responses that match real API structure
 */
export function useMockAPI() {
  // In-memory registry to reuse object URLs during a session
  const urlRegistry = new Map<string, string>()

  const ensureBlobUrlForAsset = async (asset: StoredAsset): Promise<string> => {
    // Check if we already have a blob URL for this asset
    const existing = urlRegistry.get(asset.id)
    if (existing) return existing

    // ✅ Get blob from database (already stored during seeding or upload)
    const blob = asset.blob

    if (!blob) {
      console.error(`❌ No blob data for asset ${asset.id}`)
      return '' // No fallback - blob should always exist in real database
    }

    // Create and cache object URL from blob
    const objectUrl = URL.createObjectURL(blob)
    urlRegistry.set(asset.id, objectUrl)
    return objectUrl
  }

  const simulateNetworkCall = async <T>(successResponse: T, operationName: string): Promise<T> => {
    const delay =
      Math.floor(Math.random() * (MOCK_CONFIG.maxDelay - MOCK_CONFIG.minDelay)) +
      MOCK_CONFIG.minDelay
    await new Promise((resolve) => setTimeout(resolve, delay))

    if (MOCK_CONFIG.enableErrors && Math.random() < MOCK_CONFIG.errorRate) {
      const errorTypes = [
        { status: 500, message: 'Internal server error' },
        { status: 503, message: 'Service unavailable' },
        { status: 408, message: 'Request timeout' },
        { status: 404, message: 'Resource not found' },
      ]
      const error = errorTypes[Math.floor(Math.random() * errorTypes.length)]!
      console.log(`💥 Mock API Error [${operationName}]: ${error.message}`)

      // Return error response with same structure but different status
      return {
        ...successResponse,
        status: error.status,
        message: error.message,
      } as T
    }

    console.log(`✅ Mock API Success [${operationName}]`)
    return successResponse
  }

  /**
   * GET /api/v1/assets/creative/{id}
   */
  const fetchAssets = async (creativeId: string) => {
    try {
      console.log(`📡 Mock API: Fetching assets for creative ${creativeId}`)

      await mockDB.seedDatabase()
      const assets = await mockDB.getAllAssets(creativeId)

      // Generate blob URLs uniformly for all assets
      const content = await Promise.all(
        assets.map(async (asset) => {
          const path = await ensureBlobUrlForAsset(asset)
          return {
            id: asset.id,
            type: asset.type,
            creative_id: asset.creative_id,
            path,
            error: asset.error,
          }
        }),
      )

      return await simulateNetworkCall(
        {
          status: 200,
          content,
        },
        'fetchAssets',
      )
    } catch (error) {
      console.error('❌ Failed to fetch assets:', error)
      throw error
    }
  }

  /**
   * GET /api/v1/creative_data/{creative_id}
   */
  const fetchCreativeData = async (creativeId: string) => {
    try {
      console.log(`📡 Mock API: Fetching creative data for ${creativeId}`)
      await mockDB.seedDatabase()
      const creativeData = await mockDB.getCreativeData(creativeId)

      if (!creativeData) {
        throw new Error(`Creative data not found for ${creativeId}`)
      }

      return await simulateNetworkCall(
        {
          status: 200,
          creativeData: {
            id: creativeData.id,
            version: creativeData.version,
            data: creativeData.data,
          },
        },
        'fetchCreativeData',
      )
    } catch (error) {
      console.error('❌ Failed to fetch creative data:', error)
      throw error
    }
  }

  /**
   * POST /api/v1/assets
   * Insert new asset (multipart file upload simulation)
   */
  const insertAsset = async (
    creativeId: string,
    file: File,
  ): Promise<{
    status: number
    message: string
    assetId: string
    path: string
  }> => {
    try {
      console.log(`📤 Mock API: Inserting asset for creative ${creativeId}`)
      console.log(`   File: ${file.name} (${file.size} bytes, ${file.type})`)

      const insertedAsset = await mockDB.insertAsset(creativeId, file)
      const path = await ensureBlobUrlForAsset(insertedAsset)

      return await simulateNetworkCall(
        {
          status: 200,
          message: 'Asset inserted successfully',
          assetId: insertedAsset.id,
          path,
        },
        'insertAsset',
      )
    } catch (error) {
      console.error('❌ Failed to insert asset:', error)
      return {
        status: 500,
        message: error instanceof Error ? error.message : 'Insert failed',
        assetId: '',
        path: '',
      }
    }
  }

  /**
   * DELETE /api/v1/assets/{id}
   */
  const deleteAsset = async (assetId: string) => {
    try {
      console.log(`🗑️ Mock API: Deleting asset ${assetId}`)
      const success = await mockDB.deleteAsset(assetId)
      // Best-effort cleanup of registry; explicit URL.revokeObjectURL is optional for this mock
      const existing = urlRegistry.get(assetId)
      if (existing) {
        try {
          URL.revokeObjectURL(existing)
        } catch {}
        urlRegistry.delete(assetId)
      }

      return await simulateNetworkCall(
        {
          status: success ? 200 : 404,
          message: success ? 'Asset deleted' : 'Asset not found',
        },
        'deleteAsset',
      )
    } catch (error) {
      console.error('❌ Failed to delete asset:', error)
      throw error
    }
  }

  /**
   * PUT /api/v1/creative_data/{id}
   */
  const updateCreative = async (
    creativeId: string,
    payload: { version: number; data: CreativeContentData; creative_id: string },
  ) => {
    try {
      console.log(`🔄 Mock API: Updating creative data for ${creativeId}`)

      // Persist the updated creative data to IndexedDB
      await mockDB.updateCreativeData(creativeId, payload.data, payload.version)

      return await simulateNetworkCall(
        {
          status: 200,
          message: 'Creative data updated successfully',
        },
        'updateCreative',
      )
    } catch (error) {
      console.error('❌ Failed to update creative:', error)
      return {
        status: 500,
        message: error instanceof Error ? error.message : 'Update failed',
      }
    }
  }

  return {
    fetchAssets,
    fetchCreativeData,
    insertAsset,
    deleteAsset,
    updateCreative,
  }
}
