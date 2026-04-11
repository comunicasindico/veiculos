/* ====================================================
010 – LOGIN SISTEMA (CORRIGIDO)
==================================================== */
async function login(){
const usuario=document.getElementById("loginUsuario")?.value?.trim().toLowerCase()
const senha=document.getElementById("loginSenha")?.value?.trim()
const msg=document.getElementById("msgLogin")

if(!usuario||!senha){
if(msg)msg.innerText="Informe usuário e senha"
return
}

if(!window.db){
if(msg)msg.innerText="Sistema carregando..."
return
}

const{data,error}=await db.from("usuarios").select("*").eq("usuario_apelido",usuario).single()

if(error||!data){
if(msg)msg.innerText="Usuário não encontrado"
return
}

if(data.senha_hash!==senha){
if(msg)msg.innerText="Senha incorreta"
return
}

/* LOGIN OK */
localStorage.setItem("usuario_id",data.id)
localStorage.setItem("empresa_id",data.empresa_id)
localStorage.setItem("usuario_nome",data.nome||"")
localStorage.setItem("tipo_usuario",data.perfil==="admin"?"admin":"motorista")
localStorage.setItem("primeiro_login",data.primeiro_login?"1":"0")
localStorage.setItem("login_time",Date.now())
/* 🔥 RELOAD LIMPO */
window.location.href=window.location.pathname
}
