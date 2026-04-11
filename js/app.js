document.addEventListener("DOMContentLoaded",iniciarApp)

/* ====================================================001 – INICIAR APP (LIMPO)==================================================== */
async function iniciarApp(){
carregarContexto()
const app=document.getElementById("app")
const login=document.getElementById("telaLogin")
let usuarioId=localStorage.getItem("usuario_id")
const tempoLogin=localStorage.getItem("login_time")
/* 🔒 EXPIRAÇÃO AUTOMÁTICA */
if(tempoLogin&&Date.now()-parseInt(tempoLogin)>1000*60*60*8){
localStorage.clear()
usuarioId=null
}
/* 🔐 SEM LOGIN */
if(!usuarioId){
document.body.classList.remove("logado")
if(app)app.style.display="none"
if(login)login.style.display="flex"
return
}
/* 🔓 COM LOGIN */
document.body.classList.add("logado")
if(login)login.style.display="none"
if(app)app.style.display="block"
/* 🔥 CONTEXTO */
window.CONTEXTO={
usuario_id:usuarioId,
empresa_id:localStorage.getItem("empresa_id"),
tipo:localStorage.getItem("tipo_usuario")||"motorista",
isAdmin:String(localStorage.getItem("tipo_usuario")).toLowerCase()==="admin"
}
/* 🔥 DADOS */
await carregarDados()

if(!window.APP_STATE||!window.APP_STATE.veiculos){
console.warn("Dados não carregados")
return
}
/* 🔥 UI */
configurarMenus()
/* 🔥 FORÇA DASHBOARD + KPIs */
renderTudo()
atualizarDashboard()
window.atualizarDashboardInteligente?.()
/* 🔥 TOPO */
atualizarTopo()
/* 🔥 CAMPOS */
definirCamposIniciais()
}
/* ====================================================002 – RENDER GLOBAL==================================================== */
function renderTudo(){
if(typeof renderResumo==="function")renderResumo()
if(typeof renderVeiculos==="function")renderVeiculos()
if(typeof renderAbastecimentos==="function")renderAbastecimentos()
if(typeof renderMotoristas==="function")renderMotoristas()
if(typeof renderAlertas==="function")renderAlertas()
if(typeof renderRelatorios==="function")renderRelatorios()
if(typeof atualizarDashboard==="function")atualizarDashboard()
if(typeof atualizarDashboardInteligente==="function")atualizarDashboardInteligente()
}
/* ====================================================003 – TOPO USUARIO==================================================== */
function atualizarTopo(){
const nome=localStorage.getItem("usuario_nome")||""
const tipo=localStorage.getItem("tipo_usuario")||"motorista"

const elNome=document.getElementById("usuarioLogado")
const elTipo=document.getElementById("tipoUsuario")
const elEscopo=document.getElementById("escopoUsuario")
const elInfo=document.getElementById("infoUsuario")

if(elNome)elNome.innerText=nome
if(elTipo)elTipo.innerText=tipo==="admin"?"Administrador":"Motorista"
if(elEscopo)elEscopo.innerText=tipo==="admin"?"Acesso total":"Apenas seu veículo"
if(elInfo)elInfo.innerText=nome+" • "+(tipo==="admin"?"Administrador":"Motorista")

if(tipo==="admin"){
document.body.classList.add("admin")
}else{
document.body.classList.remove("admin")
}
}
/* ====================================================004 – CONTEXTO==================================================== */
function isAdmin(){return localStorage.getItem("tipo_usuario")==="admin"}
function getUsuarioId(){return localStorage.getItem("usuario_id")}
function getEmpresaId(){return localStorage.getItem("empresa_id")}
/* ====================================================005 – LOAD DADOS==================================================== */
async function carregarDados(){
if(!window.db){
console.error("❌ SUPABASE NÃO INICIALIZADO")
return
}
try{
const[{data:veiculos},{data:motoristas},{data:abastecimentos}]=await Promise.all([
window.db.from("veiculos").select("*").order("created_at",{ascending:false}),
window.db.from("motoristas").select("*").order("created_at",{ascending:false}),
window.db.from("abastecimentos").select("*").order("data_abastecimento",{ascending:false})
])
let v=veiculos||[]
let m=motoristas||[]
let a=abastecimentos||[]
/* ====================================================FILTRO CORRETO==================================================== */
if(window.CONTEXTO && !window.CONTEXTO.isAdmin){
const uid=String(window.CONTEXTO.usuario_id)
/* 🚗 VEÍCULOS → FILTRA PELO DONO */
v=v.filter(x=>String(x.usuario_id)===uid)
/* ⛽ ABASTECIMENTOS → SOMENTE DOS VEÍCULOS DO USUÁRIO */
const ids=v.map(x=>String(x.id))
a=a.filter(x=>ids.includes(String(x.veiculo_id)))
/* 👤 MOTORISTA → PELO ID DO USUÁRIO */
m=m.filter(x=>String(x.id)===uid)
}
/* ====================================================SALVA ESTADO==================================================== */
window.APP_STATE.veiculos=v
window.APP_STATE.motoristas=m
window.APP_STATE.abastecimentos=a

/* 🔥 DEBUG */
console.log("🔥 VEICULOS DO BANCO:",veiculos)
console.log("🔥 MOTORISTAS DO BANCO:",motoristas)
console.log("🔥 ABASTECIMENTOS DO BANCO:",abastecimentos)
console.log("USER:",window.CONTEXTO?.usuario_id)
console.log("VEICULOS FILTRADOS:",v.length)
console.log("ABAST FILTRADOS:",a.length)

return

}catch(e){

console.error("❌ ERRO SUPABASE:",e)

/* 🔥 NÃO USAR LOCAL STORAGE */
window.APP_STATE.veiculos=[]
window.APP_STATE.motoristas=[]
window.APP_STATE.abastecimentos=[]
}
}
/* ====================================================007 – MENU==================================================== */
function configurarMenus(){
const botoes=document.querySelectorAll(".card-menu")
const paineis=document.querySelectorAll(".painel")

const salvo=localStorage.getItem("painelAtual")

if(salvo){
botoes.forEach(b=>b.classList.remove("ativo"))
document.querySelector(`[data-target="${salvo}"]`)?.classList.add("ativo")
paineis.forEach(p=>p.classList.remove("ativo"))
document.getElementById(salvo)?.classList.add("ativo")
}

botoes.forEach(btn=>{
btn.onclick=()=>{
const alvo=btn.dataset.target
localStorage.setItem("painelAtual",alvo)
botoes.forEach(b=>b.classList.remove("ativo"))
btn.classList.add("ativo")
paineis.forEach(p=>p.classList.remove("ativo"))
setTimeout(()=>{
document.getElementById(alvo)?.classList.add("ativo")
},120)
}
})
}

