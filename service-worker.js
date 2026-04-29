/* ========================================= */
/* 🔥 SW VEÍCULOS PRO – CACHE INTELIGENTE */
/* ========================================= */

const CACHE_NAME="veiculos-v3"

/* 🔥 ARQUIVOS ESSENCIAIS */
const ASSETS=[
"./",
"./index.html",
"./manifest.json",
"./img/192x192.png",
"./img/512x512.png"
]

/* ========================================= */
/* 🔥 INSTALL */
/* ========================================= */
self.addEventListener("activate",e=>{
e.waitUntil(
caches.keys().then(keys=>{
return Promise.all(
keys.filter(k=>k!==CACHE_NAME)
.map(k=>caches.delete(k))
)
})
)
})

/* ========================================= */
/* 🔥 ACTIVATE */
/* ========================================= */
self.addEventListener("activate",e=>{
e.waitUntil(
caches.keys().then(keys=>{
return Promise.all(keys.map(k=>caches.delete(k)))
})
)
self.clients.claim()
})

/* ========================================= */
/* 🔥 FETCH – CACHE FIRST (ULTRA RÁPIDO) */
/* ========================================= */
self.addEventListener("fetch",e=>{

/* IGNORA REQUISIÇÕES DO SUPABASE */
if(e.request.url.includes("supabase.co")){
return
}

e.respondWith(
caches.match(e.request).then(res=>{
return res||fetch(e.request).then(network=>{
return caches.open(CACHE_NAME).then(cache=>{
cache.put(e.request,network.clone())
return network
})
}).catch(()=>{
/* fallback offline */
if(e.request.destination==="document"){
return caches.match("./index.html")
}
})
})
)

})
