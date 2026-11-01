const C = 'perfmind-v4';
const FILES = ['./', 'index.html', 'supabase.js', 'manifest.webmanifest', 'mark-dark.png', 'mark-light.png', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(C).then(c => c.addAll(FILES))); });
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== C).map(x => caches.delete(x)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // Uniquement les fichiers de l'appli : jamais les données Supabase (privées)
  const u = new URL(e.request.url);
  if (u.origin !== self.location.origin) return;
  e.respondWith(fetch(e.request).then(r => { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)); return r; }).catch(() => caches.match(e.request)));
});

// Notifications push : message reçu
self.addEventListener('push', e => {
  let d = {}; try { d = e.data ? e.data.json() : {}; } catch (x) {}
  const tasks = [self.registration.showNotification(d.title || 'Perfmind', { body: d.body || 'Nouveau message', icon: 'icon-192.png', badge: 'icon-192.png', tag: d.tag || 'msg', renotify: true, data: { url: d.url || './' } })];
  if (self.navigator && self.navigator.setAppBadge && typeof d.badge === 'number') tasks.push(self.navigator.setAppBadge(d.badge).catch(() => {}));
  e.waitUntil(Promise.all(tasks));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || './';
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    for (const c of list) if ('focus' in c) return c.focus();
    return self.clients.openWindow(url);
  }));
});
