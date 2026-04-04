document.addEventListener("DOMContentLoaded",iniciarApp)

async function iniciarApp(){
await carregarDados()
configurarMenus()
configurarInstalacaoPWA()
registrarServiceWorker()
definirCamposIniciais()
window.renderizarVeiculos?.()
window.renderizarMotoristas?.()
window.renderizarAbastecimentos?.()
window.renderizarAlertas?.()
window.renderizarRelatorios?.()
atualizarDashboard()
window.atualizarDashboardInteligente?.()
}

async function carregarDados(){
if(window.db){
try{
const usuarioId=localStorage.getItem("usuario_id")
const tipo=localStorage.getItem("tipo_usuario")
const[{data:veiculos},{data:motoristas},{data:abastecimentos}]=await Promise.all([
window.db.from("veiculos").select("*").order("created_at",{ascending:false}),
window.db.from("motoristas").select("*").order("created_at",{ascending:false}),
window.db.from("abastecimentos").select("*").order("data_abastecimento",{ascending:false})
])
let v=veiculos||[]
let m=motoristas||[]
let a=abastecimentos||[]
if(tipo!=="admin"){
v=v.filter(x=>String(x.usuario_id)===String(usuarioId))
m=m.filter(x=>String(x.usuario_id)===String(usuarioId))
a=a.filter(x=>String(x.usuario_id)===String(usuarioId))
}
window.APP_STATE.veiculos=v
window.APP_STATE.motoristas=m
window.APP_STATE.abastecimentos=a
return
}catch(e){
console.error("Erro ao carregar Supabase",e)
}
}
carregarDadosLocal()
}

function carregarDadosLocal(){
const keys=window.APP_STORAGE_KEYS
const usuarioId=localStorage.getItem("usuario_id")
const tipo=localStorage.getItem("tipo_usuario")
let v=JSON.parse(localStorage.getItem(keys.veiculos)||"[]")
let m=JSON.parse(localStorage.getItem(keys.motoristas)||"[]")
let a=JSON.parse(localStorage.getItem(keys.abastecimentos)||"[]")
if(tipo!=="admin"){
v=v.filter(x=>String(x.usuario_id)===String(usuarioId))
m=m.filter(x=>String(x.usuario_id)===String(usuarioId))
a=a.filter(x=>String(x.usuario_id)===String(usuarioId))
}
window.APP_STATE.veiculos=v
window.APP_STATE.motoristas=m
window.APP_STATE.abastecimentos=a
}

function salvarDadosLocal(){
const keys=window.APP_STORAGE_KEYS
localStorage.setItem(keys.veiculos,JSON.stringify(window.APP_STATE.veiculos))
localStorage.setItem(keys.motoristas,JSON.stringify(window.APP_STATE.motoristas))
localStorage.setItem(keys.abastecimentos,JSON.stringify(window.APP_STATE.abastecimentos))
}

window.salvarDadosLocal=salvarDadosLocal

function configurarMenus(){
const botoes=document.querySelectorAll(".card-menu")
const paineis=document.querySelectorAll(".painel")
botoes.forEach(btn=>{
btn.addEventListener("click",()=>{
botoes.forEach(b=>b.classList.remove("ativo"))
paineis.forEach(p=>{
p.classList.remove("ativo")
p.style.display="none"
})
btn.classList.add("ativo")
const alvo=document.getElementById(btn.dataset.target)
if(alvo){
alvo.classList.add("ativo")
alvo.style.display="block"
}
})
})
/* 🔥 GARANTE APENAS UM INÍCIO */
paineis.forEach((p,i)=>{
if(i===0){
p.classList.add("ativo")
p.style.display="block"
}else{
p.classList.remove("ativo")
p.style.display="none"
}
})
}

function definirCamposIniciais(){
const input=document.getElementById("dataAbastecimento")
if(input&&!input.value)input.value=window.Utils.agoraInputDateTime()
}

function atualizarDashboard(){
const veiculos=window.APP_STATE.veiculos.length
const motoristas=window.APP_STATE.motoristas.length
const abastecimentos=window.APP_STATE.abastecimentos.length
const alertas=window.gerarAlertas?window.gerarAlertas().length:0
const elV=document.getElementById("kpiVeiculos")
const elM=document.getElementById("kpiMotoristas")
const elA=document.getElementById("kpiAbastecimentos")
const elL=document.getElementById("kpiAlertas")
if(elV)elV.textContent=veiculos
if(elM)elM.textContent=motoristas
if(elA)elA.textContent=abastecimentos
if(elL)elL.textContent=alertas
const resumo=document.getElementById("resumoRapido")
if(!resumo)return
if(!veiculos&&!motoristas&&!abastecimentos){
resumo.className="lista-vazia"
resumo.textContent="Nenhum dado cadastrado ainda."
return
}
const ultimo=window.APP_STATE.abastecimentos.slice().sort((a,b)=>new Date(b.data_abastecimento||b.dataAbastecimento)-new Date(a.data_abastecimento||a.dataAbastecimento))[0]
resumo.className=""
resumo.innerHTML=`
<div class="item-lista">
<div><strong>Total de veículos:</strong> ${veiculos}</div>
<div><strong>Total de motoristas:</strong> ${motoristas}</div>
<div><strong>Total de abastecimentos:</strong> ${abastecimentos}</div>
<div><strong>Último abastecimento:</strong> ${ultimo?`${window.Utils.formatarDataHora(ultimo.data_abastecimento||ultimo.dataAbastecimento)} • ${ultimo.posto||"Sem posto"} • ${window.Utils.moeda(ultimo.valor_total??ultimo.valorTotal)}`:"Nenhum"}</div>
</div>
`
}

window.atualizarDashboard=atualizarDashboard

function toast(msg){
const el=document.getElementById("toast")
if(!el)return
el.textContent=msg
el.classList.add("show")
clearTimeout(window.__toastTimer)
window.__toastTimer=setTimeout(()=>el.classList.remove("show"),2500)
}

window.toast=toast

function configurarInstalacaoPWA(){
window.addEventListener("beforeinstallprompt",e=>{
e.preventDefault()
window.APP_STATE.deferredPrompt=e
document.getElementById("btnInstalar")?.classList.remove("oculto")
})
document.getElementById("btnInstalar")?.addEventListener("click",async()=>{
const prompt=window.APP_STATE.deferredPrompt
if(!prompt)return
prompt.prompt()
await prompt.userChoice
window.APP_STATE.deferredPrompt=null
document.getElementById("btnInstalar")?.classList.add("oculto")
})
}

function registrarServiceWorker(){
if("serviceWorker" in navigator){
navigator.serviceWorker.register("./service-worker.js").catch(()=>{})
}
}