/* ====================================================008 – CAMPOS==================================================== */
function definirCamposIniciais(){
const input=document.getElementById("dataAbastecimento")
if(input&&!input.value){
const agora=new Date()
const iso=new Date(agora.getTime()-agora.getTimezoneOffset()*60000).toISOString().slice(0,16)
input.value=iso
}
}

/* ====================================================009 – DASHBOARD==================================================== */
function atualizarDashboard(){
let v=window.APP_STATE.veiculos||[]
let m=window.APP_STATE.motoristas||[]
let a=window.APP_STATE.abastecimentos||[]

const elV=document.getElementById("kpiVeiculos")
const elM=document.getElementById("kpiMotoristas")
const elA=document.getElementById("kpiAbastecimentos")
const elC=document.getElementById("kpiCustoTotal")

if(elV)elV.textContent=v.length
if(elM)elM.textContent=window.CONTEXTO.isAdmin?m.length:1
if(elA)elA.textContent=a.length

if(elC){
const total=a.reduce((s,x)=>s+Number(x.valor_total||0),0)
elC.textContent=total.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})
}
}

/* ====================================================010 – TOAST==================================================== */
function toast(msg,erro=false){
const t=document.getElementById("toast")
if(!t)return
t.innerText=msg
t.style.background=erro?"#ef4444":"#22c55e"
t.style.display="block"
setTimeout(()=>t.style.display="none",3000)
}
window.toast=toast

/* ====================================================011 – LOGOUT==================================================== */
function logoutConfirm(){

localStorage.clear()

document.body.classList.remove("logado")

const app=document.getElementById("app")
const login=document.getElementById("telaLogin")

if(app)app.style.display="none"
if(login)login.style.display="flex"

}
/* ====================================================012 FUNCTION RENDER RESUMO==================================================== */
function renderResumo(){

const v=window.APP_STATE.veiculos||[]
const m=window.APP_STATE.motoristas||[]
const a=window.APP_STATE.abastecimentos||[]

const el=document.getElementById("resumoRapido")
if(!el)return

let ultimo=null

if(a.length>0){
a.sort((x,y)=>new Date(y.data_abastecimento)-new Date(x.data_abastecimento))
ultimo=a[0]
}
/* 🔥 STRING SEGURA */
let texto=""
texto+="Total de veículos: "+v.length+"<br>"
texto+="Total de motoristas: "+(window.CONTEXTO?.isAdmin?m.length:1)+"<br>"
texto+="Total de abastecimentos: "+a.length+"<br>"
texto+="Último abastecimento: "+(ultimo?new Date(ultimo.data_abastecimento).toLocaleString():"-")

el.innerHTML=texto
}
/* ====================================================012 – LOADER==================================================== */
function mostrarLoader(){
document.getElementById("loaderGlobal").style.display="flex"
}
function esconderLoader(){
document.getElementById("loaderGlobal").style.display="none"
}
