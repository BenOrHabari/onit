// שומר את האפליקציה בטלפון כדי שתעבוד גם בלי קליטה.
// כשיש קליטה – תמיד מביא את הגרסה העדכנית; בלי קליטה – מהזיכרון.
const V = 'onit-v4';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(caches.open(V).then(async c => {
    const hit = await c.match(e.request, { ignoreSearch: true });
    const net = fetch(e.request, { cache: 'no-cache' }).then(r => { if (r.ok) c.put(e.request, r.clone()); return r; });
    // דף האפליקציה: קודם מהרשת (עד 3 שניות), אחרת מהזיכרון
    if (e.request.mode === 'navigate' || u.pathname.endsWith('/') || u.pathname.endsWith('.html')) {
      return Promise.race([net, new Promise((_, rej) => setTimeout(rej, 3000))]).catch(() => hit || net);
    }
    return hit || net.catch(() => hit);
  }));
});
