const CACHE = 'remix-reel-v2';

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(c) {
      return c.addAll(['./', './index.html', './manifest.json',
        './icons/icon-192.png', './icons/icon-512.png']);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  var url = e.request.url;
  if (url.indexOf('generativelanguage.googleapis.com') >= 0 ||
      url.indexOf('image.pollinations.ai') >= 0 ||
      url.indexOf('fonts.googleapis.com') >= 0 ||
      url.indexOf('fonts.gstatic.com') >= 0) {
    e.respondWith(fetch(e.request));
    return;
  }
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      return cached || fetch(e.request).then(function(resp) {
        var clone = resp.clone();
        caches.open(CACHE).then(function(c) { c.put(e.request, clone); });
        return resp;
      });
    }).catch(function() {
      if (e.request.mode === 'navigate') {
        return caches.match('./index.html');
      }
    })
  );
});
