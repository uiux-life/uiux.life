// assets/js/idb-cache.js

// Plug-and-play IndexedDB cache utility for offline-safe data
// Assumes same directory structure and no external libraries

const IDBCache = (() => {
  const DB_NAME = 'UIUXOffline'
  const STORE_NAME = 'resources'
  const EXPIRY_MS = 1000 * 60 * 60 * 24 * 7 // 7 days

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

  return { get, set, remove }
})()

// Example usage:
// IDBCache.set('draft', formData)
// IDBCache.get('draft').then(data => { ... })
// IDBCache.remove('draft')
