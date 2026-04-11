(function(){

const filtroVeiculo=document.getElementById("filtroRelatorioVeiculo")
const filtroPeriodo=document.getElementById("filtroRelatorioPeriodo")

filtroVeiculo?.addEventListener("change",renderizarRelatorios)
filtroPeriodo?.addEventListener("change",renderizarRelatorios)

/* ====================================================FORMATOS==================================================== */
function moeda(v){
return Number(v||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"})
}

function numero(v,casas=2){
return Number(v||0).toFixed(casas)
}

function dataBR(d){
return d?new Date(d).toLocaleDateString():"-"
}

/* ====================================================RENDER==================================================== */
function renderizarRelatorios(){

const boxResumo=document.getElementById("painelRelatorioResumo")
const boxTabela=document.getElementById("tabelaRelatorio")

if(!boxResumo||!boxTabela)return

const veiculoId=filtroVeiculo?.value||"todos"
const periodo=filtroPeriodo?.value||"todos"

let lista=(window.APP_STATE?.abastecimentos||[]).slice()

/* 🔥 FILTRO VEÍCULO */
if(veiculoId!=="todos"){
lista=lista.filter(a=>String(a.veiculo_id)===String(veiculoId))
}

/* 🔥 FILTRO PERÍODO */
if(periodo!=="todos"){
const dias=Number(periodo)
const agora=new Date()

lista=lista.filter(a=>{
const dt=new Date(a.data_abastecimento)
if(isNaN(dt))return false
return ((agora-dt)/86400000)<=dias
})
}

/* 🔥 ORDENA */
lista.sort((a,b)=>new Date(b.data_abastecimento)-new Date(a.data_abastecimento))

/* 🔥 KPIs */
const totalGasto=lista.reduce((s,a)=>s+Number(a.valor_total||0),0)
const totalLitros=lista.reduce((s,a)=>s+Number(a.litros||0),0)
const totalRegistros=lista.length

const ticketMedio=totalRegistros?totalGasto/totalRegistros:0
const valorMedioLitro=totalLitros?totalGasto/totalLitros:0

const kmList=lista.map(a=>Number(a.quilometragem||0)).filter(v=>v>0)
const kmRodados=kmList.length?(Math.max(...kmList)-Math.min(...kmList)):0

const custoPorKm=kmRodados?totalGasto/kmRodados:0
const consumoMedio=kmRodados&&totalLitros?kmRodados/totalLitros:0

/* 🔥 RESUMO */
boxResumo.innerHTML=`
<div class="kpi-card"><span>Total gasto</span><strong>${moeda(totalGasto)}</strong></div>
<div class="kpi-card"><span>Litros</span><strong>${numero(totalLitros,2)}</strong></div>
<div class="kpi-card"><span>Abastecimentos</span><strong>${totalRegistros}</strong></div>
<div class="kpi-card"><span>Ticket médio</span><strong>${moeda(ticketMedio)}</strong></div>
<div class="kpi-card"><span>Valor médio/L</span><strong>${moeda(valorMedioLitro)}</strong></div>
<div class="kpi-card"><span>KM rodados</span><strong>${numero(kmRodados,0)}</strong></div>
<div class="kpi-card"><span>Custo/KM</span><strong>${moeda(custoPorKm)}</strong></div>
<div class="kpi-card"><span>Consumo KM/L</span><strong>${numero(consumoMedio,2)}</strong></div>
`

/* 🔥 SEM DADOS */
if(!lista.length){
boxTabela.className="lista-vazia"
boxTabela.textContent="Nenhum dado para relatório."
return
}

/* 🔥 AGRUPADO POR VEÍCULO */
const mapa={}

lista.forEach(a=>{
const id=String(a.veiculo_id)
if(!mapa[id])mapa[id]=[]
mapa[id].push(a)
})

const cards=Object.keys(mapa).map(id=>{
const grupo=mapa[id]
const v=window.APP_STATE.veiculos.find(x=>String(x.id)===id)

const gasto=grupo.reduce((s,a)=>s+Number(a.valor_total||0),0)
const litros=grupo.reduce((s,a)=>s+Number(a.litros||0),0)

return `
<div class="item-lista">
<div class="item-lista-topo">
<h4>${v?`${v.placa} • ${v.marca||""} ${v.modelo||""}`:"Veículo"}</h4>
<span class="tag ok">${grupo.length} abastecimento(s)</span>
</div>
<div class="mini">Gasto: ${moeda(gasto)} • Litros: ${numero(litros,2)}</div>
</div>
`
}).join("")

/* 🔥 TABELA */
const linhas=lista.map(a=>{
const v=window.APP_STATE.veiculos.find(x=>String(x.id)===String(a.veiculo_id))

return `
<tr>
<td>${dataBR(a.data_abastecimento)}</td>
<td>${v?v.placa:"-"}</td>
<td>${a.posto||"-"}</td>
<td>${a.tipo_combustivel||"-"}</td>
<td>${numero(a.litros,2)}</td>
<td>${moeda(a.valor_litro)}</td>
<td>${moeda(a.valor_total)}</td>
<td>${a.quilometragem||"-"}</td>
</tr>
`
}).join("")

boxTabela.className=""
boxTabela.innerHTML=`
<div class="bloco" style="padding:0;border:none;background:transparent;">
<div style="display:grid;gap:10px;margin-bottom:12px;">
${cards}
</div>
<div style="overflow:auto;">
<table class="tabela">
<thead>
<tr>
<th>Data</th>
<th>Veículo</th>
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

window.renderizarRelatorios=renderizarRelatorios

})()
