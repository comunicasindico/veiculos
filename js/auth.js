/* ====================================================
020 – TROCA DE SENHA (PRIMEIRO LOGIN)
==================================================== */
function abrirTrocaSenha(){
const modal=document.getElementById("modalSenha")
if(modal)modal.style.display="flex"
}
async function salvarNovaSenha(){
const senha=document.getElementById("novaSenha")?.value?.trim()
const usuarioId=localStorage.getItem("usuario_id")
if(!senha||senha.length<4){
alert("Senha deve ter pelo menos 4 caracteres")
return
}
await db.from("usuarios").update({
senha_hash:senha,
primeiro_login:false
}).eq("id",usuarioId)
document.getElementById("modalSenha").style.display="none"
alert("Senha atualizada com sucesso")
}
/* ====================================================
021 – LOGOUT
==================================================== */
function logout(){
localStorage.clear()
location.reload()
}
