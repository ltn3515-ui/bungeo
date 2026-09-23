/* ASSETS is injected by scripts/pwa-build.mjs after Vite finishes. */
const CACHE='bungeo-town-__VERSION__';
const ASSETS=__ASSETS__;
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('bungeo-town-')&&key!==CACHE).map(key=>caches.delete(key)))),self.clients.claim()]));
});
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET'||new URL(request.url).origin!==self.location.origin)return;
  if(request.mode==='navigate'){
    event.respondWith(fetch(request).then(response=>response.ok?response:Promise.reject(response)).catch(()=>caches.match('/index.html')));
    return;
  }
  event.respondWith(caches.match(request).then(hit=>hit||fetch(request)));
});
