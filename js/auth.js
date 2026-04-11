/* ====================================================020 – TROCA DE SENHA==================================================== */
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

const {error}=await db.from("usuarios").update({
senha_hash:senha,
primeiro_login:false
}).eq("id",usuarioId)

if(error){
console.error(error)
alert("Erro ao atualizar senha")
return
}

const modal=document.getElementById("modalSenha")
if(modal)modal.style.display="none"

alert("Senha atualizada com sucesso")

}

/* ====================================================021 – LOGOUT FINAL==================================================== */
function logout(){

/* 🔥 LIMPA TUDO */
localStorage.clear()
sessionStorage.clear()

/* 🔥 LIMPA ESTADO GLOBAL */
window.CONTEXTO=null
window.APP_STATE={}

/* 🔒 RESET VISUAL */
document.body.classList.remove("logado")

const app=document.getElementById("app")
const login=document.getElementById("telaLogin")

if(app)app.style.display="none"
if(login)login.style.display="flex"

/* 🔥 LIMPA CAMPOS */
const u=document.getElementById("loginUsuario")
const s=document.getElementById("loginSenha")

if(u)u.value=""
if(s)s.value=""

}

/* ====================================================022 – INIT==================================================== */
document.addEventListener("DOMContentLoaded",()=>{
document.getElementById("btnLogout")?.addEventListener("click",logout)
})
