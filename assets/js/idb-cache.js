// assets/js/idb-cache.js

// Plug-and-play IndexedDB cache utility for offline-safe data.
// Handles offline storage, expiration, queued mutation persistence, and reconnection sync.

const IDBCache = (() => {
  const DB_NAME = 'offline-cache'
  const STORE_NAME = 'resources'
  const EXPIRY_MS = 1000 * 60 * 60 * 24 * 7 // 7 days
  const RETRY_DELAY = 5000 // 5 seconds

  function openDB() {
    console.log('[IDBCache] Opening database...')
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1)
      req.onerror = () => reject(req.error)
      req.onsuccess = () => {
        console.log('[IDBCache] Database opened')
        resolve(req.result)
      }
      req.onupgradeneeded = () => {
        console.log('[IDBCache] Creating object store...')
        const store = req.result.createObjectStore(STORE_NAME)
        store.createIndex('timestamp', 'timestamp', { unique: false })
      }
    })
  }

  async function get(key) {
    console.log(`[IDBCache] Getting key: ${key}`)
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
          console.log(`[IDBCache] Key expired: ${key}`)
          remove(key)
          return resolve(null)
        }
        console.log(`[IDBCache] Key retrieved: ${key}`)
        try {
          resolve(JSON.parse(result.data))
        } catch (e) {
          resolve(result.data)
        }
      }
      req.onerror = () => reject(req.error)
    })
  }

  async function set(key, value) {
    console.log(`[IDBCache] Setting key: ${key}`)
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const data = {
        data: JSON.stringify(value),
        timestamp: Date.now()
      }
      const req = store.put(data, key)
      req.onsuccess = () => {
        console.log(`[IDBCache] Key set: ${key}`)
        resolve(true)
      }
      req.onerror = () => reject(req.error)
    })
  }

  async function remove(key) {
    console.log(`[IDBCache] Removing key: ${key}`)
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const req = store.delete(key)
      req.onsuccess = () => {
        console.log(`[IDBCache] Key removed: ${key}`)
        resolve(true)
      }
      req.onerror = () => reject(req.error)
    })
  }

  async function queueMutation(key, payload) {
    console.log(`[IDBCache] Queuing mutation for key: ${key}`)
    return set(`pending:${key}`, payload)
  }

  async function flushMutations(sendFn) {
    console.log('[IDBCache] Attempting to flush queued mutations...')
    const db = await openDB()
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const req = store.getAllKeys()
    req.onsuccess = async () => {
      for (const key of req.result) {
        if (!key.startsWith('pending:')) continue
        const data = await get(key)
        try {
          console.log(`[IDBCache] Sending mutation for key: ${key}`)
          await sendFn(data)
          await remove(key)
          console.log(`[IDBCache] Mutation sent and removed: ${key}`)
        } catch (err) {
          console.warn(`[IDBCache] Failed to send mutation for key: ${key}`, err)
        }
      }
    }
  }

  if ('onLine' in navigator) {
    window.addEventListener('online', () => {
      console.log('[IDBCache] Online event detected — attempting flush')
      if (typeof IDBCache !== 'undefined' && typeof IDBCache.flushMutations === 'function') {
        IDBCache.flushMutations(() => Promise.resolve())
      }
    })
  }

  return { get, set, remove, queueMutation, flushMutations }
})()

// Example usage:
// IDBCache.set('draft', formData)
// IDBCache.get('draft').then(data => { ... })
// IDBCache.remove('draft')
// IDBCache.queueMutation('user:123', updateData)
// IDBCache.flushMutations(sendToServer)
