/* ====================================================001 – STORAGE KEYS==================================================== */
window.APP_STORAGE_KEYS={
veiculos:"vf_veiculos",
motoristas:"vf_motoristas",
abastecimentos:"vf_abastecimentos"
}

/* ====================================================002 – STATE GLOBAL==================================================== */
if(!window.APP_STATE){
window.APP_STATE={
veiculos:[],
motoristas:[],
abastecimentos:[],
deferredPrompt:null,
streamCamera:null
}
}

/* ====================================================003 – UTILS==================================================== */
window.Utils={

/* 🔑 ID */
gerarId(){
return Date.now().toString(36)+Math.random().toString(36).slice(2,8)
},

/* 📅 HOJE */
hojeISO(){
return new Date().toISOString().slice(0,10)
},

/* 📅 DATETIME INPUT */
agoraInputDateTime(){
const d=new Date()
const pad=n=>String(n).padStart(2,"0")
return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
},

/* 📅 FORMATOS */
formatarData(valor){
if(!valor)return"-"
const d=new Date(valor)
if(Number.isNaN(d.getTime()))return valor
return d.toLocaleDateString("pt-BR")
},

formatarDataHora(valor){
if(!valor)return"-"
const d=new Date(valor)
if(Number.isNaN(d.getTime()))return valor
return d.toLocaleString("pt-BR")
},

/* 💰 MOEDA */
moeda(valor){
const n=Number(valor||0)
return n.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})
},

/* 🔢 NUMERO */
numero(valor,casas=2){
const n=Number(valor||0)
return n.toLocaleString("pt-BR",{minimumFractionDigits:casas,maximumFractionDigits:casas})
},

/* 🔍 NORMALIZAR */
normalizar(txt){
return (txt||"")
.toString()
.toLowerCase()
.normalize("NFD")
.replace(/[\u0300-\u036f]/g,"")
.trim()
},

/* ⏱️ DIAS PARA */
diasPara(data){
if(!data)return null

const hoje=new Date()
hoje.setHours(0,0,0,0)

const alvo=new Date(data.length<=10 ? data+"T00:00:00" : data)
if(Number.isNaN(alvo.getTime()))return null

alvo.setHours(0,0,0,0)

return Math.ceil((alvo-hoje)/86400000)
}

}
