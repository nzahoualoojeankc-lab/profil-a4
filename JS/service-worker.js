// Increment this version with each release to refresh installed caches.
const CACHE_NAME = 'profili-a4-v21';
const PRECACHE_URLS = [
  './',
  './index.html',
  './HTML/index.html',
  './HTML/app.html',
  './HTML/profiles/catalog.json',
  './HTML/profiles/payroll-report/profile.html',
  './HTML/profiles/payroll-report/parameters.json',
  './HTML/profiles/payroll-report/profile.css',
  './HTML/profiles/payroll-check/profile.html',
  './HTML/profiles/payroll-check/parameters.json',
  './HTML/profiles/payroll-check/profile.css',
  './HTML/profiles/event-badge/profile.html',
  './HTML/profiles/event-badge/parameters.json',
  './HTML/profiles/event-badge/profile.css',
  './HTML/profiles/event-ticket/profile.html',
  './HTML/profiles/event-ticket/parameters.json',
  './HTML/profiles/event-ticket/profile.css',
  './HTML/offline.html',
  './manifest.json',
  './JS/i18n.js',
  './JS/main.js',
  './JS/update-check.js',
  './JS/pwa.js',
  './JS/app-init.js',
  './JS/app.js',
  './JS/app-events.js',
  './JS/notifications.js',
  './JS/documents.js',
  './JS/verification.js',
  './JS/vendor/jsQR.js',
  './JS/vendor/qrcode-generator.js',
  './JS/supabase-config.js',
  './CSS/style.css',
  './CSS/app.css',
  './images/logo.png',
  './images/hero.png',
  './images/pwa-icon-192.png',
  './images/pwa-icon-512.png',
  './images/pwa-icon-180.png',
  './images/pwa-maskable-192.png',
  './images/pwa-maskable-512.png',
  './images/favicon/favicon.ico',
];
const PRECACHE_PATHS = new Set(PRECACHE_URLS.map(path => new URL(path, self.location).pathname));
const APP_ROUTES = new Set([
  './',
  './index.html',
  './HTML/index.html',
  './HTML/app.html'
].map(path => new URL(path, self.location).pathname));
const OFFLINE_URL = new URL('./HTML/offline.html', self.location).href;

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(PRECACHE_URLS);
    await self.skipWaiting();
  })());
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    event.waitUntil(self.skipWaiting());
  }
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames
        .filter(cacheName => cacheName.startsWith('profili-a4-') && cacheName !== CACHE_NAME)
        .map(cacheName => caches.delete(cacheName))
    );
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok && APP_ROUTES.has(url.pathname)) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, response.clone());
        }
        return response;
      } catch {
        const cachedPage = await caches.match(request, { ignoreSearch: true });
        if (cachedPage) return cachedPage;
        const offlinePage = await caches.match(OFFLINE_URL);
        return offlinePage || Response.error();
      }
    })());
    return;
  }

  if (!PRECACHE_PATHS.has(url.pathname)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cacheKey = new Request(url.origin + url.pathname);
    const networkFirst = /\.(?:html|css|js)$/i.test(url.pathname);

    if (!networkFirst) {
      const cachedResponse = await cache.match(cacheKey);
      if (cachedResponse) return cachedResponse;

      const response = await fetch(request);
      if (response.ok) await cache.put(cacheKey, response.clone());
      return response;
    }

    let response;
    try {
      response = await fetch(request);
    } catch (error) {
      const cachedResponse = await cache.match(cacheKey);
      if (cachedResponse) return cachedResponse;
      throw error;
    }

    if (response.ok) {
      try {
        await cache.put(cacheKey, response.clone());
      } catch (error) {
        console.error('Could not update the offline cache for an app resource.', error);
      }
    }
    return response;
  })());
});
