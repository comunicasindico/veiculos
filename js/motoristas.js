(function(){
const form=document.getElementById("formMotorista")
const busca=document.getElementById("buscaMotorista")
form?.addEventListener("submit",salvarMotorista)
busca?.addEventListener("input",renderizarMotoristas)
function salvarMotorista(e){
e.preventDefault()
const nome=document.getElementById("nomeMotorista")?.value?.trim()||""
if(!nome){window.toast("Informe o nome do motorista");return}
const item={
id:window.Utils.gerarId(),
nome,
cpf:document.getElementById("cpfMotorista")?.value?.trim()||"",
numeroCnh:document.getElementById("numeroCnh")?.value?.trim()||"",
categoriaCnh:document.getElementById("categoriaCnh")?.value||"",
validadeCnh:document.getElementById("validadeCnh")?.value||"",
telefone:document.getElementById("telefoneMotorista")?.value?.trim()||"",
email:document.getElementById("emailMotorista")?.value?.trim()||"",
veiculoPrincipalId:document.getElementById("veiculoPrincipalMotorista")?.value||"",
observacoes:document.getElementById("observacoesMotorista")?.value?.trim()||"",
createdAt:new Date().toISOString()
}
window.APP_STATE.motoristas.unshift(item)
window.salvarDadosLocal()
form.reset()
renderizarMotoristas()
window.renderizarAbastecimentos?.()
window.renderizarAlertas?.()
window.atualizarDashboard()
window.toast("Motorista salvo com sucesso")
}
function renderizarMotoristas(){
const box=document.getElementById("listaMotoristas")
if(!box)return
window.atualizarSelectsVeiculos?.()
atualizarSelectMotoristas()
const termo=window.Utils.normalizar(document.getElementById("buscaMotorista")?.value||"")
const lista=window.APP_STATE.motoristas.filter(m=>{
if(!termo)return true
const base=`${m.nome} ${m.cpf} ${m.numeroCnh}`
return window.Utils.normalizar(base).includes(termo)
})
if(!lista.length){
box.className="lista-vazia"
box.textContent="Nenhum motorista cadastrado."
return
}
box.className=""
box.innerHTML=lista.map(m=>{
const veiculo=window.APP_STATE.veiculos.find(v=>v.id===m.veiculoPrincipalId)
return `
<div class="item-lista">
<div class="item-lista-topo">
<h4>${m.nome}</h4>
<div>
<button class="btn btn-secundario" onclick="removerMotorista('${m.id}')">Excluir</button>
</div>
</div>
<div>
${m.categoriaCnh?`<span class="tag">CNH ${m.categoriaCnh}</span>`:""}
${m.validadeCnh?`<span class="tag ${classificarValidade(m.validadeCnh)}">Validade ${window.Utils.formatarData(m.validadeCnh)}</span>`:""}
${veiculo?`<span class="tag">${veiculo.placa}</span>`:""}
</div>
<div class="mini">CPF: ${m.cpf||"-"} • CNH: ${m.numeroCnh||"-"}</div>
<div class="mini">Telefone: ${m.telefone||"-"} • E-mail: ${m.email||"-"}</div>
${m.observacoes?`<div class="mini">Obs.: ${m.observacoes}</div>`:""}
</div>
`
}).join("")
}
function classificarValidade(data){
const dias=window.Utils.diasPara(data)
if(dias===null)return""
if(dias<0)return"danger"
if(dias<=30)return"warn"
return"ok"
}
function atualizarSelectMotoristas(){
const select=document.getElementById("motoristaAbastecimento")
if(!select)return
const valorAtual=select.value
select.innerHTML='<option value="">Selecione</option>'+window.APP_STATE.motoristas.map(m=>`<option value="${m.id}">${m.nome}</option>`).join("")
if([...select.options].some(o=>o.value===valorAtual))select.value=valorAtual
}
window.removerMotorista=function(id){
if(!confirm("Deseja excluir este motorista?"))return
window.APP_STATE.motoristas=window.APP_STATE.motoristas.filter(m=>m.id!==id)
window.APP_STATE.abastecimentos=window.APP_STATE.abastecimentos.map(a=>a.motoristaId===id?{...a,motoristaId:""}:a)
window.salvarDadosLocal()
renderizarMotoristas()
window.renderizarAbastecimentos?.()
window.renderizarAlertas?.()
window.atualizarDashboard()
window.toast("Motorista excluído")
}
window.renderizarMotoristas=renderizarMotoristas
window.atualizarSelectMotoristas=atualizarSelectMotoristas
})()
