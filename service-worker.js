/* ========================================= */
/* 🔥 SW VEÍCULOS PRO – CACHE INTELIGENTE */
/* ========================================= */

const CACHE_NAME="veiculos-v3"
const ASSETS=["./","./index.html","./manifest.json","./favicon.ico"]
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
self.clients.claim()
e.waitUntil(
caches.keys().then(keys=>{
return Promise.all(
keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k))
)
})
)
})

/* ========================================= */
/* 🔥 ACTIVATE */
/* ========================================= */
self.addEventListener("install",e=>{
self.skipWaiting()
e.waitUntil(
caches.open(CACHE_NAME).then(cache=>cache.addAll(ASSETS))
)
})

/* ========================================= */
/* 🔥 FETCH – CACHE FIRST (PROFISSIONAL) */
/* ========================================= */
self.addEventListener("fetch",e=>{

/* 🔒 IGNORA SUPABASE (API) */
if(e.request.url.includes("supabase.co"))return

/* 🔒 IGNORA MÉTODOS NÃO-GET */
if(e.request.method!=="GET")return

e.respondWith(
caches.match(e.request).then(cacheRes=>{

/* 🔥 SE TEM CACHE → RETORNA RÁPIDO */
if(cacheRes)return cacheRes

/* 🔥 SENÃO → BUSCA NA REDE */
return fetch(e.request)
.then(networkRes=>{

/* 🔒 SE RESPOSTA INVÁLIDA → NÃO CACHEIA */
if(!networkRes||networkRes.status!==200)return networkRes

let clone=networkRes.clone()

/* 🔥 SALVA NO CACHE */
caches.open(CACHE_NAME).then(cache=>{
cache.put(e.request,clone)
})

return networkRes

})
.catch(()=>{

/* 🔥 FALLBACK OFFLINE */
if(e.request.destination==="document"){
return caches.match("./index.html")
}

/* 🔥 IMAGENS OPCIONAL */
if(e.request.destination==="image"){
return caches.match("./favicon.ico")
}

})

})
)

})
