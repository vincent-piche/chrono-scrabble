"use strict";
/* Service worker : rend l'app (et le dictionnaire) utilisables hors-ligne
   après une première visite. On incrémente CACHE_NAME à chaque changement
   d'un fichier précaché — c'est le seul mécanisme d'invalidation : le
   navigateur ne sait pas qu'un fichier a changé tant que son URL ne bouge
   pas, donc changer le nom du cache force le re-téléchargement de tout.
   Version courte au lieu d'une date : on la relit à l'œil avant de publier
   pour être sûr de l'avoir bien incrémentée. */
const CACHE_NAME = "chrono-scrabble-v1";
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

/* Cache-first partout : tous les fichiers de l'app (y compris le
   dictionnaire) ne changent qu'à la publication d'une nouvelle version, pas
   à chaque partie. Pas besoin d'aller revérifier le réseau à chaque appui
   sur une tuile — la pendule doit rester utilisable même dans une cave sans
   signal. */
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then((hit) => hit || fetch(e.request)
      .then((res) => {
        // Ressource récupérée en ligne mais absente du précache (ex. police
        // Google Fonts) : on la met en cache pour la prochaine fois hors-ligne.
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match("./index.html"))
    )
  );
});
