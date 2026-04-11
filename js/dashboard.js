/* ====================================================060 – MÉTRICAS==================================================== */
function calcularMetricas(){

const lista=(window.APP_STATE?.abastecimentos||[]).slice()

if(!lista.length){
return{total:0,litros:0,km:0,consumo:0}
}

/* 🔥 ORDENA POR DATA */
lista.sort((a,b)=>new Date(a.data_abastecimento||0)-new Date(b.data_abastecimento||0))

let total=0
let litros=0

lista.forEach(a=>{
total+=Number(a.valor_total||0)
litros+=Number(a.litros||0)
})

/* 🔥 KM REAL */
const kms=lista
.map(a=>Number(a.quilometragem||0))
.filter(v=>v>0)

let km=0

if(kms.length>=2){
km=Math.max(...kms)-Math.min(...kms)
}

/* 🔥 CONSUMO */
const consumo=litros&&km?km/litros:0

return{total,litros,km,consumo}

}

/* ====================================================061 – KPIs==================================================== */
function atualizarKPIsFinanceiros(){

const v=window.APP_STATE?.veiculos||[]
const m=window.APP_STATE?.motoristas||[]
const a=window.APP_STATE?.abastecimentos||[]

const elV=document.getElementById("kpiVeiculos")
const elM=document.getElementById("kpiMotoristas")
const elA=document.getElementById("kpiAbastecimentos")

/* 🔥 PROTEÇÃO CONTEXTO */
const isAdmin=window.CONTEXTO?.isAdmin

if(elV)elV.textContent=v.length
if(elM)elM.textContent=isAdmin?m.length:v.length
if(elA)elA.textContent=a.length

/* 🔥 MÉTRICAS */
const mCalc=calcularMetricas()

const elTotal=document.getElementById("kpiCustoTotal")
const elConsumo=document.getElementById("kpiConsumo")

if(elTotal)elTotal.textContent=window.Utils.moeda(mCalc.total)
if(elConsumo)elConsumo.textContent=mCalc.consumo?mCalc.consumo.toFixed(2)+" km/l":"0 km/l"

}

/* ====================================================062 – DASHBOARD GLOBAL==================================================== */
function atualizarDashboardInteligente(){
atualizarKPIsFinanceiros()
}

/* ====================================================063 – AUTO UPDATE==================================================== */
document.addEventListener("DOMContentLoaded",()=>{
setTimeout(()=>{
window.atualizarDashboardInteligente?.()
},200)
})

window.atualizarDashboardInteligente=atualizarDashboardInteligente
