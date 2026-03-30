(function(){
const form=document.getElementById("formAbastecimento")
const busca=document.getElementById("buscaAbastecimento")
const btnCalc=document.getElementById("btnCalcularValorLitro")
let ABASTECIMENTO_EDITANDO_ID=null
form?.addEventListener("submit",salvarAbastecimento)
form?.addEventListener("reset",()=>{
setTimeout(()=>cancelarEdicaoAbastecimento(),0)
})
busca?.addEventListener("input",renderizarAbastecimentos)
btnCalc?.addEventListener("click",calcularValorLitro)
function numeroSeguro(v){
if(v===null||v===undefined||v==="")return 0
const n=Number(String(v).replace(",","."))
return Number.isFinite(n)?n:0
}
function calcularValorLitro(){
const litros=numeroSeguro(document.getElementById("litrosAbastecimento")?.value||0)
const total=numeroSeguro(document.getElementById("valorTotalAbastecimento")?.value||0)
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
id:ABASTECIMENTO_EDITANDO_ID||window.Utils.gerarId(),
veiculoId,
motoristaId:document.getElementById("motoristaAbastecimento")?.value||"",
dataAbastecimento,
posto:document.getElementById("postoAbastecimento")?.value?.trim()||"",
cnpjPosto:document.getElementById("cnpjPosto")?.value?.trim()||"",
tipoCombustivel:document.getElementById("tipoCombustivelAbastecimento")?.value||"",
litros:numeroSeguro(document.getElementById("litrosAbastecimento")?.value||0),
valorTotal:numeroSeguro(document.getElementById("valorTotalAbastecimento")?.value||0),
valorLitro:numeroSeguro(document.getElementById("valorLitroAbastecimento")?.value||0),
quilometragem:numeroSeguro(document.getElementById("quilometragemAbastecimento")?.value||0),
observacoes:document.getElementById("observacoesAbastecimento")?.value?.trim()||"",
createdAt:ABASTECIMENTO_EDITANDO_ID?(window.APP_STATE.abastecimentos.find(a=>String(a.id)===String(ABASTECIMENTO_EDITANDO_ID))?.createdAt||new Date().toISOString()):new Date().toISOString(),
updatedAt:new Date().toISOString()
}
if(ABASTECIMENTO_EDITANDO_ID){
window.APP_STATE.abastecimentos=window.APP_STATE.abastecimentos.map(a=>String(a.id)===String(ABASTECIMENTO_EDITANDO_ID)?item:a)
window.toast("Abastecimento atualizado com sucesso")
}else{
window.APP_STATE.abastecimentos.unshift(item)
window.toast("Abastecimento salvo com sucesso")
}
atualizarKmAtualDoVeiculo(veiculoId)
window.salvarDadosLocal()
cancelarEdicaoAbastecimento()
renderizarAbastecimentos()
window.renderizarVeiculos?.()
window.renderizarRelatorios?.()
window.atualizarDashboard()
}
function atualizarKmAtualDoVeiculo(veiculoId){
const veiculo=window.APP_STATE.veiculos.find(v=>String(v.id)===String(veiculoId))
if(!veiculo)return
const historico=window.APP_STATE.abastecimentos
.filter(a=>String(a.veiculoId)===String(veiculoId))
.filter(a=>numeroSeguro(a.quilometragem)>0)
.sort((a,b)=>new Date(b.dataAbastecimento)-new Date(a.dataAbastecimento))
const ultimoKm=historico.length?numeroSeguro(historico[0].quilometragem):numeroSeguro(veiculo.kmAtual)
veiculo.kmAtual=ultimoKm
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
atualizarBotaoAbastecimento()
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
<div style="display:flex;gap:8px;flex-wrap:wrap;">
<button class="btn btn-secundario" onclick="editarAbastecimento('${a.id}')">Editar</button>
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
atualizarBotaoAbastecimento()
}
function preencherFormularioAbastecimento(a){
document.getElementById("veiculoAbastecimento").value=a.veiculoId||""
document.getElementById("motoristaAbastecimento").value=a.motoristaId||""
document.getElementById("dataAbastecimento").value=a.dataAbastecimento||window.Utils.agoraInputDateTime()
document.getElementById("postoAbastecimento").value=a.posto||""
document.getElementById("cnpjPosto").value=a.cnpjPosto||""
document.getElementById("tipoCombustivelAbastecimento").value=a.tipoCombustivel||""
document.getElementById("litrosAbastecimento").value=numeroSeguro(a.litros)
document.getElementById("valorTotalAbastecimento").value=numeroSeguro(a.valorTotal)
document.getElementById("valorLitroAbastecimento").value=numeroSeguro(a.valorLitro)
document.getElementById("quilometragemAbastecimento").value=numeroSeguro(a.quilometragem)
document.getElementById("observacoesAbastecimento").value=a.observacoes||""
}
function atualizarBotaoAbastecimento(){
const submit=form?.querySelector('button[type="submit"]')
if(submit)submit.textContent=ABASTECIMENTO_EDITANDO_ID?"Atualizar abastecimento":"Salvar abastecimento"
let btnCancelar=document.getElementById("btnCancelarEdicaoAbastecimento")
if(ABASTECIMENTO_EDITANDO_ID){
if(!btnCancelar){
btnCancelar=document.createElement("button")
btnCancelar.type="button"
btnCancelar.id="btnCancelarEdicaoAbastecimento"
btnCancelar.className="btn btn-secundario"
btnCancelar.textContent="Cancelar edição"
btnCancelar.addEventListener("click",cancelarEdicaoAbastecimento)
form?.querySelector(".actions")?.appendChild(btnCancelar)
}
}else{
if(btnCancelar)btnCancelar.remove()
}
}
function cancelarEdicaoAbastecimento(){
ABASTECIMENTO_EDITANDO_ID=null
form?.reset()
document.getElementById("dataAbastecimento").value=window.Utils.agoraInputDateTime()
atualizarBotaoAbastecimento()
}
window.editarAbastecimento=function(id){
const a=window.APP_STATE.abastecimentos.find(x=>String(x.id)===String(id))
if(!a)return
ABASTECIMENTO_EDITANDO_ID=id
preencherFormularioAbastecimento(a)
atualizarBotaoAbastecimento()
document.querySelector('[data-target="painelAbastecimentos"]')?.click()
window.scrollTo({top:0,behavior:"smooth"})
window.toast("Editando abastecimento")
}
window.removerAbastecimento=function(id){
if(!confirm("Deseja excluir este abastecimento?"))return
const item=window.APP_STATE.abastecimentos.find(a=>String(a.id)===String(id))
window.APP_STATE.abastecimentos=window.APP_STATE.abastecimentos.filter(a=>a.id!==id)
if(item?.veiculoId)atualizarKmAtualDoVeiculo(item.veiculoId)
window.salvarDadosLocal()
if(String(ABASTECIMENTO_EDITANDO_ID)===String(id))cancelarEdicaoAbastecimento()
renderizarAbastecimentos()
window.renderizarVeiculos?.()
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
