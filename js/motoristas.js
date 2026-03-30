(function(){
const form=document.getElementById("formMotorista")
const busca=document.getElementById("buscaMotorista")
form?.addEventListener("submit",salvarMotorista)
busca?.addEventListener("input",renderizarMotoristas)

async function salvarMotorista(e){
e.preventDefault()
const nome=document.getElementById("nomeMotorista")?.value?.trim()||""
if(!nome){window.toast("Informe o nome do motorista");return}

const item={
nome,
cpf:document.getElementById("cpfMotorista")?.value?.trim()||"",
numero_cnh:document.getElementById("numeroCnh")?.value?.trim()||"",
categoria_cnh:document.getElementById("categoriaCnh")?.value||"",
validade_cnh:document.getElementById("validadeCnh")?.value||null,
telefone:document.getElementById("telefoneMotorista")?.value?.trim()||"",
email:document.getElementById("emailMotorista")?.value?.trim()||"",
veiculo_principal_id:document.getElementById("veiculoPrincipalMotorista")?.value||null,
observacoes:document.getElementById("observacoesMotorista")?.value?.trim()||"",
updated_at:new Date().toISOString()
}

if(window.db){
const {data,error}=await window.db.from("motoristas").insert(item).select().single()
if(error){console.error(error);window.toast("Erro ao salvar motorista");return}
window.APP_STATE.motoristas.unshift(data)
}else{
item.id=window.Utils.gerarId()
item.created_at=new Date().toISOString()
window.APP_STATE.motoristas.unshift(item)
window.salvarDadosLocal()
}

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
const base=`${m.nome} ${m.cpf} ${m.numero_cnh}`
return window.Utils.normalizar(base).includes(termo)
})
if(!lista.length){
box.className="lista-vazia"
box.textContent="Nenhum motorista cadastrado."
return
}
box.className=""
box.innerHTML=lista.map(m=>{
const veiculo=window.APP_STATE.veiculos.find(v=>v.id===m.veiculo_principal_id)
return `
<div class="item-lista">
<div class="item-lista-topo">
<h4>${m.nome}</h4>
<div>
<button class="btn btn-secundario" onclick="removerMotorista('${m.id}')">Excluir</button>
</div>
</div>
<div>
${m.categoria_cnh?`<span class="tag">CNH ${m.categoria_cnh}</span>`:""}
${m.validade_cnh?`<span class="tag ${classificarValidade(m.validade_cnh)}">Validade ${window.Utils.formatarData(m.validade_cnh)}</span>`:""}
${veiculo?`<span class="tag">${veiculo.placa}</span>`:""}
</div>
<div class="mini">CPF: ${m.cpf||"-"} • CNH: ${m.numero_cnh||"-"}</div>
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

window.removerMotorista=async function(id){
if(!confirm("Deseja excluir este motorista?"))return
if(window.db){
const {error}=await window.db.from("motoristas").delete().eq("id",id)
if(error){console.error(error);window.toast("Erro ao excluir motorista");return}
}else{
window.salvarDadosLocal()
}
window.APP_STATE.motoristas=window.APP_STATE.motoristas.filter(m=>m.id!==id)
window.APP_STATE.abastecimentos=window.APP_STATE.abastecimentos.map(a=>a.motorista_id===id?{...a,motorista_id:null}:a)
renderizarMotoristas()
window.renderizarAbastecimentos?.()
window.renderizarAlertas?.()
window.atualizarDashboard()
window.toast("Motorista excluído")
}

window.renderizarMotoristas=renderizarMotoristas
window.atualizarSelectMotoristas=atualizarSelectMotoristas
})()
