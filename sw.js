const C = 'perfmind-v3';
const FILES = ['./', 'index.html', 'supabase.js', 'manifest.webmanifest', 'mark-dark.png', 'mark-light.png', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => e.waitUntil(caches.open(C).then(c => c.addAll(FILES))));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== C).map(x => caches.delete(x))))));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // Uniquement les fichiers de l'appli : jamais les données Supabase (privées)
  const u = new URL(e.request.url);
  if (u.origin !== self.location.origin) return;
  e.respondWith(fetch(e.request).then(r => { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)); return r; }).catch(() => caches.match(e.request)));
});
