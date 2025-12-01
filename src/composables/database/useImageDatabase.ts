// composables/database/useImageDatabase.ts
/**
 * IndexedDB storage for image blobs
 * Provides efficient binary storage with blob URL management
 */

const DB_NAME = 'LocalImages'
const DB_VERSION = 2
const STORE_NAME = 'imagesStored'

interface StoredImageBlob {
  id: string
  blob: Blob
  originalUrl: string
  uploadedAt: number
  metadata?: {
    name?: string
    size: number
    type: string
  }
}

export function useImageDatabase() {
  let db: IDBDatabase | null = null
  let isInitializing = false

  /**
   * Initialize IndexedDB
   */
  const initDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      if (db) {
        console.log('✅ Reusing existing ImageDatabase connection')
        resolve(db)
        return
      }

      if (isInitializing) {
        // Wait for existing initialization
        const checkInit = () => {
          if (db) {
            resolve(db)
          } else if (!isInitializing) {
            reject(new Error('ImageDB initialization failed'))
          } else {
            setTimeout(checkInit, 50)
          }
        }
        checkInit()
        return
      }

      isInitializing = true
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => {
        isInitializing = false
        console.error('❌ Failed to open IndexedDB:', request.error)
        reject(request.error)
      }

      request.onsuccess = () => {
        db = request.result
        isInitializing = false
        console.log('✅ IndexedDB initialized')
        resolve(db)
      }

      request.onupgradeneeded = (event) => {
        const database = (event.target as IDBOpenDBRequest).result

        // Create object store for images
        if (!database.objectStoreNames.contains(STORE_NAME)) {
          database.createObjectStore(STORE_NAME, { keyPath: 'id' })
          console.log('🔧 Created IndexedDB object store:', STORE_NAME)
        }
      }
    })
  }

  /**
   * Store image blob in IndexedDB and return blob URL
   */
  const storeImageBlob = async (
    id: string,
    blob: Blob,
    originalUrl: string,
    metadata?: Partial<StoredImageBlob['metadata']>,
  ): Promise<string> => {
    const database = await initDB()

    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)

      const imageData: StoredImageBlob = {
        id,
        blob,
        originalUrl,
        uploadedAt: Date.now(),
        metadata: {
          name: metadata?.name,
          size: blob.size,
          type: blob.type,
          ...metadata,
        },
      }

      const request = store.put(imageData)

      request.onsuccess = () => {
        // Create blob URL for immediate use
        const blobUrl = URL.createObjectURL(blob)
        console.log(`💾 Stored image blob: ${id} → ${blobUrl}`)
        resolve(blobUrl)
      }

      request.onerror = () => {
        console.error('❌ Failed to store image blob:', request.error)
        reject(request.error)
      }
    })
  }

  /**
   * Retrieve image blob from IndexedDB and create blob URL
   */
  const getImageBlob = async (id: string): Promise<string | null> => {
    const database = await initDB()

    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.get(id)

      request.onsuccess = () => {
        const result = request.result as StoredImageBlob | undefined

        if (result && result.blob) {
          const blobUrl = URL.createObjectURL(result.blob)
          console.log(`🔄 Retrieved image blob: ${id} → ${blobUrl}`)
          resolve(blobUrl)
        } else {
          console.log(`⚠️ Image blob not found: ${id}`)
          resolve(null)
        }
      }

      request.onerror = () => {
        console.error('❌ Failed to retrieve image blob:', request.error)
        reject(request.error)
      }
    })
  }

  /**
   * Delete image blob from IndexedDB
   */
  const deleteImageBlob = async (id: string): Promise<boolean> => {
    const database = await initDB()

    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.delete(id)

      request.onsuccess = () => {
        console.log(`🗑️ Deleted image blob: ${id}`)
        resolve(true)
      }

      request.onerror = () => {
        console.error('❌ Failed to delete image blob:', request.error)
        reject(request.error)
      }
    })
  }

  /**
   * Check if image blob exists in IndexedDB
   */
  const hasImageBlob = async (id: string): Promise<boolean> => {
    const database = await initDB()

    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.count(id)

      request.onsuccess = () => {
        resolve(request.result > 0)
      }

      request.onerror = () => {
        reject(request.error)
      }
    })
  }

  /**
   * Get all stored image metadata
   */
  const getAllImageMetadata = async (): Promise<Omit<StoredImageBlob, 'blob'>[]> => {
    const database = await initDB()

    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.getAll()

      request.onsuccess = () => {
        const results = request.result as StoredImageBlob[]
        // Return metadata without the blob data
        const metadata = results.map(({ ...meta }) => meta)
        resolve(metadata)
      }

      request.onerror = () => {
        reject(request.error)
      }
    })
  }

  /**
   * Clear all image blobs
   */
  const clearAllImages = async (): Promise<void> => {
    const database = await initDB()

    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.clear()

      request.onsuccess = () => {
        console.log('🧹 Cleared all image blobs')
        resolve()
      }

      request.onerror = () => {
        reject(request.error)
      }
    })
  }

  /**
   * Convert File or Response to Blob and store
   */
  const storeFromFile = async (id: string, file: File, originalUrl?: string): Promise<string> => {
    return storeImageBlob(id, file, originalUrl || `file://${file.name}`, {
      name: file.name,
      size: file.size,
      type: file.type,
    })
  }

  /**
   * Convert fetch Response to Blob and store
   */
  const storeFromResponse = async (
    id: string,
    response: Response,
    originalUrl: string,
  ): Promise<string> => {
    const blob = await response.blob()
    const filename = originalUrl.split('/').pop() || 'unknown'

    return storeImageBlob(id, blob, originalUrl, {
      name: filename,
      size: blob.size,
      type: blob.type,
    })
  }

  return {
    // Core operations
    storeImageBlob,
    getImageBlob,
    deleteImageBlob,
    hasImageBlob,

    // Utility operations
    getAllImageMetadata,
    clearAllImages,

    // Convenience methods
    storeFromFile,
    storeFromResponse,

    // Database management
    initDB,
  }
}
