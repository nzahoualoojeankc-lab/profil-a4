const CACHE_NAME = 'profili-a4-v1';
const urlsToCache = [
  './',
  './index.html',
  './app.html',
  './main.js',
  './manifest.json',
  './css/style.css',
  './css/app.css',
  './images/logo.png',
  './images/hero.png'
];

// Installation du Service Worker et mise en cache des fichiers essentiels
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Cache PWA Profili A4 ouvert avec succès');
      return cache.addAll(urlsToCache).catch(err => {
        console.warn('Erreur : Certains fichiers essentiels n\'ont pas pu être mis en cache', err);
      });
    })
  );
  self.skipWaiting();
});

// Activation et nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Suppression de l\'ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Stratégie : Network First (Réseau d'abord), puis Cache en cas de coupure Internet
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  // Ne pas intercepter les requêtes provenant d'extensions de navigateur (ex: Chrome devtools)
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (!response || response.status !== 200) {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((response) => {
          return response || new Response('Mode Hors Ligne - Profili A4 n\'a pas pu charger cette ressource car vous n\'avez pas de connexion internet.', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain; charset=utf-8'
            })
          });
        });
      })
  );
});
