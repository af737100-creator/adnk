/**
 * Service Worker for Ta3lemi Platform
 * Progressive Web App (PWA) Support
 * Version: 1.0.0
 */

const CACHE_NAME = 'ta3lemi-v1';
const API_CACHE_NAME = 'ta3lemi-api-v1';
const STATIC_CACHE_NAME = 'ta3lemi-static-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/setup.html',
  '/404.html',
  '/manifest.json',
  '/styles/main.css',
  '/styles/dashboard.css',
  '/styles/responsive.css',
  '/styles/print.css',
  '/scripts/main.js',
  '/scripts/utils.js',
  '/scripts/supabase-client.js',
  '/scripts/auth.js',
  '/scripts/youtube-api.js',
  '/scripts/interactive-player.js',
  '/scripts/course-manager.js',
  '/scripts/whiteboard.js',
  '/scripts/chat.js',
  '/scripts/analytics.js',
  '/assets/icons/favicon-16x16.png',
  '/assets/icons/favicon-32x32.png',
  '/assets/icons/apple-touch-icon.png',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png',
  '/assets/images/default-thumbnail.jpg',
  '/assets/images/placeholder/avatar-placeholder.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'
];

// API endpoints to cache (with network-first strategy)
const API_ENDPOINTS = [
  '/api/courses',
  '/api/interactions',
  '/api/users',
  '/api/classroom'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE_NAME && 
              cacheName !== API_CACHE_NAME && 
              cacheName !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - handle requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Handle API requests (network first, then cache)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(API_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // If network fails, try cache
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Return offline fallback for API
            return new Response(
              JSON.stringify({ 
                success: false, 
                error: 'offline',
                message: 'أنت غير متصل بالإنترنت' 
              }),
              {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
              }
            );
          });
        })
    );
    return;
  }
  
  // Handle page navigation (network first, then cache)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache the page
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Return offline page
            return caches.match('/offline.html');
          });
        })
    );
    return;
  }
  
  // Handle static assets (cache first, then network)
  if (request.destination === 'style' || 
      request.destination === 'script' || 
      request.destination === 'image' || 
      request.destination === 'font') {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((response) => {
          // Cache new assets
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(STATIC_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        });
      })
    );
    return;
  }
  
  // Default: network first
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-courses') {
    event.waitUntil(syncCourses());
  } else if (event.tag === 'sync-interactions') {
    event.waitUntil(syncInteractions());
  }
});

// Sync courses when back online
async function syncCourses() {
  try {
    const db = await openDB();
    const offlineCourses = await db.getAll('offline-courses');
    
    for (const course of offlineCourses) {
      await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(course)
      });
      await db.delete('offline-courses', course.id);
    }
    
    // Notify user
    self.registration.showNotification('تعليمي', {
      body: 'تم مزامنة دوراتك بنجاح',
      icon: '/assets/icons/icon-192.png'
    });
    
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

// Sync interactions when back online
async function syncInteractions() {
  try {
    const db = await openDB();
    const offlineInteractions = await db.getAll('offline-interactions');
    
    for (const interaction of offlineInteractions) {
      await fetch(`/api/interactions/${interaction.id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(interaction)
      });
      await db.delete('offline-interactions', interaction.id);
    }
    
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

// Open IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('Ta3lemiOfflineDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('offline-courses')) {
        db.createObjectStore('offline-courses', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('offline-interactions')) {
        db.createObjectStore('offline-interactions', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('offline-responses')) {
        db.createObjectStore('offline-responses', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/assets/icons/icon-192.png',
    badge: '/assets/icons/badge-72.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/'
    },
    actions: [
      {
        action: 'open',
        title: 'فتح'
      },
      {
        action: 'close',
        title: 'إغلاق'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});

// Message event
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});

// Periodic sync for updates
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-courses') {
    event.waitUntil(updateCourses());
  }
});

async function updateCourses() {
  try {
    const cache = await caches.open(API_CACHE_NAME);
    const response = await fetch('/api/courses');
    
    if (response.ok) {
      await cache.put('/api/courses', response.clone());
    }
    
  } catch (error) {
    console.error('Periodic sync failed:', error);
  }
}