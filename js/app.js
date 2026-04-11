document.addEventListener("DOMContentLoaded",iniciarApp)
/* =============================================INICIAR APP ================================================== */
async function iniciarApp(){
carregarContexto()

const app=document.getElementById("app")
const login=document.getElementById("telaLogin")

/* 🔒 RESET VISUAL TOTAL */
app.style.display="none"
login.style.display="none"

/* 🔐 CONTROLE DE SESSÃO */
let usuarioId=localStorage.getItem("usuario_id")
const tempoLogin=localStorage.getItem("login_time")

/* 🔒 EXPIRAÇÃO AUTOMÁTICA (8H) */
if(tempoLogin&&Date.now()-parseInt(tempoLogin)>1000*60*60*8){
localStorage.clear()
usuarioId=null
}

/* 🔐 NÃO LOGADO → LOGIN */
if(!usuarioId){
login.style.display="flex"
return
}

/* 🔓 LIBERA APP */
login.style.display="none"
app.style.display="block"
document.body.classList.add("logado")

/* 🔥 GARANTE CONTEXTO */
window.CONTEXTO={
usuario_id:usuarioId,
empresa_id:localStorage.getItem("empresa_id"),
tipo:localStorage.getItem("tipo_usuario")||"motorista",
isAdmin:String(localStorage.getItem("tipo_usuario")).toLowerCase()==="admin"
}

/* 🔥 CARREGA DADOS */
await carregarDados()

/* 🔒 VALIDA DADOS */
if(!window.APP_STATE || !window.APP_STATE.veiculos){
console.warn("Dados ainda não carregados")
return
}

/* 🔥 INICIALIZA INTERFACE */
configurarMenus()
renderTudo()
atualizarTopo()
}
/* ====================================================999 – RENDER GLOBAL==================================================== */
function renderTudo(){
if(typeof renderResumo==="function")renderResumo()
if(typeof renderVeiculos==="function")renderVeiculos()
if(typeof renderAbastecimentos==="function")renderAbastecimentos()
if(typeof renderMotoristas==="function")renderMotoristas()
if(typeof renderAlertas==="function")renderAlertas()
if(typeof renderRelatorios==="function")renderRelatorios()
}
/* ====================================================USUARIO LOGADO==================================================== */
const nome=localStorage.getItem("usuario_nome")||""
const tipo=localStorage.getItem("tipo_usuario")||"motorista"
const elNome=document.getElementById("usuarioLogado")
const elTipo=document.getElementById("tipoUsuario")
const elEscopo=document.getElementById("escopoUsuario")
if(elNome)elNome.innerText=nome
if(elTipo)elTipo.innerText=tipo==="admin"?"Administrador":"Motorista"
if(elEscopo)elEscopo.innerText=tipo==="admin"?"Acesso total":"Apenas seu veículo"

/* 🔧 CONFIGURAÇÕES */
configurarMenus()
definirCamposIniciais()

/* 🔥 ATUALIZA DEPOIS DE TUDO */
setTimeout(()=>{
window.renderizarDashboard?.()
atualizarDashboard()
},50)

window.atualizarDashboardInteligente?.()

/* 🔥 FORÇAR PAINEL CORRETO */
const paineis=document.querySelectorAll(".painel")
const botoes=document.querySelectorAll(".card-menu")

botoes.forEach(b=>b.classList.remove("ativo"))
paineis.forEach(p=>{
p.classList.remove("ativo")
p.style.display="none"
})

if(window.CONTEXTO.isAdmin){

const alvo=document.getElementById("painelVeiculos")
const btn=[...botoes].find(b=>b.dataset.target==="painelVeiculos")

if(btn)btn.classList.add("ativo")
if(alvo){
alvo.classList.add("ativo")
alvo.style.display="block"
}

}else{

const alvo=document.getElementById("painelAbastecimentos")
const btn=[...botoes].find(b=>b.dataset.target==="painelAbastecimentos")

if(btn)btn.classList.add("ativo")
if(alvo){
alvo.classList.add("ativo")
alvo.style.display="block"
}

}

/* 🔓 BOTÃO SAIR */
const btnLogout=document.getElementById("btnLogout")
if(btnLogout){
btnLogout.onclick=logout
btnLogout.style.display="inline-block"
}

