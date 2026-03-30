(function(){
const form=document.getElementById("formVeiculo")
const busca=document.getElementById("buscaVeiculo")
form?.addEventListener("submit",salvarVeiculo)
busca?.addEventListener("input",renderizarVeiculos)
function salvarVeiculo(e){
e.preventDefault()
const placa=(document.getElementById("placa")?.value||"").toUpperCase().trim()
if(!placa){window.toast("Informe a placa do veículo");return}
const existe=window.APP_STATE.veiculos.some(v=>window.Utils.normalizar(v.placa)===window.Utils.normalizar(placa))
if(existe){window.toast("Já existe um veículo com esta placa");return}
const item={
id:window.Utils.gerarId(),
placa,
marca:document.getElementById("marca")?.value?.trim()||"",
modelo:document.getElementById("modelo")?.value?.trim()||"",
ano:document.getElementById("ano")?.value||"",
cor:document.getElementById("cor")?.value?.trim()||"",
renavam:document.getElementById("renavam")?.value?.trim()||"",
combustivelPrincipal:document.getElementById("combustivelPrincipal")?.value||"",
kmAtual:document.getElementById("kmAtual")?.value||"",
vencimentoIpva:document.getElementById("vencimentoIpva")?.value||"",
vencimentoLicenciamento:document.getElementById("vencimentoLicenciamento")?.value||"",
observacoes:document.getElementById("observacoesVeiculo")?.value?.trim()||"",
createdAt:new Date().toISOString()
}
window.APP_STATE.veiculos.unshift(item)
window.salvarDadosLocal()
form.reset()
window.renderizarVeiculos()
window.renderizarMotoristas?.()
window.renderizarAbastecimentos?.()
window.renderizarAlertas?.()
window.renderizarRelatorios?.()
window.atualizarDashboard()
window.toast("Veículo salvo com sucesso")
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
<div>
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
window.removerVeiculo=function(id){
if(!confirm("Deseja excluir este veículo?"))return
window.APP_STATE.veiculos=window.APP_STATE.veiculos.filter(v=>v.id!==id)
window.APP_STATE.motoristas=window.APP_STATE.motoristas.map(m=>m.veiculoPrincipalId===id?{...m,veiculoPrincipalId:""}:m)
window.APP_STATE.abastecimentos=window.APP_STATE.abastecimentos.filter(a=>a.veiculoId!==id)
window.salvarDadosLocal()
renderizarVeiculos()
window.renderizarMotoristas?.()
window.renderizarAbastecimentos?.()
window.renderizarAlertas?.()
window.renderizarRelatorios?.()
window.atualizarDashboard()
window.toast("Veículo excluído")
}
window.renderizarVeiculos=renderizarVeiculos
window.atualizarSelectsVeiculos=atualizarSelectsVeiculos
})()
