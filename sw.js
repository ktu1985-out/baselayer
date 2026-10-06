// Network-first, bypassing the browser's HTTP cache for this app's own files,
// so a new deploy shows up on the next open. The cache only covers offline use.
const CACHE = "baselayer-v5";
const ASSETS = ["./", "./index.html", "./manifest.webmanifest", "./icon-180.png", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS))); self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const same = new URL(e.request.url).origin === location.origin;
  const net = same ? fetch(e.request.url, { cache: "no-cache", credentials: "same-origin" }) : fetch(e.request);
  e.respondWith(
    net.then(r => {
      if (same && r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return r;
    }).catch(() => caches.match(e.request).then(m => m || caches.match("./index.html")))
  );
});
