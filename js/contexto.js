/* ====================================================001 – CONTEXTO GLOBAL==================================================== */
function carregarContexto(){
const usuario_id=localStorage.getItem("usuario_id")
const empresa_id=localStorage.getItem("empresa_id")
const tipo=localStorage.getItem("tipo_usuario")

if(!usuario_id)return

window.CONTEXTO={
usuario_id:usuario_id,
empresa_id:empresa_id,
tipo:tipo,
isAdmin:tipo==="admin"
}

console.log("CONTEXTO RESTAURADO:",window.CONTEXTO)
}
/* ====================================================030 – CONTEXTO GLOBAL==================================================== */
window.CONTEXTO={
usuario_id:localStorage.getItem("usuario_id"),
empresa_id:localStorage.getItem("empresa_id"),
tipo:localStorage.getItem("tipo_usuario"),
isAdmin:localStorage.getItem("tipo_usuario")==="admin"
};
console.log("CONTEXTO CARREGADO:",window.CONTEXTO);
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
