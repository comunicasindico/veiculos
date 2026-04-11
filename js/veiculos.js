window.VEICULO_EDITANDO_ID=null;

(function(){

/* ====================================================001 – INIT==================================================== */
const form=document.getElementById("formVeiculo")
const busca=document.getElementById("buscaVeiculo")

form?.addEventListener("submit",salvarVeiculo)
busca?.addEventListener("input",renderizarVeiculos)

/* ====================================================002 – PAYLOAD==================================================== */
function obterPayloadVeiculo(){

const ctx=window.CONTEXTO

return{
empresa_id:ctx?.empresa_id,
usuario_id:ctx?.isAdmin
?document.getElementById("usuarioSelecionadoAdmin")?.value||ctx.usuario_id
:ctx?.usuario_id,

placa:(document.getElementById("placa")?.value||"").toUpperCase().trim(),
marca:document.getElementById("marca")?.value||"",
modelo:document.getElementById("modelo")?.value||"",
ano:Number(document.getElementById("ano")?.value||0)||null,
cor:document.getElementById("cor")?.value||"",
renavam:document.getElementById("renavam")?.value||"",
combustivel_principal:document.getElementById("combustivelPrincipal")?.value||"",
km_atual:Number(document.getElementById("kmAtual")?.value||0),
vencimento_ipva:document.getElementById("vencimentoIpva")?.value||null,
vencimento_licenciamento:document.getElementById("vencimentoLicenciamento")?.value||null,
observacoes:document.getElementById("observacoesVeiculo")?.value||"",
updated_at:new Date().toISOString()

}

}

/* ====================================================003 – SALVAR==================================================== */
async function salvarVeiculo(e){

e.preventDefault()

const item=obterPayloadVeiculo()

if(!item.placa){
window.toast("Informe a placa")
return
}

/* 🔒 DUPLICADO */
const duplicado=(window.APP_STATE.veiculos||[]).some(v=>{
return String(v.placa||"").toUpperCase()===item.placa &&
String(v.id)!==String(window.VEICULO_EDITANDO_ID||"")
})

if(duplicado){
window.toast("Placa já existe")
return
}

/* 🔥 INSERT / UPDATE */
if(window.VEICULO_EDITANDO_ID){
await atualizarVeiculo(item)
}else{
await inserirVeiculo(item)
}

cancelarEdicaoVeiculo()
renderizarTudoGeral()

}

/* ====================================================004 – INSERT==================================================== */
async function inserirVeiculo(item){

if(window.db){

const {data,error}=await window.db.from("veiculos").insert(item).select().single()

if(error){
console.error(error)
window.toast("Erro ao salvar")
return
}

window.APP_STATE.veiculos.unshift(data)

}else{

item.id=window.Utils.gerarId()
item.created_at=new Date().toISOString()

window.APP_STATE.veiculos.unshift(item)
window.salvarDadosLocal()

}

window.toast("Veículo salvo")

}

/* ====================================================005 – UPDATE==================================================== */
async function atualizarVeiculo(item){

const ctx=window.CONTEXTO

if(window.db){

let query=window.db.from("veiculos")
.update(item)
.eq("id",window.VEICULO_EDITANDO_ID)

if(!ctx?.isAdmin){
query=query.eq("usuario_id",ctx.usuario_id)
}

const {data,error}=await query.select().single()

if(error){
console.error(error)
window.toast("Erro ao atualizar")
return
}

window.APP_STATE.veiculos=
window.APP_STATE.veiculos.map(v=>
String(v.id)===String(window.VEICULO_EDITANDO_ID)?data:v
)

}else{

window.APP_STATE.veiculos=
window.APP_STATE.veiculos.map(v=>{
if(String(v.id)!==String(window.VEICULO_EDITANDO_ID))return v
return{...v,...item}
})

window.salvarDadosLocal()

}

window.toast("Veículo atualizado")

}

/* ====================================================006 – RENDER==================================================== */
function renderizarVeiculos(){

const box=document.getElementById("listaVeiculos")
if(!box)return

const ctx=window.CONTEXTO
const termo=window.Utils.normalizar(document.getElementById("buscaVeiculo")?.value||"")

/* 🔐 FILTRO SaaS */
let lista=(window.APP_STATE.veiculos||[])

if(!ctx?.isAdmin){
lista=lista.filter(v=>String(v.usuario_id)===String(ctx.usuario_id))
}

/* 🔍 BUSCA */
lista=lista.filter(v=>{
const base=`${v.placa} ${v.marca} ${v.modelo}`
return !termo||window.Utils.normalizar(base).includes(termo)
})

if(!lista.length){
box.className="lista-vazia"
box.textContent="Nenhum veículo"
atualizarSelectsVeiculos()
return
}

box.className=""

box.innerHTML=lista.map(v=>`
<div class="item-lista">

<div class="item-lista-topo">
<h4>${v.placa} • ${v.marca||""} ${v.modelo||""}</h4>
<div>
<button class="btn" onclick="editarVeiculo('${v.id}')">Editar</button>
<button class="btn btn-secundario" onclick="removerVeiculo('${v.id}')">Excluir</button>
</div>
</div>

<div>
<span class="tag">${v.combustivel_principal||"-"}</span>
${v.ano?`<span class="tag">${v.ano}</span>`:""}
</div>

<div class="mini">
IPVA: ${window.Utils.formatarData(v.vencimento_ipva)} • 
Lic: ${window.Utils.formatarData(v.vencimento_licenciamento)}
</div>

<div class="mini">
KM: ${v.km_atual||0}
</div>

</div>
`).join("")

atualizarSelectsVeiculos()

}

/* ====================================================007 – SELECT==================================================== */
function atualizarSelectsVeiculos(){

const selects=[
"veiculoPrincipalMotorista",
"veiculoAbastecimento",
"filtroRelatorioVeiculo"
]

selects.forEach(id=>{

const el=document.getElementById(id)
if(!el)return

const valor=el.value

el.innerHTML=
(id==="filtroRelatorioVeiculo"
?'<option value="todos">Todos</option>'
:'<option value="">Selecione</option>')+
(window.APP_STATE.veiculos||[]).map(v=>
`<option value="${v.id}">${v.placa}</option>`
).join("")

if([...el.options].some(o=>o.value===valor)){
el.value=valor
}

})

}

/* ====================================================008 – EDITAR==================================================== */
window.editarVeiculo=function(id){

const v=window.APP_STATE.veiculos.find(x=>String(x.id)===String(id))
if(!v)return

window.VEICULO_EDITANDO_ID=id

document.getElementById("placa").value=v.placa||""
document.getElementById("marca").value=v.marca||""
document.getElementById("modelo").value=v.modelo||""
document.getElementById("kmAtual").value=v.km_atual||0

window.toast("Editando veículo")

}

/* ====================================================009 – REMOVER==================================================== */
window.removerVeiculo=async function(id){

if(!confirm("Excluir veículo?"))return

const ctx=window.CONTEXTO

if(window.db){

let query=window.db.from("veiculos").delete().eq("id",id)

if(!ctx?.isAdmin){
query=query.eq("usuario_id",ctx.usuario_id)
}

const {error}=await query

if(error){
console.error(error)
window.toast("Erro ao excluir")
return
}

}else{
window.salvarDadosLocal()
}

window.APP_STATE.veiculos=
window.APP_STATE.veiculos.filter(v=>v.id!==id)

renderizarTudoGeral()

window.toast("Veículo removido")

}

/* ====================================================010 – GLOBAL RENDER==================================================== */
function renderizarTudoGeral(){
renderizarVeiculos()
window.renderizarMotoristas?.()
window.renderizarAbastecimentos?.()
window.renderizarRelatorios?.()
window.renderizarAlertas?.()
window.atualizarDashboard?.()
}

/* ====================================================EXPORT==================================================== */
window.renderizarVeiculos=renderizarVeiculos
window.atualizarSelectsVeiculos=atualizarSelectsVeiculos

})()
