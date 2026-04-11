(function(){

/* ====================================================001 – INIT==================================================== */
const form=document.getElementById("formMotorista")
const busca=document.getElementById("buscaMotorista")

form?.addEventListener("submit",salvarMotorista)
busca?.addEventListener("input",renderizarMotoristas)

/* ====================================================002 – SALVAR==================================================== */
async function salvarMotorista(e){
e.preventDefault()

const nome=document.getElementById("nomeMotorista")?.value?.trim()

if(!nome){
window.toast("Informe o nome")
return
}

const item={
empresa_id:window.CONTEXTO?.empresa_id,
usuario_id:window.CONTEXTO?.isAdmin
?document.getElementById("usuarioSelecionadoAdmin")?.value
:window.CONTEXTO?.usuario_id,
nome:nome,
cpf:document.getElementById("cpfMotorista")?.value||"",
numero_cnh:document.getElementById("numeroCnh")?.value||"",
categoria_cnh:document.getElementById("categoriaCnh")?.value||"",
validade_cnh:document.getElementById("validadeCnh")?.value||null,
telefone:document.getElementById("telefoneMotorista")?.value||"",
email:document.getElementById("emailMotorista")?.value||"",
veiculo_principal_id:document.getElementById("veiculoPrincipalMotorista")?.value||null,
observacoes:document.getElementById("observacoesMotorista")?.value||"",
created_at:new Date().toISOString()
}

/* 🔥 DB */
if(window.db){

const {data,error}=await window.db.from("motoristas").insert(item).select().single()

if(error){
console.error(error)
window.toast("Erro ao salvar")
return
}

window.APP_STATE.motoristas.unshift(data)

}else{

item.id=Date.now().toString()
window.APP_STATE.motoristas.unshift(item)
window.salvarDadosLocal()

}

/* 🔥 RESET */
form?.reset()

renderizarMotoristas()
window.renderizarAlertas?.()
window.atualizarDashboard?.()

window.toast("Motorista salvo")

}

/* ====================================================003 – RENDER==================================================== */
function renderizarMotoristas(){

const box=document.getElementById("listaMotoristas")
if(!box)return

const termo=(document.getElementById("buscaMotorista")?.value||"").toLowerCase()

const lista=(window.APP_STATE.motoristas||[]).filter(m=>{

if(!m)return false

/* 🔐 CONTEXTO */
if(!window.CONTEXTO?.isAdmin && String(m.usuario_id)!==String(window.CONTEXTO.usuario_id)){
return false
}

if(!termo)return true

return (m.nome||"").toLowerCase().includes(termo)

})

if(!lista.length){
box.className="lista-vazia"
box.textContent="Nenhum motorista"
return
}

box.className=""

box.innerHTML=lista.map(m=>{

const v=window.APP_STATE.veiculos.find(x=>x.id===m.veiculo_principal_id)

return `
<div class="item-lista">
<div class="item-lista-topo">
<h4>${m.nome}</h4>
<div>
<button class="btn btn-secundario" onclick="removerMotorista('${m.id}')">Excluir</button>
</div>
</div>

<div>
${m.categoria_cnh?`<span class="tag">CNH ${m.categoria_cnh}</span>`:""}
${m.validade_cnh?`<span class="tag ${classificarValidade(m.validade_cnh)}">Validade ${window.Utils.formatarData(m.validade_cnh)}</span>`:""}
${v?`<span class="tag">${v.placa}</span>`:""}
</div>

<div class="mini">CPF: ${m.cpf||"-"} • CNH: ${m.numero_cnh||"-"}</div>
<div class="mini">Telefone: ${m.telefone||"-"} • Email: ${m.email||"-"}</div>

${m.observacoes?`<div class="mini">Obs: ${m.observacoes}</div>`:""}

</div>
`

}).join("")

}

/* ====================================================004 – VALIDADE==================================================== */
function classificarValidade(data){
const dias=window.Utils.diasPara(data)
if(dias===null)return""
if(dias<0)return"danger"
if(dias<=30)return"warn"
return"ok"
}

/* ====================================================005 – SELECT==================================================== */
function atualizarSelectMotoristas(){

const select=document.getElementById("motoristaAbastecimento")
if(!select)return

const lista=(window.APP_STATE.motoristas||[]).filter(m=>{
return window.CONTEXTO?.isAdmin || String(m.usuario_id)===String(window.CONTEXTO.usuario_id)
})

select.innerHTML='<option value="">Selecione</option>'+
lista.map(m=>`<option value="${m.id}">${m.nome}</option>`).join("")

}

/* ====================================================006 – REMOVER==================================================== */
window.removerMotorista=async function(id){

if(!confirm("Excluir motorista?"))return

const registro=window.APP_STATE.motoristas.find(m=>String(m.id)===String(id))
if(!registro)return

/* 🔐 SEGURANÇA */
if(!window.CONTEXTO?.isAdmin &&
String(registro.usuario_id)!==String(window.CONTEXTO.usuario_id)){
window.toast("Não permitido")
return
}

/* 🔥 DB */
if(window.db){

const {error}=await window.db.from("motoristas").delete().eq("id",id)

if(error){
console.error(error)
window.toast("Erro ao excluir")
return
}

}else{
window.salvarDadosLocal()
}

window.APP_STATE.motoristas=
window.APP_STATE.motoristas.filter(m=>m.id!==id)

renderizarMotoristas()
window.renderizarAlertas?.()
window.atualizarDashboard?.()

window.toast("Motorista removido")

}

/* ====================================================007 – EXPORT==================================================== */
window.renderizarMotoristas=renderizarMotoristas
window.atualizarSelectMotoristas=atualizarSelectMotoristas

})()
