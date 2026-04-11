(function(){

/* ====================================================001 – INIT==================================================== */
const form=document.getElementById("formAbastecimento")
const busca=document.getElementById("buscaAbastecimento")
const btnCalc=document.getElementById("btnCalcularValorLitro")

form?.addEventListener("submit",salvarAbastecimento)
busca?.addEventListener("input",renderizarAbastecimentos)
btnCalc?.addEventListener("click",calcularValorLitro)

/* ====================================================002 – CALCULAR VALOR/LITRO==================================================== */
function calcularValorLitro(){
const litros=Number(document.getElementById("litrosAbastecimento")?.value||0)
const total=Number(document.getElementById("valorTotalAbastecimento")?.value||0)

if(!litros||!total){
window.toast("Informe litros e valor total")
return
}

document.getElementById("valorLitroAbastecimento").value=(total/litros).toFixed(3)
window.toast("Valor por litro calculado")
}

/* ====================================================003 – SALVAR==================================================== */
async function salvarAbastecimento(e){
e.preventDefault()

const veiculoId=document.getElementById("veiculoAbastecimento")?.value||""
const data=document.getElementById("dataAbastecimento")?.value||""

if(!veiculoId){window.toast("Selecione o veículo");return}
if(!data){window.toast("Informe a data");return}

/* 🔐 SEGURANÇA */
if(!window.CONTEXTO?.isAdmin){
const permitido=window.APP_STATE.veiculos.some(v=>String(v.id)===String(veiculoId))
if(!permitido){window.toast("Veículo não permitido");return}
}

/* 🔥 OBJETO */
const item={
empresa_id:window.CONTEXTO?.empresa_id,
veiculo_id:veiculoId,
data_abastecimento:data,
posto:document.getElementById("postoAbastecimento")?.value?.trim()||"",
tipo_combustivel:document.getElementById("tipoCombustivelAbastecimento")?.value||"",
litros:Number(document.getElementById("litrosAbastecimento")?.value||0),
valor_total:Number(document.getElementById("valorTotalAbastecimento")?.value||0),
valor_litro:Number(document.getElementById("valorLitroAbastecimento")?.value||0),
quilometragem:Number(document.getElementById("quilometragemAbastecimento")?.value||0),
observacoes:document.getElementById("observacoesAbastecimento")?.value?.trim()||"",
created_at:new Date().toISOString()
}

/* 🔥 BANCO */
if(window.db){

const{data:novo,error}=await window.db.from("abastecimentos").insert(item).select().single()

if(error){
console.error(error)
window.toast("Erro ao salvar")
return
}

window.APP_STATE.abastecimentos.unshift(novo)

/* 🔥 KM VEÍCULO */
if(item.quilometragem>0){
await window.db.from("veiculos")
.update({km_atual:item.quilometragem})
.eq("id",veiculoId)

const v=window.APP_STATE.veiculos.find(x=>String(x.id)===String(veiculoId))
if(v)v.km_atual=item.quilometragem
}

}else{

item.id=Date.now().toString()
window.APP_STATE.abastecimentos.unshift(item)
window.salvarDadosLocal()

}

/* 🔥 RESET */
const f=document.getElementById("formAbastecimento")
if(f)f.reset()

const input=document.getElementById("dataAbastecimento")
if(input){
const agora=new Date()
const iso=new Date(agora.getTime()-agora.getTimezoneOffset()*60000).toISOString().slice(0,16)
input.value=iso
}

/* 🔥 RENDER */
renderizarAbastecimentos()
window.atualizarDashboard?.()

window.toast("Abastecimento salvo com sucesso")
}

/* ====================================================004 – RENDER==================================================== */
function renderizarAbastecimentos(){

const box=document.getElementById("listaAbastecimentos")
if(!box)return

const lista=window.APP_STATE.abastecimentos||[]

if(!lista.length){
box.className="lista-vazia"
box.textContent="Nenhum abastecimento cadastrado."
return
}

box.className=""

box.innerHTML=lista.map(a=>{

const veiculo=window.APP_STATE.veiculos.find(v=>v.id===a.veiculo_id)

return `
<div class="item-lista">

<div class="item-lista-topo">
<h4>${veiculo?veiculo.placa:"Veículo"} • ${a.posto||"-"}</h4>
<div>
<button class="btn btn-secundario" onclick="removerAbastecimento('${a.id}')">Excluir</button>
</div>
</div>

<div>
<span class="tag">${a.tipo_combustivel||"-"}</span>
<span class="tag">${Number(a.litros||0).toFixed(2)} L</span>
<span class="tag ok">R$ ${Number(a.valor_total||0).toFixed(2)}</span>
</div>

<div class="mini">
Data: ${new Date(a.data_abastecimento).toLocaleString()}
</div>

<div class="mini">
KM: ${a.quilometragem||"-"}
</div>

</div>
`

}).join("")
}

/* ====================================================005 – EXCLUIR==================================================== */
window.removerAbastecimento=async function(id){

if(!confirm("Deseja excluir este abastecimento?"))return

const registro=window.APP_STATE.abastecimentos.find(a=>String(a.id)===String(id))
if(!registro)return

/* 🔐 SEGURANÇA */
if(!window.CONTEXTO?.isAdmin){
const permitido=window.APP_STATE.veiculos.some(v=>String(v.id)===String(registro.veiculo_id))
if(!permitido){
window.toast("Ação não permitida")
return
}
}

/* 🔥 DELETE */
if(window.db){
const{error}=await window.db.from("abastecimentos").delete().eq("id",id)
if(error){
console.error(error)
window.toast("Erro ao excluir")
return
}
}else{
window.salvarDadosLocal()
}

window.APP_STATE.abastecimentos=window.APP_STATE.abastecimentos.filter(a=>a.id!==id)

renderizarAbastecimentos()
window.atualizarDashboard?.()

window.toast("Excluído com sucesso")
}

/* ====================================================006 – EXPORT==================================================== */
window.renderizarAbastecimentos=renderizarAbastecimentos

})()
