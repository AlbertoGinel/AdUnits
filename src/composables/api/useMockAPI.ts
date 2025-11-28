// composables/api/useMockAPI.ts
/**
 * Mock API with integrated IndexedDB backend
 * Simulates real API endpoints with persistent storage
 * Self-contained mock system for development
 */

import type {
  CreativeContentData,
  ServerCreativeModule,
  ServerAssetsModule,
} from '@/types/creative'

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
    UPLOADS: 'uploads',
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

        // Uploads store (for user uploaded files) - created on demand
        if (!db.objectStoreNames.contains(STORES.UPLOADS)) {
          const uploadsStore = db.createObjectStore(STORES.UPLOADS, { keyPath: 'id' })
          uploadsStore.createIndex('creative_id', 'creative_id', { unique: false })
          console.log('📦 Created uploads store (for user uploads)')
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
      if (isSeeded) {
        console.log('📊 Database already seeded, skipping...')
        return
      }

      if (isSeeding) {
        console.log('⏳ Database seeding in progress, waiting...')
        // Wait for seeding to complete
        while (isSeeding) {
          await new Promise((resolve) => setTimeout(resolve, 100))
        }
        return
      }

      isSeeding = true
      console.log('🌱 Seeding MockDatabase with default data...')

      try {
        // Check if the UUID creative exists (the one the app actually uses)
        const uuidCreative = await getCreativeData('3fa85f64-5717-4562-b3fc-2c963f66afa6')

        if (uuidCreative) {
          console.log('📊 Database already seeded with UUID creative, skipping...')
          isSeeded = true
          isSeeding = false
          return
        }

        console.log('🔄 Seeding database with UUID creative data...')

        // Load default assets from JSON
        const assetsModule = (await import(
          '../setupFrames/serverAssets.json'
        )) as ServerAssetsModule
        const defaultAssets = assetsModule.default.content

        // Load default creative data from JSON
        const creativeModule = (await import(
          '../setupFrames/serverCreatives.json'
        )) as ServerCreativeModule
        const defaultCreative = creativeModule.default.creativeData

        // Store assets using put() instead of add() to avoid constraint errors
        for (const asset of defaultAssets) {
          await performStoreOperation(STORES.ASSETS, 'readwrite', (store) =>
            store.put({
              ...asset,
              creative_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            }),
          )
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

        console.log('✅ Database seeded with default data')
        isSeeded = true
      } catch (error) {
        console.error('❌ Failed to seed database:', error)
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
          // Now get uploads
          const uploadsTransaction = database.transaction([STORES.UPLOADS], 'readonly')
          const uploadsStore = uploadsTransaction.objectStore(STORES.UPLOADS)
          const uploadsIndex = uploadsStore.index('creative_id')
          const uploadsRequest = uploadsIndex.openCursor(IDBKeyRange.only(creativeId))

          uploadsRequest.onsuccess = () => {
            const uploadCursor = uploadsRequest.result
            if (uploadCursor) {
              // Add upload data (blob field will be filtered out in return statement)
              assets.push(uploadCursor.value)
              uploadCursor.continue()
            } else {
              resolve(assets)
            }
          }

          uploadsRequest.onerror = () => reject(uploadsRequest.error)
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
   * Save uploaded asset with blob data
   */
  const saveUploadedAsset = async (creativeId: string, file: File): Promise<StoredAsset> => {
    const asset: StoredAsset = {
      id: crypto.randomUUID(),
      type: 'picture',
      creative_id: creativeId,
      path: `/uploads/${creativeId}/${Date.now()}-${file.name}`,
      blob: file, // Store the actual file blob
      error: '',
    }

    await performStoreOperation(STORES.UPLOADS, 'readwrite', (store) => store.put(asset))

    console.log('💾 Saved uploaded asset to IndexedDB:', asset.id)
    return asset
  }

  /**
   * Get uploaded asset blob
   */
  const getUploadedAssetBlob = async (assetId: string): Promise<Blob | null> => {
    try {
      const asset = await performStoreOperation(STORES.UPLOADS, 'readonly', (store) =>
        store.get(assetId),
      )

      return asset?.blob || null
    } catch {
      return null
    }
  }

  /**
   * Delete uploaded asset
   */
  const deleteUploadedAsset = async (assetId: string): Promise<boolean> => {
    try {
      await performStoreOperation(STORES.UPLOADS, 'readwrite', (store) => store.delete(assetId))

      console.log('🗑️ Deleted uploaded asset:', assetId)
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
    saveUploadedAsset,
    getUploadedAssetBlob,
    deleteUploadedAsset,
    clearDatabase,
  }
}

/**
 * Mock API Configuration
 */
const MOCK_CONFIG = {
  errorRate: 0.0,
  minDelay: 0,
  maxDelay: 1,
  enableErrors: true,
}

/**
 * Mock API for development - using IndexedDB backend
 * Returns responses that match real API structure
 */
/**
 * Mock API for development - using IndexedDB backend
 * Returns responses that match real API structure
 */
export function useMockAPI() {
  const mockDB = createMockDatabase()

  const simulateNetworkCall = async (): Promise<void> => {
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
      console.log(`💥 Mock API Error: ${error.message}`)
      throw new Error(`API Error ${error.status}: ${error.message}`)
    }
  }

  /**
   * GET /api/v1/assets/creative/{id}
   */
  const fetchAssets = async (creativeId: string) => {
    try {
      console.log(`📡 Mock API: Fetching assets for creative ${creativeId}`)

      await simulateNetworkCall()
      await mockDB.seedDatabase()

      const assets = await mockDB.getAllAssets(creativeId)

      console.log(`✅ Mock API: Retrieved ${assets.length} assets`)

      return {
        status: 200,
        content: assets.map(({ ...asset }) => asset),
      }
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

      await simulateNetworkCall()
      await mockDB.seedDatabase()

      const creativeData = await mockDB.getCreativeData(creativeId)

      if (!creativeData) {
        throw new Error(`Creative data not found for ${creativeId}`)
      }

      console.log('✅ Mock API: Retrieved creative data')

      return {
        status: 200,
        creativeData: {
          id: creativeData.id,
          version: creativeData.version,
          data: creativeData.data,
        },
      }
    } catch (error) {
      console.error('❌ Failed to fetch creative data:', error)
      throw error
    }
  }

  /**
   * POST /api/v1/assets/{id}
   */
  const uploadAsset = async (
    creativeId: string,
    file: File,
  ): Promise<{
    status: number
    message: string
    path: string
  }> => {
    try {
      console.log(`📤 Mock API: Uploading asset for creative ${creativeId}`)
      console.log(`   File: ${file.name} (${file.size} bytes)`)

      await simulateNetworkCall()

      const asset = await mockDB.saveUploadedAsset(creativeId, file)

      console.log(`✅ Mock API: Upload successful - ${asset.path}`)

      return {
        status: 200,
        message: 'Asset uploaded successfully',
        path: asset.path,
      }
    } catch (error) {
      console.error('❌ Failed to upload asset:', error)
      return {
        status: 500,
        message: error instanceof Error ? error.message : 'Upload failed',
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

      await simulateNetworkCall()

      const success = await mockDB.deleteUploadedAsset(assetId)

      return {
        status: success ? 200 : 404,
        message: success ? 'Asset deleted' : 'Asset not found',
      }
    } catch (error) {
      console.error('❌ Failed to delete asset:', error)
      throw error
    }
  }

  /**
   * GET blob data for uploaded assets (internal use)
   */
  const getAssetBlob = async (assetId: string): Promise<Blob | null> => {
    try {
      console.log(`📦 Mock API: Fetching blob for asset ${assetId}`)

      const blob = await mockDB.getUploadedAssetBlob(assetId)

      if (blob) {
        console.log(`✅ Mock API: Retrieved blob (${blob.size} bytes)`)
      }

      return blob
    } catch (error) {
      console.error('❌ Failed to get asset blob:', error)
      return null
    }
  }

  return {
    fetchAssets,
    fetchCreativeData,
    uploadAsset,
    deleteAsset,
    getAssetBlob,
  }
}
