(function(){
function gerarAlertas(){
const alertas=[]
window.APP_STATE.veiculos.forEach(v=>{
const diasIpva=window.Utils.diasPara(v.vencimentoIpva)
const diasLic=window.Utils.diasPara(v.vencimentoLicenciamento)
if(diasIpva!==null&&diasIpva<=30){
alertas.push({
tipo:diasIpva<0?"danger":"warn",
titulo:`IPVA do veículo ${v.placa}`,
detalhe:diasIpva<0?`Vencido há ${Math.abs(diasIpva)} dia(s).`:`Vence em ${diasIpva} dia(s).`
})
}
if(diasLic!==null&&diasLic<=30){
alertas.push({
tipo:diasLic<0?"danger":"warn",
titulo:`Licenciamento do veículo ${v.placa}`,
detalhe:diasLic<0?`Vencido há ${Math.abs(diasLic)} dia(s).`:`Vence em ${diasLic} dia(s).`
})
}
})
window.APP_STATE.motoristas.forEach(m=>{
const diasCnh=window.Utils.diasPara(m.validadeCnh)
if(diasCnh!==null&&diasCnh<=30){
alertas.push({
tipo:diasCnh<0?"danger":"warn",
titulo:`CNH de ${m.nome}`,
detalhe:diasCnh<0?`Vencida há ${Math.abs(diasCnh)} dia(s).`:`Vence em ${diasCnh} dia(s).`
})
}
})
return alertas.sort((a,b)=>{
const ordem={danger:0,warn:1,ok:2}
return ordem[a.tipo]-ordem[b.tipo]
})
}
function renderizarAlertas(){
const box=document.getElementById("listaAlertas")
if(!box)return
const lista=gerarAlertas()
if(!lista.length){
box.className="lista-vazia"
box.textContent="Nenhum alerta encontrado."
return
}
box.className=""
box.innerHTML=lista.map(a=>`<div class="item-lista"><div class="item-lista-topo"><h4>${a.titulo}</h4><span class="tag ${a.tipo}">${a.tipo==="danger"?"Urgente":"Atenção"}</span></div><div class="mini">${a.detalhe}</div></div>`).join("")
}
window.gerarAlertas=gerarAlertas
window.renderizarAlertas=renderizarAlertas
})()
