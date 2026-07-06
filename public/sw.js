/**
 * sw.js — Canteen POS Service Worker
 *
 * Responsibilities:
 *   1. Cache app shell assets on install (HTML, JS, CSS bundles)
 *   2. Serve cached assets when offline (cache-first for static, network-first for API)
 *   3. Show an offline fallback page when everything fails
 *
 * CACHING STRATEGY BY RESOURCE TYPE:
 *   /_next/static/  → Cache-First (immutable hashed bundles — cache forever)
 *   /canteenPOS/*   → Network-First with cache fallback (HTML pages)
 *   /api/*          → Network-Only (API calls handled by Dexie offline queue, not SW)
 *   Everything else → Stale-While-Revalidate
 *
 * IMPORTANT:
 *   This service worker does NOT intercept /api/ calls.
 *   Offline API queueing is handled by Dexie sync_queue in the React layer.
 *   Mixing SW fetch interception with Dexie would create race conditions.
 */

const CACHE_VERSION = 'v1';
const APP_SHELL_CACHE = `canteen-app-shell-${CACHE_VERSION}`;
const PAGES_CACHE    = `canteen-pages-${CACHE_VERSION}`;
const STATIC_CACHE   = `canteen-static-${CACHE_VERSION}`;

// ─── App Shell Assets ─────────────────────────────────────────────────────────
// These are pre-cached on install so the UI loads instantly even when offline.

const APP_SHELL_ASSETS = [
  '/canteenPOS',
  '/canteenPOS/pos',
  '/canteenPOS/orders',
  '/canteenPOS/kitchen',
  '/canteenPOS/tables',
  '/canteenPOS/menu',
  '/canteenPOS/customers',
  '/canteenPOS/inventory',
  '/canteenPOS/bookings',
  '/canteenPOS/reports',
  '/canteenPOS/dashboard',
  '/offline.html',
];

// ─── Install ──────────────────────────────────────────────────────────────────

self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then(async (cache) => {
      // Pre-cache silently — individual failures don't block install
      const results = await Promise.allSettled(
        APP_SHELL_ASSETS.map((url) => cache.add(url).catch(() => {}))
      );
      const failed = results.filter((r) => r.status === 'rejected').length;
      if (failed > 0) {
        console.warn(`[SW] ${failed} assets failed to pre-cache (non-fatal).`);
      }
      console.log('[SW] App shell cached.');
    })
  );
  // Activate immediately without waiting for old SW to die
  self.skipWaiting();
});

// ─── Activate ─────────────────────────────────────────────────────────────────

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      const CURRENT_CACHES = [APP_SHELL_CACHE, PAGES_CACHE, STATIC_CACHE];
      return Promise.all(
        cacheNames
          .filter((name) => !CURRENT_CACHES.includes(name))
          .map((name) => {
            console.log(`[SW] Deleting old cache: ${name}`);
            return caches.delete(name);
          })
      );
    })
  );
  // Take control of all open clients immediately
  self.clients.claim();
});

// ─── Fetch Interception ───────────────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only intercept GET requests
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // Only handle http/https protocols
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }

  // 1. Never intercept API calls — handled by Dexie offline queue
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // 2. Next.js static bundles — Cache-First (immutable hashed files)
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
    return;
  }

  // 3. Canteen POS pages — Network-First with cache fallback
  if (url.pathname.startsWith('/canteenPOS')) {
    event.respondWith(networkFirstStrategy(request, PAGES_CACHE));
    return;
  }

  // 4. Everything else — Stale-While-Revalidate
  event.respondWith(staleWhileRevalidate(request, APP_SHELL_CACHE));
});

// ─── Caching Strategies ───────────────────────────────────────────────────────

/**
 * Cache-First: Serve from cache. Only network if cache misses.
 * Used for immutable static assets (hashed Next.js bundles).
 */
async function cacheFirstStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

/**
 * Network-First: Try network, fall back to cache on failure.
 * Used for HTML pages so users always get fresh content when online.
 */
async function networkFirstStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;

    // Show the offline fallback page
    const offlineFallback = await caches.match('/offline.html');
    return offlineFallback || new Response(
      '<h1>Offline</h1><p>Please check your internet connection.</p>',
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
}

/**
 * Stale-While-Revalidate: Serve cache immediately, refresh in background.
 */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => null);

  return cached || fetchPromise || new Response('Offline', { status: 503 });
}
