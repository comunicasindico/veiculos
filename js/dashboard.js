/* ====================================================
070 – DASHBOARD INTELIGENTE (REAL)
==================================================== */
function calcularMetricas(){
const lista=(window.APP_STATE.abastecimentos||[]).slice()
if(!lista.length)return{total:0,litros:0,km:0,consumo:0}
let total=0
let litros=0
let km=0
let anterior=null
lista.sort((a,b)=>new Date(a.data_abastecimento||0)-new Date(b.data_abastecimento||0))
lista.forEach(a=>{
const l=Number(a.litros||0)
const v=Number(a.valor_total||0)
const k=Number(a.quilometragem||0)
total+=v
litros+=l
if(anterior!==null&&k>anterior){
km+=k-anterior
}
anterior=k
})
const consumo=litros?km/litros:0
return{total,litros,km,consumo}
}
/* ====================================================
071 – ATUALIZAR KPIs
==================================================== */
function atualizarKPIsFinanceiros(){
const m=calcularMetricas()
const elTotal=document.getElementById("kpiCustoTotal")
const elConsumo=document.getElementById("kpiConsumo")
if(elTotal)elTotal.textContent=window.Utils.moeda(m.total)
if(elConsumo)elConsumo.textContent=m.consumo?m.consumo.toFixed(2)+" km/l":"0 km/l"
}
/* ====================================================
072 – INTEGRAÇÃO GLOBAL
==================================================== */
function atualizarDashboardInteligente(){
atualizarKPIsFinanceiros()
}
window.atualizarDashboardInteligente=atualizarDashboardInteligente
