const CACHE_NAME = 'kasir-app-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install Service Worker
self.addEventListener('install', event => {
  console.log('[SW] Install event');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Service Worker
self.addEventListener('activate', event => {
  console.log('[SW] Activate event');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Strategy: Cache First, then Network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(response => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(() => {
          // Return offline page or fallback
          return new Response(
            '<html><body><h1>Offline</h1><p>Aplikasi memerlukan koneksi internet untuk pertama kali.</p></body></html>',
            { headers: { 'Content-Type': 'text/html' } }
          );
        });
      })
  );
});

// Background Sync (optional - for syncing transactions when back online)
self.addEventListener('sync', event => {
  console.log('[SW] Sync event:', event.tag);
  if (event.tag === 'sync-transactions') {
    event.waitUntil(syncTransactions());
  }
});

async function syncTransactions() {
  console.log('[SW] Syncing transactions...');
  // Logic untuk sync data transaksi ke server jika ada
  // Saat ini aplikasi menggunakan localStorage saja
  return Promise.resolve();
}

// Push Notifications (optional - untuk notifikasi stok rendah)
self.addEventListener('push', event => {
  console.log('[SW] Push event:', event);
  
  const options = {
    body: event.data ? event.data.text() : 'Notifikasi baru',
    icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAABnklEQVR4nO2WP0vDQBjGnxRFEBx0EBzEQXDq4CI4iYOTg4uDo5OTk4uLi4Ojk4Ojo5OTk4uLi4Ojk5OTi4uLi4Ojk5OTi4uLi4Ojk5OTi4v/0VBabZq0SW/S3PeBC+Ty5OF97r1LCgAAAAAAAAAAAAAAAAAAAAAA/hNJkqSklNpVSh0qpY6UUkdKqUOl1IFS6kApdaCU2ldK7Sul9pRSe0qpXaXUjlJqWym1pZTaVEptKKXWlVJrSqlVpdSKUmpZKbWklFpUSi0opRaUUvNKqTml1KxSakYpNa2UmlJKTSqlJpRSI0qpYaXUkFJqUCk1oJTqV0r1KaV6lVI9SqkupdSgUqpbKdWtlOpSSg0qpbqVUt1KqS6l1KBSqlsp1a2U6lJKDSqlupVS3UqpLqXUoFKqWynVrZTqUkoNKqW6lVLdSqkupdSgUqpbKdWtlOpSSg0qpbqVUt1KqS6l1KBSqlsp1a2U6lJKDSqlupVS3UqpLqXUoFKqWynVrZTqUkoNKqW6lVLdSqkupdSgUqpbKdWtlOpSSg0qpbqVUt1KqS6l1KBSqlsp1a2U6lJK/VdJk+QLwP3xvK0+YgAAAABJRU5ErkJggg==',
    badge: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAABnklEQVR4nO2WP0vDQBjGnxRFEBx0EBzEQXDq4CI4iYOTg4uDo5OTk4uLi4Ojk4Ojo5OTk4uLi4Ojk5OTi4uLi4Ojk5OTi4uLi4Ojk5OTi4v/0VBabZq0SW/S3PeBC+Ty5OF97r1LCgAAAAAAAAAAAAAAAAAAAAAA/hNJkqSklNpVSh0qpY6UUkdKqUOl1IFS6kApdaCU2ldK7Sul9pRSe0qpXaXUjlJqWym1pZTaVEptKKXWlVJrSqlVpdSKUmpZKbWklFpUSi0opRaUUvNKqTml1KxSakYpNa2UmlJKTSqlJpRSI0qpYaXUkFJqUCk1oJTqV0r1KaV6lVI9SqkupdSgUqpbKdWtlOpSSg0qpbqVUt1KqS6l1KBSqlsp1a2U6lJKDSqlupVS3UqpLqXUoFKqWynVrZTqUkoNKqW6lVLdSqkupdSgUqpbKdWtlOpSSg0qpbqVUt1KqS6l1KBSqlsp1a2U6lJKDSqlupVS3UqpLqXUoFKqWynVrZTqUkoNKqW6lVLdSqkupdSgUqpbKdWtlOpSSg0qpbqVUt1KqS6l1KBSqlsp1a2U6lJK/VdJk+QLwP3xvK0+YgAAAABJRU5ErkJggg==',
    vibrate: [200, 100, 200],
    tag: 'kasir-notification',
    requireInteraction: false
  };
  
  event.waitUntil(
    self.registration.showNotification('Aplikasi Kasir', options)
  );
});

// Notification Click
self.addEventListener('notificationclick', event => {
  console.log('[SW] Notification click:', event);
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});

// Message from client
self.addEventListener('message', event => {
  console.log('[SW] Message from client:', event.data);
  
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
  
  if (event.data.action === 'clearCache') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      })
    );
  }
});

console.log('[SW] Service Worker loaded');

