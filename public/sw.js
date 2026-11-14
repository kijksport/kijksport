// Cachet de app na een online bezoek. Werkt vanaf elke basismap (bijvoorbeeld /kijksport/ op GitHub Pages).
// Eigen cachenaam: de vorige versie van de app draait op hetzelfde adres en ruimt alleen 'kijksport-' op.
const CACHE='speelveld-v3';
const BASE=self.registration.scope;
// Bij installatie: de startpagina plus de scripts en stijlen waar die naar verwijst, zodat de app meteen offline opent.
self.addEventListener('install',event=>{event.waitUntil((async()=>{const c=await caches.open(CACHE);const page=await fetch(BASE,{cache:'no-cache'});const html=await page.clone().text();await c.put(BASE,page);const assets=[...html.matchAll(/(?:src|href)="([^"]+\/assets\/[^"]+)"/g)].map(m=>new URL(m[1],BASE).href);await c.addAll([...new Set([...assets,BASE+'manifest.webmanifest',BASE+'icon-192.png',BASE+'icon-512.png'])])})());self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('speelveld-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;event.respondWith(fetch(event.request).then(response=>{if(response.ok&&response.type==='basic'){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(c=>c.put(event.request,copy)))}return response}).catch(()=>caches.match(event.request).then(hit=>hit||(event.request.mode==='navigate'?caches.match(BASE):Response.error()))))});
