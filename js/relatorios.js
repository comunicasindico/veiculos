(function(){
const filtroVeiculo=document.getElementById("filtroRelatorioVeiculo")
const filtroPeriodo=document.getElementById("filtroRelatorioPeriodo")
if(filtroVeiculo)filtroVeiculo.addEventListener("change",renderizarRelatorios)
if(filtroPeriodo)filtroPeriodo.addEventListener("change",renderizarRelatorios)
function renderizarRelatorios(){
const boxResumo=document.getElementById("painelRelatorioResumo")
const boxTabela=document.getElementById("tabelaRelatorio")
if(!boxResumo||!boxTabela)return
const veiculoId=filtroVeiculo?.value||"todos"
const periodo=filtroPeriodo?.value||"todos"
let lista=(window.APP_STATE?.abastecimentos||[]).slice()
if(veiculoId!=="todos"){
lista=lista.filter(a=>String(a.veiculoId||"")===String(veiculoId))
}
if(periodo!=="todos"){
const dias=Number(periodo||0)
if(dias>0){
const agora=new Date()
lista=lista.filter(a=>{
if(!a.dataAbastecimento)return false
const dt=new Date(a.dataAbastecimento)
if(Number.isNaN(dt.getTime()))return false
const diff=(agora-dt)/86400000
return diff<=dias
})
}
}
lista.sort((a,b)=>new Date(b.dataAbastecimento||0)-new Date(a.dataAbastecimento||0))
const totalGasto=lista.reduce((s,a)=>s+Number(a.valorTotal||0),0)
const totalLitros=lista.reduce((s,a)=>s+Number(a.litros||0),0)
const totalRegistros=lista.length
const ticketMedio=totalRegistros?totalGasto/totalRegistros:0
const valorMedioLitro=totalLitros?totalGasto/totalLitros:0
const maiorKm=obterMaiorKm(lista)
const menorKm=obterMenorKm(lista)
const kmRodados=(maiorKm!==null&&menorKm!==null&&maiorKm>=menorKm)?(maiorKm-menorKm):0
const custoPorKm=kmRodados>0?totalGasto/kmRodados:0
const consumoMedio=kmRodados>0&&totalLitros>0?kmRodados/totalLitros:0
boxResumo.innerHTML=`
<div class="kpi-card"><span>Total gasto</span><strong>${window.Utils.moeda(totalGasto)}</strong></div>
<div class="kpi-card"><span>Total de litros</span><strong>${window.Utils.numero(totalLitros,3)}</strong></div>
<div class="kpi-card"><span>Abastecimentos</span><strong>${totalRegistros}</strong></div>
<div class="kpi-card"><span>Ticket médio</span><strong>${window.Utils.moeda(ticketMedio)}</strong></div>
<div class="kpi-card"><span>Valor médio por litro</span><strong>${valorMedioLitro?window.Utils.moeda(valorMedioLitro):"R$ 0,00"}</strong></div>
<div class="kpi-card"><span>KM rodados no período</span><strong>${window.Utils.numero(kmRodados,0)}</strong></div>
<div class="kpi-card"><span>Custo por KM</span><strong>${custoPorKm?window.Utils.moeda(custoPorKm):"R$ 0,00"}</strong></div>
<div class="kpi-card"><span>Consumo médio KM/L</span><strong>${consumoMedio?window.Utils.numero(consumoMedio,2):"0,00"}</strong></div>
`
if(!lista.length){
boxTabela.className="lista-vazia"
boxTabela.textContent="Nenhum dado para relatório."
return
}
const agrupadoPorVeiculo=agruparPorVeiculo(lista)
const cardsResumoVeiculo=Object.keys(agrupadoPorVeiculo).map(id=>{
const grupo=agrupadoPorVeiculo[id]
const veiculo=window.APP_STATE.veiculos.find(v=>String(v.id)===String(id))
const gasto=grupo.reduce((s,a)=>s+Number(a.valorTotal||0),0)
const litros=grupo.reduce((s,a)=>s+Number(a.litros||0),0)
const qtd=grupo.length
return `
<div class="item-lista">
<div class="item-lista-topo">
<h4>${veiculo?`${veiculo.placa} • ${veiculo.marca||""} ${veiculo.modelo||""}`:"Veículo não encontrado"}</h4>
<span class="tag ok">${qtd} abastecimento(s)</span>
</div>
<div class="mini">Total gasto: ${window.Utils.moeda(gasto)} • Total de litros: ${window.Utils.numero(litros,3)}</div>
</div>
`
}).join("")
const linhas=lista.map(a=>{
const veiculo=window.APP_STATE.veiculos.find(v=>String(v.id)===String(a.veiculoId))
const motorista=window.APP_STATE.motoristas.find(m=>String(m.id)===String(a.motoristaId))
return `
<tr>
<td>${window.Utils.formatarDataHora(a.dataAbastecimento)}</td>
<td>${veiculo?veiculo.placa:"-"}</td>
<td>${motorista?motorista.nome:"-"}</td>
<td>${a.posto||"-"}</td>
<td>${a.tipoCombustivel||"-"}</td>
<td>${window.Utils.numero(a.litros||0,3)}</td>
<td>${Number(a.valorLitro||0)?window.Utils.moeda(a.valorLitro):"R$ 0,00"}</td>
<td>${Number(a.valorTotal||0)?window.Utils.moeda(a.valorTotal):"R$ 0,00"}</td>
<td>${a.quilometragem?window.Utils.numero(a.quilometragem,0):"-"}</td>
</tr>
`
}).join("")
boxTabela.className=""
boxTabela.innerHTML=`
<div class="bloco" style="padding:0;border:none;box-shadow:none;background:transparent;">
<div style="display:grid;gap:12px;margin-bottom:14px;">
${cardsResumoVeiculo||""}
</div>
<div style="overflow:auto;">
<table class="tabela">
<thead>
<tr>
<th>Data</th>
<th>Veículo</th>
<th>Motorista</th>
<th>Posto</th>
<th>Combustível</th>
<th>Litros</th>
<th>Valor/L</th>
<th>Total</th>
<th>KM</th>
</tr>
</thead>
<tbody>
${linhas}
</tbody>
</table>
</div>
</div>
`
}
function agruparPorVeiculo(lista){
const mapa={}
lista.forEach(item=>{
const chave=String(item.veiculoId||"sem_veiculo")
if(!mapa[chave])mapa[chave]=[]
mapa[chave].push(item)
})
return mapa
}
function obterMaiorKm(lista){
const kms=lista.map(a=>Number(a.quilometragem||0)).filter(v=>v>0)
if(!kms.length)return null
return Math.max(...kms)
}
function obterMenorKm(lista){
const kms=lista.map(a=>Number(a.quilometragem||0)).filter(v=>v>0)
if(!kms.length)return null
return Math.min(...kms)
}
window.renderizarRelatorios=renderizarRelatorios
})()
