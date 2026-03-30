(function(){
const filtroVeiculo=document.getElementById("filtroRelatorioVeiculo")
const filtroPeriodo=document.getElementById("filtroRelatorioPeriodo")
filtroVeiculo?.addEventListener("change",renderizarRelatorios)
filtroPeriodo?.addEventListener("change",renderizarRelatorios)
function renderizarRelatorios(){
const boxResumo=document.getElementById("painelRelatorioResumo")
const boxTabe
