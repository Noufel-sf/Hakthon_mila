/**
 * Bawsala+ (البوصلة +) Progressive Web App Service Worker
 * Designed for offline disaster relief and intermittent field connectivity
 */

const CACHE_NAME = 'bawsala-pwa-v1';
const STATIC_CACHE = 'bawsala-static-v1';
const API_CACHE = 'bawsala-api-v1';

const PRECACHE_ASSETS = [
  '/',
  '/offline',
  '/map',
  '/needs',
  '/depots',
  '/favicon.ico',
  '/bawsala+.png',
  '/logo2.PNG',
  '/manifest.webmanifest',
];

// Install Event: Pre-cache critical core shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SW] Pre-cache partial failure:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Event: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (
            cacheName !== CACHE_NAME &&
            cacheName !== STATIC_CACHE &&
            cacheName !== API_CACHE
          ) {
            console.log('[SW] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event: Smart routing & caching strategies
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip non-GET requests and chrome-extension/other schemes
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // Strategy 1: HTML Page Navigations (Network-first -> Cache -> /offline fallback)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          const offlineFallback = await caches.match('/offline');
          if (offlineFallback) {
            return offlineFallback;
          }
          return new Response(
            '<html><body style="font-family: sans-serif; text-align: center; padding: 50px;">' +
            '<h2>أنت غير متصل بالإنترنت (Offline)</h2>' +
            '<p>يرجى التحقق من اتصال شبكة الهاتف المحمول أو التوجه لأقرب مركز إغاثة.</p>' +
            '<p>طوارئ الحماية المدنية: 14 / 1021</p>' +
            '</body></html>',
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        })
    );
    return;
  }

  // Strategy 2: API Requests (Network-first with cache fallback for field survival)
  if (url.pathname.startsWith('/api/') || url.hostname.includes('render.com')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(API_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) {
            return cached;
          }
          return new Response(
            JSON.stringify({ error: 'offline', message: 'Offline mode active' }),
            { headers: { 'Content-Type': 'application/json' } }
          );
        })
    );
    return;
  }

  // Strategy 3: Static Assets (Images, fonts, CSS, JS, Leaflet tiles) -> Stale-while-revalidate
  const isStatic =
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|webp|ico|woff2|woff|ttf)$/) ||
    url.hostname.includes('basemaps.cartocdn.com') ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com');

  if (isStatic) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => cached);

        return cached || fetchPromise;
      })
    );
    return;
  }

  // Default: Try network first, fallback to cache
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
