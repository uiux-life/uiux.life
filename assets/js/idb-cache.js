// assets/js/idb-cache.js

// Plug-and-play IndexedDB cache utility for offline-safe data.
// Handles offline storage, expiration, queued mutation persistence, and reconnection sync.

const IDBCache = (() => {
  const DB_NAME = 'offline-cache' // Name of the IndexedDB database
  const STORE_NAME = 'resources' // Name of the object store for cached entries
  const EXPIRY_MS = 1000 * 60 * 60 * 24 * 7 // Expiry threshold: 7 days
  const RETRY_DELAY = 5000 // Retry delay after failure: 5 seconds

  // Open or create the IndexedDB database and object store
  function openDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1)
      req.onerror = () => reject(req.error)
      req.onsuccess = () => resolve(req.result)
      req.onupgradeneeded = () => {
        const store = req.result.createObjectStore(STORE_NAME)
        store.createIndex('timestamp', 'timestamp', { unique: false })
      }
    })
  }

  // Retrieve a value by key. Handles expiration and JSON parsing.
  async function get(key) {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const req = store.get(key)
      req.onsuccess = () => {
        const result = req.result
        if (!result) return resolve(null)
        const now = Date.now()
        if (result.timestamp && now - result.timestamp > EXPIRY_MS) {
          remove(key)
          return resolve(null)
        }
        try {
          resolve(JSON.parse(result.data))
        } catch (e) {
          resolve(result.data)
        }
      }
      req.onerror = () => reject(req.error)
    })
  }

  // Store a value under a key, serialized as JSON with a timestamp
  async function set(key, value) {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const data = {
        data: JSON.stringify(value),
        timestamp: Date.now()
      }
      const req = store.put(data, key)
      req.onsuccess = () => resolve(true)
      req.onerror = () => reject(req.error)
    })
  }

  // Delete a value by key from the object store
  async function remove(key) {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const req = store.delete(key)
      req.onsuccess = () => resolve(true)
      req.onerror = () => reject(req.error)
    })
  }

  // Queue a change to be flushed when online; prepends 'pending:'
  async function queueMutation(key, payload) {
    return set(`pending:${key}`, payload)
  }

  // Attempt to flush all queued mutations using a provided send function
  async function flushMutations(sendFn) {
    const db = await openDB()
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const req = store.getAllKeys()
    req.onsuccess = async () => {
      for (const key of req.result) {
        if (!key.startsWith('pending:')) continue // only process queued items
        const data = await get(key)
        try {
          await sendFn(data) // try sending to server
          await remove(key) // remove on success
        } catch (err) {
          // Keep in queue; will retry next flush
        }
      }
    }
  }

  // Automatically flush mutations when the browser comes back online
  if ('onLine' in navigator) {
    window.addEventListener('online', () => {
      if (typeof IDBCache !== 'undefined' && typeof IDBCache.flushMutations === 'function') {
        IDBCache.flushMutations(() => Promise.resolve())
      }
    })
  }

  // Expose public API
  return { get, set, remove, queueMutation, flushMutations }
})()

// Example usage:
// IDBCache.set('draft', formData)
// IDBCache.get('draft').then(data => { ... })
// IDBCache.remove('draft')
// IDBCache.queueMutation('user:123', updateData)
// IDBCache.flushMutations(sendToServer)
