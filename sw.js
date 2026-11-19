"use strict";
// =====================================================
//  SERVICE WORKER – macht Ödland offline spielbar und installierbar
//
//  Strategie "stale-while-revalidate": Dateien sofort aus dem Speicher liefern (schneller Start,
//  auch offline) und im Hintergrund die neueste Version vom Server holen.
//  Die Liste der Dateien und die Versionsnummer stehen in js/version.js.
//  Schriften von Google werden beim ersten Laden ebenfalls gespeichert.
// =====================================================

importScripts("js/version.js");   // liefert APP_VERSION und APP_DATEIEN
const CACHE = "oedland-v" + APP_VERSION;
const SCHRIFTEN = "oedland-schriften";

self.addEventListener("install", ereignis => {
  ereignis.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(APP_DATEIEN.map(datei => new Request(datei, { cache: "reload" }))))
      .then(() => self.skipWaiting())
  );
});

// Alte Versionen aufräumen (die Schriften bleiben)
self.addEventListener("activate", ereignis => {
  ereignis.waitUntil(
    caches.keys()
      .then(namen => Promise.all(namen.filter(n => n !== CACHE && n !== SCHRIFTEN).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", ereignis => {
  const anfrage = ereignis.request;
  if (anfrage.method !== "GET") return;
  const adresse = new URL(anfrage.url);

  // Google-Schriften: einmal laden, dann aus dem Speicher
  if (adresse.hostname === "fonts.googleapis.com" || adresse.hostname === "fonts.gstatic.com") {
    ereignis.respondWith(
      caches.open(SCHRIFTEN).then(cache => cache.match(anfrage).then(gespeichert => gespeichert ||
        fetch(anfrage).then(antwort => { cache.put(anfrage, antwort.clone()); return antwort; })))
    );
    return;
  }
  if (adresse.origin !== self.location.origin) return;
  if (adresse.searchParams.has("frisch")) return;   // Versions-Check: immer direkt vom Server

  const ausDemNetz = fetch(anfrage.url, { cache: "no-cache", credentials: "same-origin" }).then(antwort => {
    if (antwort.ok && antwort.type === "basic") {
      const kopie = antwort.clone();
      caches.open(CACHE).then(cache => cache.put(anfrage, kopie));
    }
    return antwort;
  });
  ereignis.waitUntil(ausDemNetz.catch(() => {}));
  ereignis.respondWith(caches.match(anfrage, { ignoreSearch: true }).then(gespeichert => gespeichert || ausDemNetz));
});
