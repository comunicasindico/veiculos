(function(){
const form=document.getElementById("formVeiculo")
const busca=document.getElementById("buscaVeiculo")
form?.addEventListener("submit",salvarVeiculo)
busca?.addEventListener("input",renderizarVeiculos)

async function salvarVeiculo(e){
e.preventDefault()
const placa=(document.getElementById("placa")?.value||"").toUpperCase().trim()
if(!placa){window.toast("Informe a placa do veículo");return}

const item={
placa,
marca:document.getElementById("marca")?.value?.trim()||"",
modelo:document.getElementById("modelo")?.value?.trim()||"",
ano:document.getElementById("ano")?.value?Number(document.getElementById("ano").value):null,
cor:document.getElementById("cor")?.value?.trim()||"",
renavam:document.getElementById("renavam")?.value?.trim()||"",
combustivel_principal:document.getElementById("combustivelPrincipal")?.value||"",
km_atual:Number(document.getElementById("kmAtual")?.value||0),
vencimento_ipva:document.getElementById("vencimentoIpva")?.value||null,
vencimento_licenciamento:document.getElementById("vencimentoLicenciamento")?.value||null,
observacoes:document.getElementById("observacoesVeiculo")?.value?.trim()||"",
updated_at:new Date().toISOString()
}

if(window.db){
const {data,error}=await window.db.from("veiculos").insert(item).select().single()
if(error){console.error(error);window.toast("Erro ao salvar veículo");return}
window.APP_STATE.veiculos.unshift(data)
}else{
item.id=window.Utils.gerarId()
item.created_at=new Date().toISOString()
window.APP_STATE.veiculos.unshift(item)
window.salvarDadosLocal()
}

form.reset()
renderizarVeiculos()
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
const ipva=v.vencimento_ipva?`IPVA: ${window.Utils.formatarData(v.vencimento_ipva)}`:"IPVA: não informado"
const lic=v.vencimento_licenciamento?`Licenciamento: ${window.Utils.formatarData(v.vencimento_licenciamento)}`:"Licenciamento: não informado"
return `
<div class="item-lista">
<div class="item-lista-topo">
<h4>${v.placa} • ${v.marca||"Sem marca"} ${v.modelo||""}</h4>
<div>
<button class="btn btn-secundario" onclick="removerVeiculo('${v.id}')">Excluir</button>
</div>
</div>
<div>
<span class="tag">${v.combustivel_principal||"Combustível não informado"}</span>
${v.ano?`<span class="tag">Ano ${v.ano}</span>`:""}
${v.cor?`<span class="tag">${v.cor}</span>`:""}
</div>
<div class="mini">${ipva} • ${lic}</div>
<div class="mini">KM atual: ${v.km_atual||0} • Renavam: ${v.renavam||"-"}</div>
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

window.removerVeiculo=async function(id){
if(!confirm("Deseja excluir este veículo?"))return
if(window.db){
const {error}=await window.db.from("veiculos").delete().eq("id",id)
if(error){console.error(error);window.toast("Erro ao excluir veículo");return}
}else{
window.APP_STATE.veiculos=window.APP_STATE.veiculos.filter(v=>v.id!==id)
window.APP_STATE.motoristas=window.APP_STATE.motoristas.map(m=>m.veiculo_principal_id===id?{...m,veiculo_principal_id:null}:m)
window.APP_STATE.abastecimentos=window.APP_STATE.abastecimentos.filter(a=>a.veiculo_id!==id)
window.salvarDadosLocal()
}
window.APP_STATE.veiculos=window.APP_STATE.veiculos.filter(v=>v.id!==id)
window.APP_STATE.motoristas=window.APP_STATE.motoristas.map(m=>m.veiculo_principal_id===id?{...m,veiculo_principal_id:null}:m)
window.APP_STATE.abastecimentos=window.APP_STATE.abastecimentos.filter(a=>a.veiculo_id!==id)
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
