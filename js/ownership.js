/* ====================================================060 – DONO DO REGISTRO==================================================== */
function getUsuarioDono(){

/* 🔒 GARANTE CONTEXTO */
const ctx=window.CONTEXTO

if(!ctx||!ctx.usuario_id){
console.warn("Sem contexto de usuário")
return null
}

/* 👑 ADMIN */
if(ctx.isAdmin){

const select=document.getElementById("usuarioSelecionadoAdmin")

/* 🔥 SELEÇÃO MANUAL */
if(select && select.value){
return select.value
}

/* 🔥 FALLBACK */
return ctx.usuario_id

}

/* 👤 MOTORISTA */
return ctx.usuario_id

}

/* ====================================================061 – EXPORT==================================================== */
window.getUsuarioDono=getUsuarioDono
