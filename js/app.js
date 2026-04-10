document.addEventListener("DOMContentLoaded",iniciarApp)
async function iniciarApp(){
const usuarioId=localStorage.getItem("usuario_id")
if(!usuarioId){
document.getElementById("app").style.display="none"
document.getElementById("telaLogin").style.display="flex"
return
}
document.getElementById("telaLogin").style.display="none"
document.getElementById("app").style.display="block"
/* 🔥 CARREGAMENTO NORMAL */
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
window.renderizarDashboard?.()
atualizarDashboard()
window.atualizarDashboardInteligente?.()
/* 🔥 FORÇAR PAINEL CORRETO */
const paineis=document.querySelectorAll(".painel")
const botoes=document.querySelectorAll(".card-menu")

botoes.forEach(b=>b.classList.remove("ativo"))
paineis.forEach(p=>{p.classList.remove("ativo");p.style.display="none"})

if(window.CONTEXTO?.isAdmin){
const alvo=document.getElementById("painelVeiculos")
const btn=[...botoes].find(b=>b.dataset.target==="painelVeiculos")
if(btn)btn.classList.add("ativo")
if(alvo){alvo.classList.add("ativo");alvo.style.display="block"}
}else{
const alvo=document.getElementById("painelAbastecimentos")
const btn=[...botoes].find(b=>b.dataset.target==="painelAbastecimentos")
if(btn)btn.classList.add("ativo")
if(alvo){alvo.classList.add("ativo");alvo.style.display="block"}
}
document.getElementById("btnLogout")?.addEventListener("click",logout)
}
/* ====================================================LOAD DADOS==================================================== */
async function carregarDados(){
if(window.db){
try{
const[{data:veiculos},{data:motoristas},{data:abastecimentos}]=await Promise.all([
window.db.from("veiculos").select("*").order("created_at",{ascending:false}),
window.db.from("motoristas").select("*").order("created_at",{ascending:false}),
window.db.from("abastecimentos").select("*").order("data_abastecimento",{ascending:false})
])
let v=veiculos||[]
let m=motoristas||[]
let a=abastecimentos||[]
/* 🔥 FILTRO CENTRAL */
if(!window.CONTEXTO.isAdmin){
v=v.filter(x=>String(x.empresa_id)===String(window.CONTEXTO.empresa_id))
m=m.filter(x=>String(x.empresa_id)===String(window.CONTEXTO.empresa_id))
a=a.filter(x=>String(x.empresa_id)===String(window.CONTEXTO.empresa_id))
}
window.APP_STATE.veiculos=v
window.APP_STATE.motoristas=m
window.APP_STATE.abastecimentos=a
return
}catch(e){console.error("Erro ao carregar Supabase",e)}
}
carregarDadosLocal()
}
/* ====================================================LOCAL==================================================== */
function carregarDadosLocal(){
const keys=window.APP_STORAGE_KEYS
let v=JSON.parse(localStorage.getItem(keys.veiculos)||"[]")
let m=JSON.parse(localStorage.getItem(keys.motoristas)||"[]")
let a=JSON.parse(localStorage.getItem(keys.abastecimentos)||"[]")
if(!window.CONTEXTO.isAdmin){
v=v.filter(x=>String(x.usuario_id)===String(window.CONTEXTO.usuario_id))
m=m.filter(x=>String(x.usuario_id)===String(window.CONTEXTO.usuario_id))
const ids=v.map(x=>String(x.id))
a=a.filter(x=>ids.includes(String(x.veiculo_id)))
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
/* ====================================================MENUS==================================================== */
function configurarMenus(){
const botoes=document.querySelectorAll(".card-menu")
const paineis=document.querySelectorAll(".painel")
botoes.forEach(btn=>{
btn.addEventListener("click",()=>{
botoes.forEach(b=>b.classList.remove("ativo"))
paineis.forEach(p=>{p.classList.remove("ativo");p.style.display="none"})
btn.classList.add("ativo")
const alvo=document.getElementById(btn.dataset.target)
if(alvo){alvo.classList.add("ativo");alvo.style.display="block"}
})
})
paineis.forEach((p,i)=>{p.style.display=i===0?"block":"none"})
}
function definirCamposIniciais(){
const input=document.getElementById("dataAbastecimento")
if(input&&!input.value)input.value=window.Utils.agoraInputDateTime()
}
/* ====================================================DASHBOARD==================================================== */
function atualizarDashboard(){
const elV=document.getElementById("kpiVeiculos")
const elA=document.getElementById("kpiAbastecimentos")
const elL=document.getElementById("kpiAlertas")
if(elV)elV.textContent=window.APP_STATE.veiculos.length
if(elA)elA.textContent=window.APP_STATE.abastecimentos.length
if(elL)elL.textContent=window.gerarAlertas?window.gerarAlertas().length:0
}
window.atualizarDashboard=atualizarDashboard
/* ====================================================TOAST==================================================== */
function toast(msg){
const el=document.getElementById("toast")
if(!el)return
el.textContent=msg
el.classList.add("show")
clearTimeout(window.__toastTimer)
window.__toastTimer=setTimeout(()=>el.classList.remove("show"),2500)
}
window.toast=toast
/* ====================================================PWA==================================================== */
function configurarInstalacaoPWA(){
window.addEventListener("beforeinstallprompt",e=>{
e.preventDefault()
window.APP_STATE.deferredPrompt=e
document.getElementById("btnInstalar")?.classList.remove("oculto")
})
}
function registrarServiceWorker(){
if("serviceWorker"in navigator){navigator.serviceWorker.register("./service-worker.js").catch(()=>{})}
}
/* ====================================================999 – LOGOUT==================================================== */
function logout(){
localStorage.clear()
sessionStorage.clear()
window.location.href=window.location.pathname
}
