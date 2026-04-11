document.addEventListener("DOMContentLoaded",iniciarApp)

/* ====================================================001 – INICIAR APP==================================================== */
async function iniciarApp(){
carregarContexto()

const app=document.getElementById("app")
const login=document.getElementById("telaLogin")

app.style.display="none"
login.style.display="none"

let usuarioId=localStorage.getItem("usuario_id")
const tempoLogin=localStorage.getItem("login_time")

if(tempoLogin&&Date.now()-parseInt(tempoLogin)>1000*60*60*8){
localStorage.clear()
usuarioId=null
}

if(!usuarioId){
login.style.display="flex"
return
}

login.style.display="none"
app.style.display="block"
document.body.classList.add("logado")

window.CONTEXTO={
usuario_id:usuarioId,
empresa_id:localStorage.getItem("empresa_id"),
tipo:localStorage.getItem("tipo_usuario")||"motorista",
isAdmin:String(localStorage.getItem("tipo_usuario")).toLowerCase()==="admin"
}

await carregarDados()

if(!window.APP_STATE||!window.APP_STATE.veiculos){
console.warn("Dados não carregados")
return
}

configurarMenus()
renderTudo()
atualizarTopo()
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

if(window.CONTEXTO&&!window.CONTEXTO.isAdmin){
const uid=String(window.CONTEXTO.usuario_id||"")
v=v.filter(x=>String(x.usuario_id)===uid)
const ids=v.map(x=>String(x.id))
a=a.filter(x=>ids.includes(String(x.veiculo_id)))
m=m.filter(x=>String(x.id)===uid)
}

window.APP_STATE.veiculos=v
window.APP_STATE.motoristas=m
window.APP_STATE.abastecimentos=a

console.log("USER:",window.CONTEXTO?.usuario_id)
console.log("VEICULOS:",v.length)
console.log("ABAST:",a.length)

}catch(e){
console.error("Erro Supabase:",e)
carregarDadosLocal()
}
}

/* ====================================================006 – LOCAL STORAGE==================================================== */
function carregarDadosLocal(){
const keys=window.APP_STORAGE_KEYS
let v=JSON.parse(localStorage.getItem(keys.veiculos)||"[]")
let m=JSON.parse(localStorage.getItem(keys.motoristas)||"[]")
let a=JSON.parse(localStorage.getItem(keys.abastecimentos)||"[]")

if(window.CONTEXTO&&!window.CONTEXTO.isAdmin){
const uid=String(window.CONTEXTO.usuario_id)
v=v.filter(x=>String(x.usuario_id)===uid)
m=m.filter(x=>String(x.usuario_id)===uid)
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
if(!confirm("Deseja realmente sair do sistema?"))return

/* 🔥 LIMPA SESSÃO */
localStorage.clear()

/* 🔒 REMOVE ESTADOS */
document.body.classList.remove("logado")

/* 🔒 ESCONDE APP */
const app=document.getElementById("app")
if(app)app.style.display="none"

/* 🔓 MOSTRA LOGIN */
const login=document.getElementById("telaLogin")
if(login)login.style.display="flex"

/* 🔥 LIMPA CAMPOS */
const u=document.getElementById("loginUsuario")
const s=document.getElementById("loginSenha")
if(u)u.value=""
if(s)s.value=""

/* 🔥 FORÇA RESET TOTAL (ANTI CACHE) */
setTimeout(()=>{
location.href=location.pathname+"?logout="+Date.now()
},100)
}
/* ====================================================012 – LOADER==================================================== */
function mostrarLoader(){document.getElementById("loaderGlobal").style.display="flex"}
function esconderLoader(){document.getElementById("loaderGlobal").style.display="none"}
