/* ====================================================
060 – DONO DO REGISTRO
==================================================== */
function getUsuarioDono(){
const tipo=localStorage.getItem("tipo_usuario")
const usuarioId=localStorage.getItem("usuario_id")
if(tipo==="admin"){
return document.getElementById("usuarioSelecionadoAdmin")?.value||usuarioId
}
return usuarioId
}
window.getUsuarioDono=getUsuarioDono