/* 🔒 ESCONDER ITENS ADMIN */
if(!window.CONTEXTO.isAdmin){
document.querySelectorAll(".admin-only").forEach(el=>{
el.style.display="none"
})
}
}
/* ====================================================010 – CONTEXTO USUARIO==================================================== */
function isAdmin(){
return localStorage.getItem("tipo_usuario")==="admin"
}
function getEmpresaId(){
return localStorage.getItem("empresa_id")
}
function getUsuarioId(){
return localStorage.getItem("usuario_id")
}
/* ====================================================LOAD DADOS (CORRIGIDO)==================================================== */
async function carregarDados(){
if(!window.db){carregarDadosLocal();return}
try{
const[{data:veiculos},{data:motoristas},{data:abastecimentos}]=await Promise.all([
window.db.from("veiculos").select("*").order("created_at",{ascending:false}),
window.db.from("motoristas").select("*").order("created_at",{ascending:false}),
window.db.from("abastecimentos").select("*").order("data_abastecimento",{ascending:false})
])
let v=veiculos||[]
let m=motoristas||[]
let a=abastecimentos||[]
/* ====================================================FILTRO USUARIO==================================================== */
if(window.CONTEXTO && !window.CONTEXTO.isAdmin){
const uid=String(window.CONTEXTO.usuario_id||"")
/* 🚗 VEÍCULOS */
v=v.filter(x=>String(x.usuario_id)===uid)
/* ⛽ ABASTECIMENTOS */
const ids=v.map(x=>String(x.id))
a=a.filter(x=>ids.includes(String(x.veiculo_id)))
/* 👤 MOTORISTA */
m=m.filter(x=>String(x.id)===uid)
}
/* ====================================================SALVA ESTADO==================================================== */
window.APP_STATE.veiculos=v
window.APP_STATE.motoristas=m
window.APP_STATE.abastecimentos=a
/* ====================================================LOG DEBUG LIMPO==================================================== */
console.log("USER:",window.CONTEXTO?.usuario_id)
console.log("VEICULOS:",v.length)
console.log("ABAST:",a.length)
return
}catch(e){
console.error("Erro Supabase:",e)
}
carregarDadosLocal()
}
/* ====================================================LOCAL==================================================== */
function carregarDadosLocal(){
const keys=window.APP_STORAGE_KEYS
let v=JSON.parse(localStorage.getItem(keys.veiculos)||"[]")
let m=JSON.parse(localStorage.getItem(keys.motoristas)||"[]")
let a=JSON.parse(localStorage.getItem(keys.abastecimentos)||"[]")
if(window.CONTEXTO && !window.CONTEXTO.isAdmin){
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
/* ====================================================901 – MENU PREMIUM==================================================== */
function configurarMenus(){
const botoes=document.querySelectorAll(".card-menu")
const paineis=document.querySelectorAll(".painel")

const salvo=localStorage.getItem("painelAtual")

if(salvo){
botoes.forEach(b=>b.classList.remove("ativo"))
const btn=document.querySelector(`[data-target="${salvo}"]`)
if(btn)btn.classList.add("ativo")
paineis.forEach(p=>p.classList.remove("ativo"))
const el=document.getElementById(salvo)
if(el)el.classList.add("ativo")
}

botoes.forEach(btn=>{
btn.onclick=()=>{
const alvo=btn.dataset.target
localStorage.setItem("painelAtual",alvo)

botoes.forEach(b=>b.classList.remove("ativo"))
btn.classList.add("ativo")

paineis.forEach(p=>p.classList.remove("ativo"))

setTimeout(()=>{
const el=document.getElementById(alvo)
if(el)el.classList.add("ativo")
},120)
}
})
}
/* ===================================================campos iniciais=================================================== */
function definirCamposIniciais(){
const input=document.getElementById("dataAbastecimento")
if(input&&!input.value){
const agora=new Date()
const iso=new Date(agora.getTime()-agora.getTimezoneOffset()*60000).toISOString().slice(0,16)
input.value=iso
}
}
/* ====================================================DASHBOARD CORRIGIDO==================================================== */
function atualizarDashboard(){

let v=window.APP_STATE.veiculos||[]
let m=window.APP_STATE.motoristas||[]
let a=window.APP_STATE.abastecimentos||[]

const elV=document.getElementById("kpiVeiculos")
const elM=document.getElementById("kpiMotoristas")
const elA=document.getElementById("kpiAbastecimentos")
const elL=document.getElementById("kpiAlertas")
const elC=document.getElementById("kpiCustoTotal")
const elConsumo=document.getElementById("kpiConsumo")

/* 🔥 ADMIN */
if(window.CONTEXTO.isAdmin){

if(elV)elV.textContent=v.length
if(elM)elM.textContent=m.length
if(elA)elA.textContent=a.length

}

/* 👤 USUÁRIO */
else{

if(elV)elV.textContent=v.length
if(elM)elM.textContent=1
if(elA)elA.textContent=a.length

}

/* 💰 TOTAL */
if(elC){
const total=a.reduce((s,x)=>s+Number(x.valor_total||0),0)
elC.textContent=total.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})
}

/* ⛽ CONSUMO */
if(elConsumo){
let km=0
let litros=0
a.forEach(x=>{
km+=Number(x.quilometragem||0)
litros+=Number(x.litros||0)
})
const media=litros?km/litros:0
elConsumo.textContent=media.toFixed(1)+" km/l"
}

/* 🚨 ALERTAS */
if(elL){
elL.textContent=window.gerarAlertas?window.gerarAlertas().length:0
}

}
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
/* ====================================================900 – INFO USUARIO==================================================== */
function atualizarTopo(){
const nome=localStorage.getItem("usuario_nome")||""
const tipo=localStorage.getItem("tipo_usuario")||"motorista"
const el=document.getElementById("infoUsuario")
if(el){
el.innerText=nome+" • "+(tipo==="admin"?"Administrador":"Motorista")
}
if(tipo==="admin")document.body.classList.add("admin")
}
/* ====================================================999 – LOGOUT==================================================== */
function logoutConfirm(){
if(confirm("Deseja realmente sair do sistema?")){
localStorage.clear()
location.reload()
}
}
/* ====================================================950 – UX GLOBAL==================================================== */
function mostrarLoader(){document.getElementById("loaderGlobal").style.display="flex"}
function esconderLoader(){document.getElementById("loaderGlobal").style.display="none"}
function toast(msg,erro=false){
const t=document.getElementById("toast")
t.innerText=msg
t.style.background=erro?"#ef4444":"#22c55e"
t.style.display="block"
setTimeout(()=>t.style.display="none",3000)
}
configurarMenus()
carregarDados()
