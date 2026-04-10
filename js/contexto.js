/* ====================================================030 – CONTEXTO GLOBAL==================================================== */
window.CONTEXTO={usuario_id:localStorage.getItem("usuario_id"),tipo:localStorage.getItem("tipo_usuario")||"motorista",isAdmin:localStorage.getItem("tipo_usuario")==="admin"}
/* ====================================================031 – APLICAR CONTEXTO VISUAL==================================================== */
function aplicarContextoUsuario(){
const tipoEl=document.getElementById("tipoUsuario")
const escopoEl=document.getElementById("escopoUsuario")
const titulo=document.getElementById("tituloPainel")
const desc=document.getElementById("descricaoPainel")
if(window.CONTEXTO.isAdmin){
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
