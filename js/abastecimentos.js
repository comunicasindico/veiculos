(function(){
const form=document.getElementById("formAbastecimento")
const busca=document.getElementById("buscaAbastecimento")
const btnCalc=document.getElementById("btnCalcularValorLitro")
form?.addEventListener("submit",salvarAbastecimento)
busca?.addEventListener("input",renderizarAbastecimentos)
btnCalc?.addEventListener("click",calcularValorLitro)
function calcularValorLitro(){
const litros=Number(document.getElementById("litrosAbastecimento")?.value||0)
const total=Number(document.getElementById("valorTotalAbastecimento")?.value||0)
if(!litros||!total){window.toast("Informe litros e valor total");return}
document.getElementById("valorLitroAbastecimento").value=(total/litros).toFixed(3)
window.toast("Valor por litro calculado")
}
function salvarAbastecimento(e){
e.preventDefault()
const veiculoId=document.getElementById("veiculoAbastecimento")?.value||""
const dataAbastecimento=document.getElementById("dataAbastecimento")?.value||""
if(!veiculoId){window.toast("Selecione o veículo");return}
if(!dataAbastecimento){window.toast("Informe a data do abastecimento");return}
const item={
id:window.Utils.gerarId(),
veiculoId,
motoristaId:document.getElementById("motoristaAbastecimento")?.value||"",
dataAbastecimento,
posto:document.getElementById("postoAbastecimento")?.value?.trim()||"",
cnpjPosto:document.getElementById("cnpjPosto")?.value?.trim()||"",
tipoCombustivel:document.getElementById("tipoCombustivelAbastecimento")?.value||"",
litros:Number(document.getElementById("litrosAbastecimento")?.value||0),
valorTotal:Number(document.getElementById("valorTotalAbastecimento")?.value||0),
valorLitro:Number(document.getElementById("valorLitroAbastecimento")?.value||0),
quilometragem:Number(document.getElementById("quilometragemAbastecimento")?.value||0),
observacoes:document.getElementById("observacoesAbastecimento")?.value?.trim()||"",
createdAt:new Date().toISOString()
}
window.APP_STATE.abastecimentos.unshift(item)
const veiculo=window.APP_STATE.veiculos.find(v=>v.id===veiculoId)
if(veiculo&&item.quilometragem){veiculo.kmAtual=item.quilometragem}
window.salvarDadosLocal()
form.reset()
document.getElementById("dataAbastecimento").value=window.Utils.agoraInputDateTime()
renderizarAbastecimentos()
window.renderizarVeiculos?.()
window.renderizarRelatorios?.()
window.atualizarDashboard()
window.toast("Abastecimento salvo com sucesso")
}
function renderizarAbastecimentos(){
const box=document.getElementById("listaAbastecimentos")
if(!box)return
window.atualizarSelectsVeiculos?.()
window.atualizarSelectMotoristas?.()
const termo=window.Utils.normalizar(document.getElementById("buscaAbastecimento")?.value||"")
const lista=window.APP_STATE.abastecimentos.filter(a=>{
const veiculo=window.APP_STATE.veiculos.find(v=>v.id===a.veiculoId)
const motorista=window.APP_STATE.motoristas.find(m=>m.id===a.motoristaId)
const base=`${a.posto} ${veiculo?.placa||""} ${motorista?.nome||""}`
return !termo||window.Utils.normalizar(base).includes(termo)
})
if(!lista.length){
box.className="lista-vazia"
box.textContent="Nenhum abastecimento cadastrado."
return
}
box.className=""
box.innerHTML=lista.map(a=>{
const veiculo=window.APP_STATE.veiculos.find(v=>v.id===a.veiculoId)
const motorista=window.APP_STATE.motoristas.find(m=>m.id===a.motoristaId)
return `
<div class="item-lista">
<div class="item-lista-topo">
<h4>${veiculo?veiculo.placa:"Veículo removido"} • ${a.posto||"Posto não informado"}</h4>
<div>
<button class="btn btn-secundario" onclick="removerAbastecimento('${a.id}')">Excluir</button>
</div>
</div>
<div>
${a.tipoCombustivel?`<span class="tag">${a.tipoCombustivel}</span>`:""}
${a.litros?`<span class="tag">${window.Utils.numero(a.litros,3)} L</span>`:""}
${a.valorTotal?`<span class="tag ok">${window.Utils.moeda(a.valorTotal)}</span>`:""}
</div>
<div class="mini">Data: ${window.Utils.formatarDataHora(a.dataAbastecimento)} • Motorista: ${motorista?motorista.nome:"-"}</div>
<div class="mini">Valor/litro: ${a.valorLitro?window.Utils.moeda(a.valorLitro):"-"} • KM: ${a.quilometragem||"-"} • CNPJ: ${a.cnpjPosto||"-"}</div>
${a.observacoes?`<div class="mini">Obs.: ${a.observacoes}</div>`:""}
</div>
`
}).join("")
}
window.removerAbastecimento=function(id){
if(!confirm("Deseja excluir este abastecimento?"))return
window.APP_STATE.abastecimentos=window.APP_STATE.abastecimentos.filter(a=>a.id!==id)
window.salvarDadosLocal()
renderizarAbastecimentos()
window.renderizarRelatorios?.()
window.atualizarDashboard()
window.toast("Abastecimento excluído")
}
window.preencherAbastecimentoPorNota=function(dados={}){
document.querySelector('[data-target="painelAbastecimentos"]')?.click()
if(dados.posto)document.getElementById("postoAbastecimento").value=dados.posto
if(dados.cnpj)document.getElementById("cnpjPosto").value=dados.cnpj
if(dados.data)document.getElementById("dataAbastecimento").value=dados.data
if(dados.litros)document.getElementById("litrosAbastecimento").value=dados.litros
if(dados.valorTotal)document.getElementById("valorTotalAbastecimento").value=dados.valorTotal
if(dados.valorLitro)document.getElementById("valorLitroAbastecimento").value=dados.valorLitro
window.toast("Dados da nota enviados para abastecimento")
}
window.renderizarAbastecimentos=renderizarAbastecimentos
})()
