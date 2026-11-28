// Vervangt de service worker van de gearchiveerde eerste versie (Parcours) op /kijksport/.
// Ruimt alleen de oude caches van dat adres op (kijksport-, sportkijk-), meldt zich af en stuurt open vensters door.
// De caches van Speelveld (speelveld-) en de testversie (proef-) blijven staan.
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>{event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(k=>k.startsWith('kijksport-')||k.startsWith('sportkijk-')).map(k=>caches.delete(k)));
  await self.registration.unregister();
  const vensters=await self.clients.matchAll({type:'window'});
  for(const v of vensters){const u=new URL(v.url);if(!u.pathname.startsWith('/kijksport/speelveld/')&&!u.pathname.startsWith('/kijksport/test/'))v.navigate('/kijksport/speelveld/'+u.search+u.hash).catch(()=>{})}
})())});
