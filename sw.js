/* Pamięć podręczna aplikacji. Podbij CACHE po każdej podmianie rejestr.jsx —
   inaczej telefon będzie serwował starą wersję mimo wgrania nowej. */
const CACHE = "rejestr-v1.33";
const PLIKI = [
  "./index.html",
  "./rejestr.jsx",
  "./manifest.json",
  "https://unpkg.com/react@18/umd/react.production.min.js",
  "https://unpkg.com/react-dom@18/umd/react-dom.production.min.js",
  "https://unpkg.com/@babel/standalone@7/babel.min.js",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PLIKI)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((k) =>
    Promise.all(k.filter((x) => x !== CACHE).map((x) => caches.delete(x)))
  ).then(() => self.clients.claim()));
});

/* Wywołania do API Anthropic i GitHuba nigdy nie idą z pamięci podręcznej —
   odpowiedź sprzed tygodnia byłaby gorsza niż brak odpowiedzi. */
self.addEventListener("fetch", (e) => {
  const u = e.request.url;
  if (u.includes("api.anthropic.com") || u.includes("api.github.com")) return;
  e.respondWith(
    caches.match(e.request).then((c) => c || fetch(e.request).then((r) => {
      if (r.ok && e.request.method === "GET") {
        const kopia = r.clone();
        caches.open(CACHE).then((ch) => ch.put(e.request, kopia));
      }
      return r;
    }).catch(() => c))
  );
});
