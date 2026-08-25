"use strict";
/* Service worker : rend l'app (et le dictionnaire) utilisables hors-ligne
   après une première visite. On incrémente CACHE_NAME à chaque changement
   d'un fichier précaché — c'est le seul mécanisme d'invalidation : le
   navigateur ne sait pas qu'un fichier a changé tant que son URL ne bouge
   pas, donc changer le nom du cache force le re-téléchargement de tout.
   Version courte au lieu d'une date : on la relit à l'œil avant de publier
   pour être sûr de l'avoir bien incrémentée. */
const CACHE_NAME = "chrono-scrabble-v2";
const PRECACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./dict/fr.txt",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  );
});

/* Deux stratégies selon le type de fichier :
   - pages HTML + manifest (le "coquille" de l'app, ce qui change à chaque
     publication) : network-first — la version en ligne prime dès qu'elle
     est joignable, le cache ne sert que de repli hors-ligne. Sans ça, un
     navigateur qui a déjà visité le site une fois ne revoit plus jamais les
     mises à jour, quel que soit CACHE_NAME (c'est le bug qu'on vient de
     traquer : cache-first ne revérifie JAMAIS le réseau tant qu'une réponse
     est déjà en cache).
   - tout le reste (dictionnaire, icônes, polices) : cache-first — ces
     fichiers ne changent qu'à la publication d'une nouvelle version, pas
     besoin d'aller revérifier le réseau à chaque appui sur une tuile, et la
     pendule doit rester utilisable même dans une cave sans signal. */
function isAppShell(request){
  return request.mode === "navigate" || /\.html$/.test(new URL(request.url).pathname) || new URL(request.url).pathname.endsWith("manifest.json");
}
function putInCache(request, response){
  const copy = response.clone();
  caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
  return response;
}
function networkFirst(request){
  // cache:"no-store" court-circuite le cache HTTP du navigateur (pas
  // seulement celui de ce service worker) : sinon un Chrome qui juge la
  // réponse encore "fraîche" selon ses propres heuristiques peut la
  // resservir sans repasser par le réseau, et on retombe dans le même
  // problème qu'on corrige ici.
  return fetch(request, { cache: "no-store" })
    .then((res) => putInCache(request, res))
    .catch(() => caches.match(request).then((hit) => hit || caches.match("./index.html")));
}
function cacheFirst(request){
  return caches.match(request).then((hit) => hit || fetch(request).then((res) => putInCache(request, res)));
}
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(isAppShell(e.request) ? networkFirst(e.request) : cacheFirst(e.request));
});
