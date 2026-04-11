(function(){

/* ====================================================001 – SAFE STATE==================================================== */
if(!window.APP_STATE)window.APP_STATE={}

/* ====================================================002 – ELEMENTOS==================================================== */
const btnAbrir=document.getElementById("btnAbrirCamera")
const btnCapturar=document.getElementById("btnCapturarNota")
const btnFechar=document.getElementById("btnFecharCamera")
const btnEnviar=document.getElementById("btnEnviarParaAbastecimento")

btnAbrir?.addEventListener("click",abrirCamera)
btnCapturar?.addEventListener("click",capturarNota)
btnFechar?.addEventListener("click",fecharCamera)
btnEnviar?.addEventListener("click",enviarParaAbastecimento)

/* ====================================================003 – DATA AGORA==================================================== */
function agoraInput(){
const agora=new Date()
return new Date(agora.getTime()-agora.getTimezoneOffset()*60000)
.toISOString().slice(0,16)
}

/* ====================================================004 – ABRIR CAMERA==================================================== */
async function abrirCamera(){

const video=document.getElementById("cameraPreview")

if(!video){
window.toast("Elemento de vídeo não encontrado")
return
}

if(!navigator.mediaDevices?.getUserMedia){
window.toast("Câmera não suportada")
return
}

try{

fecharCamera()

const stream=await navigator.mediaDevices.getUserMedia({
video:{facingMode:{ideal:"environment"}},
audio:false
})

window.APP_STATE.streamCamera=stream
video.srcObject=stream

window.toast("Câmera aberta")

}catch(e){
console.error(e)
window.toast("Erro ao abrir câmera")
}

}

/* ====================================================005 – FECHAR CAMERA==================================================== */
function fecharCamera(){

const stream=window.APP_STATE?.streamCamera

if(stream){
stream.getTracks().forEach(t=>t.stop())
window.APP_STATE.streamCamera=null
}

const video=document.getElementById("cameraPreview")
if(video)video.srcObject=null

}

/* ====================================================006 – CAPTURAR==================================================== */
function capturarNota(){

const video=document.getElementById("cameraPreview")
const canvas=document.getElementById("canvasNota")

if(!video||!canvas||!video.videoWidth){
window.toast("Abra a câmera antes")
return
}

canvas.width=video.videoWidth
canvas.height=video.videoHeight

const ctx=canvas.getContext("2d")
ctx.drawImage(video,0,0,canvas.width,canvas.height)

/* 🔥 DEMO OCR */
const textoDemo=`POSTO EXEMPLO LTDA
CNPJ 12.345.678/0001-99
DATA 30/03/2026 19:35
GASOLINA COMUM
35,220 L x 5,690
TOTAL R$ 200,39`

const dados=extrairCampos(textoDemo)

/* 🔥 SAFE SET */
setValor("notaPosto",dados.posto)
setValor("notaCnpj",dados.cnpj)
setValor("notaData",dados.data||agoraInput())
setValor("notaLitros",dados.litros)
setValor("notaValorTotal",dados.valorTotal)
setValor("notaValorLitro",dados.valorLitro)

window.toast("Nota capturada")

}

/* ====================================================007 – SET SAFE==================================================== */
function setValor(id,valor){
const el=document.getElementById(id)
if(el)el.value=valor||""
}

/* ====================================================008 – EXTRAIR DADOS==================================================== */
function extrairCampos(texto){

const dados={
posto:"",
cnpj:"",
data:"",
litros:"",
valorTotal:"",
valorLitro:""
}

const linhas=texto.split(/\n+/).map(x=>x.trim()).filter(Boolean)

if(linhas.length)dados.posto=linhas[0]

const cnpj=texto.match(/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/)
if(cnpj)dados.cnpj=cnpj[0]

const data=texto.match(/(\d{2}\/\d{2}\/\d{4})\s*(\d{2}:\d{2})?/)
if(data){
const [dia,mes,ano]=data[1].split("/")
dados.data=data[2]?`${ano}-${mes}-${dia}T${data[2]}`:agoraInput()
}

const litros=texto.match(/(\d+[\.,]\d{2,3})\s*L/i)
if(litros)dados.litros=litros[1].replace(",", ".")

const valores=[...texto.matchAll(/(\d+[\.,]\d{2,3})/g)]
.map(x=>x[1].replace(",", "."))

if(valores.length>=2){
dados.valorLitro=valores[valores.length-2]
dados.valorTotal=valores[valores.length-1]
}

return dados

}

/* ====================================================009 – ENVIAR==================================================== */
function enviarParaAbastecimento(){

const dados={
posto:getValor("notaPosto"),
cnpj:getValor("notaCnpj"),
data:getValor("notaData")||agoraInput(),
litros:getValor("notaLitros").replace(",","."),
valorTotal:getValor("notaValorTotal").replace(",","."),
valorLitro:getValor("notaValorLitro").replace(",",".")
}

window.preencherAbastecimentoPorNota?.(dados)

window.toast("Dados enviados")

}

/* ====================================================010 – GET SAFE==================================================== */
function getValor(id){
return document.getElementById(id)?.value||""
}

/* ====================================================011 – AUTO CLEAN==================================================== */
document.addEventListener("visibilitychange",()=>{
if(document.hidden)fecharCamera()
})

window.addEventListener("beforeunload",fecharCamera)

})()
