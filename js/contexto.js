/* ====================================================
030 – CONTEXTO DE USUÁRIO (ADMIN X MOTORISTA)
==================================================== */
function aplicarContextoUsuario(){
const tipo=localStorage.getItem("tipo_usuario")||"motorista"
const tipoEl=document.getElementById("tipoUsuario")
const escopoEl=document.getElementById("escopoUsuario")
const titulo=document.getElementById("tituloPainel")
const desc=document.getElementById("descricaoPainel")
if(tipo==="admin"){
if(tipoEl)tipoEl.innerText="Administrador"
if(escopoEl)escopoEl.innerText="Todos os clientes"
if(titulo)titulo.innerText="Central de Clientes"
if(desc)desc.innerText="Visão completa de todos os veículos"
}else{
if(tipoEl)tipoEl.innerText="Motorista"
if(escopoEl)escopoEl.innerText="Apenas seu veículo"
if(titulo)titulo.innerText="Meu Veículo"
if(desc)desc.innerText="Controle completo do seu veículo"
document.querySelectorAll(".admin-only").forEach(el=>el.style.display="none")
}
}
document.addEventListener("DOMContentLoaded",aplicarContextoUsuario)
