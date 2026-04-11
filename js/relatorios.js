(function(){

const filtroVeiculo=document.getElementById("filtroRelatorioVeiculo")
const filtroPeriodo=document.getElementById("filtroRelatorioPeriodo")

filtroVeiculo?.addEventListener("change",renderizarRelatorios)
filtroPeriodo?.addEventListener("change",renderizarRelatorios)

function renderizarRelatorios(){

const boxResumo=document.getElementById("painelRelatorioResumo")
const boxTabela=document.getElementById("tabelaRelatorio")

if(!boxResumo||!boxTabela)return

let lista=(window.APP_STATE?.abastecimentos||[])

/* 🔥 KPIs */
const total=lista.reduce((s,a)=>s+Number(a.valor_total||0),0)
const litros=lista.reduce((s,a)=>s+Number(a.litros||0),0)

boxResumo.innerHTML=`
<div class="kpi-card">Total: ${window.Utils.moeda(total)}</div>
<div class="kpi-card">Litros: ${litros}</div>
<div class="kpi-card">Qtd: ${lista.length}</div>
`

if(!lista.length){
boxTabela.innerHTML="Sem dados"
return
}

boxTabela.innerHTML=lista.map(a=>{
const v=window.APP_STATE.veiculos.find(x=>x.id===a.veiculo_id)
return `
<div class="item-lista">
${v?.placa||"-"} • ${a.posto||"-"} • ${window.Utils.moeda(a.valor_total)}
</div>
`
}).join("")

}

window.renderizarRelatorios=renderizarRelatorios

})()
