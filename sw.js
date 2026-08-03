// MonBudget CI — Service Worker
// Met à jour la version à chaque nouvelle mise en ligne
const V = 'mbc-v4';
const SHELL = ['./','./index.html'];

// Installation : mise en cache de l'app
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(V).then(c => c.addAll(SHELL))
  );
  self.skipWaiting();
});

// Activation : suppression des anciens caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== V).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Interception des requêtes : cache d'abord, réseau ensuite
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request)
        .then(res => {
          // Mettre en cache les nouvelles ressources
          if (res && res.status === 200) {
            var clone = res.clone();
            caches.open(V).then(c => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});
