window.APP_STORAGE_KEYS={
veiculos:"vf_veiculos",
motoristas:"vf_motoristas",
abastecimentos:"vf_abastecimentos"
}
window.APP_STATE={
veiculos:[],
motoristas:[],
abastecimentos:[],
deferredPrompt:null,
streamCamera:null
}
window.Utils={
gerarId(){
return Date.now().toString(36)+Math.random().toString(36).slice(2,8)
},
hojeISO(){
return new Date().toISOString().slice(0,10)
},
agoraInputDateTime(){
const d=new Date()
const pad=n=>String(n).padStart(2,"0")
return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
},
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
moeda(valor){
const n=Number(valor||0)
return n.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})
},
numero(valor,casas=2){
const n=Number(valor||0)
return n.toLocaleString("pt-BR",{minimumFractionDigits:casas,maximumFractionDigits:casas})
},
normalizar(txt){
return (txt||"").toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim()
},
diasPara(data){
if(!data)return null
const hoje=new Date()
hoje.setHours(0,0,0,0)
const alvo=new Date(data)
alvo.setHours(0,0,0,0)
return Math.ceil((alvo-hoje)/86400000)
}
}
