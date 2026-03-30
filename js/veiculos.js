(function(){
const form=document.getElementById("formVeiculo")
const busca=document.getElementById("buscaVeiculo")
let VEICULO_EDITANDO_ID=null
form?.addEventListener("submit",salvarVeiculo)
busca?.addEventListener("input",renderizarVeiculos)
function salvarVeiculo(e){
e.preventDefault()
const placa=(document.getElementById("placa")?.value||"").toUpperCase().trim()
if(!placa){window.toast("Informe a placa do veículo");return}
const marca=document.getElementById("marca")?.value?.trim()||""
const modelo=document.getElementById("modelo")?.value?.trim()||""
const ano=document.getElementById("ano")?.value||""
const cor=document.getElementById("cor")?.value?.trim()||""
const renavam=document.getElementById("renavam")?.value?.trim()||""
const combustivelPrincipal=document.getElementById("combustivelPrincipal")?.value||""
const kmAtual=document.getElementById("kmAtual")?.value||""
const vencimentoIpva=document.getElementById("vencimentoIpva")?.value||""
const vencimentoLicenciamento=document.getElementById("vencimentoLicenciamento")?.value||""
const observacoes=document.getElementById("observacoesVeiculo")?.value?.trim()||""
const existe=window.APP_STATE.veiculos.some(v=>{
return window.Utils.normalizar(v.placa)===window.Utils.normalizar(placa)&&String(v.id)!==String(VEICULO_EDITANDO_ID||"")
})
if(existe){window.toast("Já existe um veículo com esta placa");return}
if(VEICULO_EDITANDO_ID){
window.APP_STATE.veiculos=window.APP_STATE.veiculos.map(v=>{
if(String(v.id)!==String(VEICULO_EDITANDO_ID))return v
return{
...v,
placa,
marca,
modelo,
ano,
cor,
renavam,
combustivelPrincipal,
kmAtual,
vencimentoIpva,
vencimentoLicenciamento,
observacoes,
updatedAt:new Date().toISOString()
}
})
window.toast("Veículo atualizado com sucesso")
}else{
const item={
id:window.Utils.gerarId(),
placa,
marca,
modelo,
ano,
cor,
renavam,
combustivelPrincipal,
kmAtual,
vencimentoIpva,
vencimentoLicenciamento,
observacoes,
createdAt:new Date().toISOString()
}
window.APP_STATE.veiculos.unshift(item)
window.toast("Veículo salvo com sucesso")
}
window.salvarDadosLocal()
cancelarEdicaoVeiculo()
window.renderizarVeiculos()
window.renderizarMotoristas?.()
window.renderizarAbastecimentos?.()
window.renderizarAlertas?.()
window.renderizarRelatorios?.()
window.atualizarDashboard()
}
function renderizarVeiculos(){
const box=document.getElementById("listaVeiculos")
if(!box)return
const termo=window.Utils.normalizar(document.getElementById("buscaVeiculo")?.value||"")
const lista=window.APP_STATE.veiculos.filter(v=>{
if(!termo)return true
const base=`${v.placa} ${v.marca} ${v.modelo}`
return window.Utils.normalizar(base).includes(termo)
})
if(!lista.length){
box.className="lista-vazia"
box.textContent="Nenhum veículo cadastrado."
atualizarSelectsVeiculos()
return
}
box.className=""
box.innerHTML=lista.map(v=>{
const ipva=v.vencimentoIpva?`IPVA: ${window.Utils.formatarData(v.vencimentoIpva)}`:"IPVA: não informado"
const lic=v.vencimentoLicenciamento?`Licenciamento: ${window.Utils.formatarData(v.vencimentoLicenciamento)}`:"Licenciamento: não informado"
return `
<div class="item-lista">
<div class="item-lista-topo">
<h4>${v.placa} • ${v.marca||"Sem marca"} ${v.modelo||""}</h4>
<div style="display:flex;gap:8px;flex-wrap:wrap;">
<button class="btn btn-secundario" onclick="editarVeiculo('${v.id}')">Editar</button>
<button class="btn btn-secundario" onclick="removerVeiculo('${v.id}')">Excluir</button>
</div>
</div>
<div>
<span class="tag">${v.combustivelPrincipal||"Combustível não informado"}</span>
${v.ano?`<span class="tag">Ano ${v.ano}</span>`:""}
${v.cor?`<span class="tag">${v.cor}</span>`:""}
</div>
<div class="mini">${ipva} • ${lic}</div>
<div class="mini">KM atual: ${v.kmAtual||"0"} • Renavam: ${v.renavam||"-"}</div>
${v.observacoes?`<div class="mini">Obs.: ${v.observacoes}</div>`:""}
</div>
`
}).join("")
atualizarSelectsVeiculos()
}
function atualizarSelectsVeiculos(){
const selects=[
document.getElementById("veiculoPrincipalMotorista"),
document.getElementById("veiculoAbastecimento"),
document.getElementById("filtroRelatorioVeiculo")
]
selects.forEach(select=>{
if(!select)return
const valorAtual=select.value
const primeiro=select.id==="filtroRelatorioVeiculo"?'<option value="todos">Todos</option>':'<option value="">Selecione</option>'
select.innerHTML=primeiro+window.APP_STATE.veiculos.map(v=>`<option value="${v.id}">${v.placa} • ${v.marca||""} ${v.modelo||""}</option>`).join("")
if([...select.options].some(o=>o.value===valorAtual))select.value=valorAtual
})
}
function preencherFormularioVeiculo(v){
document.getElementById("placa").value=v.placa||""
document.getElementById("marca").value=v.marca||""
document.getElementById("modelo").value=v.modelo||""
document.getElementById("ano").value=v.ano||""
document.getElementById("cor").value=v.cor||""
document.getElementById("renavam").value=v.renavam||""
document.getElementById("combustivelPrincipal").value=v.combustivelPrincipal||""
document.getElementById("kmAtual").value=v.kmAtual||""
document.getElementById("vencimentoIpva").value=v.vencimentoIpva||""
document.getElementById("vencimentoLicenciamento").value=v.vencimentoLicenciamento||""
document.getElementById("observacoesVeiculo").value=v.observacoes||""
}
function
