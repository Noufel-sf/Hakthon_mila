/**
 * Bawsala+ (البوصلة +) Progressive Web App Service Worker
 * Fully optimized for Next.js App Router, RSC (React Server Components),
 * and zero-connectivity disaster relief operations.
 */

const CACHE_VERSION = 'bawsala-pwa-v2';
const STATIC_CACHE = 'bawsala-static-v2';
const API_CACHE = 'bawsala-api-v2';

const CORE_ROUTES = [
  '/',
  '/offline',
  '/needs',
  '/depots',
  '/map',
  '/manifest.webmanifest',
  '/favicon.ico',
  '/bawsala+.png',
  '/logo2.PNG',
];

// Install Event: Pre-cache core application shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(async (cache) => {
      console.log('[SW] Pre-caching core routes for offline use...');
      for (const route of CORE_ROUTES) {
        try {
          const res = await fetch(route, { cache: 'no-cache' });
          if (res.ok) {
            await cache.put(route, res);
          }
        } catch (err) {
          console.warn(`[SW] Pre-cache skipped for ${route}:`, err);
        }
      }
    })
  );
  self.skipWaiting();
});

// Activate Event: Clean up stale caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (![CACHE_VERSION, STATIC_CACHE, API_CACHE].includes(key)) {
            console.log('[SW] Clearing deprecated cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event: Intelligent Next.js App Router & API caching
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Ignore non-http(s) and mutations (POST, PUT, DELETE)
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  const isRSC = request.headers.get('RSC') === '1' || url.searchParams.has('_rsc');
  const isNavigation = request.mode === 'navigate';
  const isApi = url.pathname.startsWith('/api/') || url.hostname.includes('render.com');
  const isNextStatic =
    url.pathname.startsWith('/_next/') ||
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|webp|ico|woff2|woff|ttf)$/) ||
    url.hostname.includes('tile.openstreetmap.org') ||
    url.hostname.includes('openstreetmap.org') ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com');

  // Strategy 1: Next.js Client Navigations (RSC Flight payloads ?_rsc=...)
  if (isRSC) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_VERSION).then((cache) => {
              cache.put(request, clone);
              // Also store under clean path for fuzzy match
              cache.put(url.pathname, response.clone());
            });
          }
          return response;
        })
        .catch(async () => {
          // Offline fallback for RSC
          const cached =
            (await caches.match(request)) ||
            (await caches.match(request, { ignoreSearch: true })) ||
            (await caches.match(url.pathname)) ||
            (await caches.match(url.pathname, { ignoreSearch: true }));

          if (cached) return cached;

          // If no RSC cached, fallback to cached /offline or clean HTML
          const offlinePage = await caches.match('/offline');
          return offlinePage || new Response('Offline', { status: 503 });
        })
    );
    return;
  }

  // Strategy 2: Full Page Navigations (Browser address bar / Hard reloads)
  if (isNavigation) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_VERSION).then((cache) => {
              cache.put(request, clone);
              cache.put(url.pathname, response.clone());
            });
          }
          return response;
        })
        .catch(async () => {
          // Look up in cache with and without query params
          const cached =
            (await caches.match(request)) ||
            (await caches.match(request, { ignoreSearch: true })) ||
            (await caches.match(url.pathname)) ||
            (await caches.match(url.pathname, { ignoreSearch: true }));

          if (cached) return cached;

          const offlineFallback = await caches.match('/offline');
          if (offlineFallback) return offlineFallback;

          return new Response(
            '<html><head><meta charset="utf-8"/></head><body style="font-family: sans-serif; text-align: center; padding: 40px;" dir="rtl">' +
            '<h2>أنت غير متصل بالإنترنت (Offline)</h2>' +
            '<p>تعمل المنصة في وضع الطوارئ الميداني. يرجى التوجه لصفحة المستودعات أو الاتصال بالحماية المدنية (14 / 1021).</p>' +
            '<a href="/" style="display:inline-block; margin-top:15px; padding:10px 20px; background:#0E4B35; color:#fff; text-decoration:none;">الرئيسية</a>' +
            '</body></html>',
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        })
    );
    return;
  }

  // Strategy 3: API Requests (Disaster relief backend data) -> Network-first with Cache Fallback
  if (isApi) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(API_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached =
            (await caches.match(request)) ||
            (await caches.match(request, { ignoreSearch: true }));

          if (cached) return cached;

          return new Response(
            JSON.stringify([]),
            { headers: { 'Content-Type': 'application/json' } }
          );
        })
    );
    return;
  }

  // Strategy 4: Next.js Bundles, Static Assets, Chunks & Fonts -> Cache First / Stale-While-Revalidate
  if (isNextStatic) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request, { ignoreSearch: true });
        const networkFetch = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => cached);

        return cached || networkFetch;
      })
    );
    return;
  }

  // Default: Network with Cache Fallback
  event.respondWith(
    fetch(request)
      .then((res) => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(STATIC_CACHE).then((c) => c.put(request, clone));
        }
        return res;
      })
      .catch(() => caches.match(request, { ignoreSearch: true }))
  );
});
