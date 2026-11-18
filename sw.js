// 19 Nov 2026 — the front door opens from this device at once (no wait for the network on launch = no black screen).
// The page is shown from the kept copy and refreshed in the background, so a change to the front door arrives on the next
// open. Only this page is handled; the app itself (Google's frame), its data and everything else go to the network as before.
var C = 'gbc-frontdoor-v1';
self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil(caches.open(C).then(function (c) { return c.add(new Request('./', { cache: 'reload' })); }).catch(function () {}));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== C; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var r = e.request;
  if (r.mode !== 'navigate' || new URL(r.url).origin !== self.location.origin) return;
  e.respondWith(caches.open(C).then(function (c) {
    return c.match('./').then(function (hit) {
      var net = fetch(r, { cache: 'no-store' }).then(function (res) { if (res && res.ok && res.type === 'basic') c.put('./', res.clone()); return res; });
      if (hit) { e.waitUntil(net.catch(function () {})); return hit; }
      return net;
    });
  }));
});
