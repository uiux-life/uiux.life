// sw.js for UIUX.life

const CACHE_NAME = 'uiux-cache-v1'
const OFFLINE_URL = '/index.html'

const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/assets/css/styles.css',
  '/assets/js/scripts.js',
  '/manifest.webmanifest',
  '/assets/images/icon-192.png',
  '/assets/images/icon-512.png',
  '/assets/images/icon-512-maskable.png',
  '/assets/images/apple-icon-180.png',
  '/assets/images/icon.svg'
]

// Pre-cache critical assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE))
  )
  self.skipWaiting()
})

// Activate and clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

// Fetch handler: cache-first with offline fallback
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(cached =>
      cached || fetch(event.request).catch(() => caches.match(OFFLINE_URL))
    )
  )
})

// Listen for manual skipWaiting trigger
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
