const CACHE_NAME = 'cafe-mobile-v1';
const ARQUIVOS = [
  './', './index.html', './manifest.webmanifest', './css/style.css',
  './js/dados.js', './js/app.js', './js/camera.js', './icons/icon.svg'
];

self.addEventListener('install', evento => {
  evento.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ARQUIVOS)));
  self.skipWaiting();
});

self.addEventListener('activate', evento => {
  evento.waitUntil(
    caches.keys().then(chaves => Promise.all(
      chaves.filter(chave => chave !== CACHE_NAME).map(chave => caches.delete(chave))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', evento => {
  if (evento.request.method !== 'GET') return;
  evento.respondWith(
    caches.match(evento.request).then(respostaCache => respostaCache || fetch(evento.request).then(resposta => {
      if (new URL(evento.request.url).origin === self.location.origin) {
        const copia = resposta.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(evento.request, copia));
      }
      return resposta;
    }).catch(() => caches.match('./index.html')))
  );
});
