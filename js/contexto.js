/* ====================================================001 – CARREGAR CONTEXTO==================================================== */
function carregarContexto(){

const usuario_id=localStorage.getItem("usuario_id")
const empresa_id=localStorage.getItem("empresa_id")
const tipo=localStorage.getItem("tipo_usuario")

/* 🔒 SEM LOGIN */
if(!usuario_id){
window.CONTEXTO=null
return
}

/* 🔥 CONTEXTO ÚNICO */
window.CONTEXTO={
usuario_id:usuario_id,
empresa_id:empresa_id,
tipo:tipo||"motorista",
isAdmin:(tipo||"").toLowerCase()==="admin"
}

console.log("CONTEXTO ATIVO:",window.CONTEXTO)

}

/* ====================================================002 – APLICAR CONTEXTO VISUAL==================================================== */
function aplicarContextoUsuario(){

if(!window.CONTEXTO)return

const tipoEl=document.getElementById("tipoUsuario")
const escopoEl=document.getElementById("escopoUsuario")
const titulo=document.getElementById("tituloPainel")
const desc=document.getElementById("descricaoPainel")

/* 👑 ADMIN */
if(window.CONTEXTO.isAdmin){

if(tipoEl)tipoEl.innerText="Administrador"
if(escopoEl)escopoEl.innerText="Todos os clientes"
if(titulo)titulo.innerText="Central de Clientes"
if(desc)desc.innerText="Visão completa dos veículos"

document.body.classList.add("admin")

}

/* 👤 MOTORISTA */
else{

if(tipoEl)tipoEl.innerText="Motorista"
if(escopoEl)escopoEl.innerText="Apenas seu veículo"
if(titulo)titulo.innerText="Meu Veículo"
if(desc)desc.innerText="Controle do seu veículo"

document.body.classList.remove("admin")

/* 🔒 ESCONDE ADMIN */
document.querySelectorAll(".admin-only").forEach(el=>{
el.style.display="none"
})

}

}

/* ====================================================003 – INIT==================================================== */
document.addEventListener("DOMContentLoaded",()=>{
carregarContexto()
aplicarContextoUsuario()
})
