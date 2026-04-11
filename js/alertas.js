(function(){

/* ====================================================001 – CALCULAR DIAS==================================================== */
function diasPara(data){
if(!data)return null

const hoje=new Date()

/* 🔥 GARANTE FORMATO ISO */
const dt=new Date(data.length<=10 ? data+"T00:00:00" : data)

if(isNaN(dt))return null

const diff=(dt-hoje)/86400000
return Math.floor(diff)
}

/* ====================================================002 – GERAR ALERTAS==================================================== */
function gerarAlertas(){

const alertas=[]

const veiculos=window.APP_STATE?.veiculos||[]

veiculos.forEach(v=>{

const diasIpva=diasPara(v.vencimentoIpva)
const diasLic=diasPara(v.vencimentoLicenciamento)

/* 🚗 IPVA */
if(diasIpva!==null&&diasIpva<=30){
alertas.push({
tipo:diasIpva<0?"danger":"warn",
titulo:`IPVA ${v.placa}`,
detalhe:diasIpva<0
?`Vencido há ${Math.abs(diasIpva)} dia(s)`
:`Vence em ${diasIpva} dia(s)`
})
}

/* 🚗 LICENCIAMENTO */
if(diasLic!==null&&diasLic<=30){
alertas.push({
tipo:diasLic<0?"danger":"warn",
titulo:`Licenciamento ${v.placa}`,
detalhe:diasLic<0
?`Vencido há ${Math.abs(diasLic)} dia(s)`
:`Vence em ${diasLic} dia(s)`
})
}

})

/* 🔥 ORDENA */
return alertas.sort((a,b)=>{
const ordem={danger:0,warn:1}
return ordem[a.tipo]-ordem[b.tipo]
})

}

/* ====================================================003 – RENDER==================================================== */
function renderizarAlertas(){

const box=document.getElementById("listaAlertas")
if(!box)return

const lista=gerarAlertas()

/* 🔥 KPI */
const elKpi=document.getElementById("kpiAlertas")
if(elKpi)elKpi.textContent=lista.length

if(!lista.length){
box.className="lista-vazia"
box.textContent="Nenhum alerta encontrado."
return
}

box.className=""

box.innerHTML=lista.map(a=>`
<div class="item-lista">
<div class="item-lista-topo">
<h4>${a.titulo}</h4>
<span class="tag ${a.tipo}">
${a.tipo==="danger"?"Urgente":"Atenção"}
</span>
</div>
<div class="mini">${a.detalhe}</div>
</div>
`).join("")

}

/* ====================================================004 – EXPORT==================================================== */
window.gerarAlertas=gerarAlertas
window.renderizarAlertas=renderizarAlertas

})()
