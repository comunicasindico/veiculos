(function(){
const btnAbrir=document.getElementById("btnAbrirCamera")
const btnCapturar=document.getElementById("btnCapturarNota")
const btnFechar=document.getElementById("btnFecharCamera")
const btnEnviar=document.getElementById("btnEnviarParaAbastecimento")
btnAbrir?.addEventListener("click",abrirCamera)
btnCapturar?.addEventListener("click",capturarNota)
btnFechar?.addEventListener("click",fecharCamera)
btnEnviar?.addEventListener("click",enviarParaAbastecimento)
async function abrirCamera(){
const video=document.getElementById("cameraPreview")
if(!navigator.mediaDevices?.getUserMedia){window.toast("Câmera não suportada neste dispositivo");return}
try{
fecharCamera()
const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"}},audio:false})
window.APP_STATE.streamCamera=stream
video.srcObject=stream
window.toast("Câmera aberta")
}catch{
window.toast("Não foi possível abrir a câmera")
}
}
function fecharCamera(){
const stream=window.APP_STATE.streamCamera
if(stream){
stream.getTracks().forEach(t=>t.stop())
window.APP_STATE.streamCamera=null
}
const video=document.getElementById("cameraPreview")
if(video)video.srcObject=null
}
function capturarNota(){
const video=document.getElementById("cameraPreview")
const canvas=document.getElementById("canvasNota")
if(!video||!canvas||!video.videoWidth){window.toast("Abra a câmera antes de capturar");return}
canvas.width=video.videoWidth
canvas.height=video.videoHeight
const ctx=canvas.getContext("2d")
ctx.drawImage(video,0,0,canvas.width,canvas.height)
const textoDemo=`POSTO EXEMPLO LTDA\nCNPJ 12.345.678/0001-99\nDATA 30/03/2026 19:35\nGASOLINA COMUM\n35,220 L x 5,690\nTOTAL R$ 200,39`
document.getElementById("textoOCR").value=textoDemo
const dados=extrairCamposBasicos(textoDemo)
document.getElementById("notaPosto").value=dados.posto||""
document.getElementById("notaCnpj").value=dados.cnpj||""
document.getElementById("notaData").value=dados.dataTexto||""
document.getElementById("notaLitros").value=dados.litros||""
document.getElementById("notaValorTotal").value=dados.valorTotal||""
document.getElementById("notaValorLitro").value=dados.valorLitro||""
window.toast("Nota capturada. OCR demonstrativo preenchido")
}
function extrairCamposBasicos(texto){
const dados={posto:"",cnpj:"",dataTexto:"",litros:"",valorTotal:"",valorLitro:"",data:""}
const linhas=(texto||"").split(/\n+/).map(x=>x.trim()).filter(Boolean)
if(linhas.length)dados.posto=linhas[0]
const cnpj=texto.match(/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/)
if(cnpj)dados.cnpj=cnpj[0]
const data=texto.match(/(\d{2}\/\d{2}\/\d{4})\s*(\d{2}:\d{2})?/)
if(data){
dados.dataTexto=data[0]
if(data[2]){
const [dia,mes,ano]=data[1].split("/")
dados.data=`${ano}-${mes}-${dia}T${data[2]}`
}
}
const litros=texto.match(/(\d+[\.,]\d{2,3})\s*L/i)
if(litros)dados.litros=litros[1].replace(",",".")
const valores=[...texto.matchAll(/(\d+[\.,]\d{2,3})/g)].map(x=>x[1].replace(",","."))
if(valores.length>=2){
dados.valorLitro=valores[valores.length-2]
dados.valorTotal=valores[valores.length-1]
}
return dados
}
function enviarParaAbastecimento(){
const dados={
posto:document.getElementById("notaPosto")?.value||"",
cnpj:document.getElementById("notaCnpj")?.value||"",
data:document.getElementById("notaData")?.value&&document.getElementById("notaData").value.includes("/")?window.Utils.agoraInputDateTime():document.getElementById("notaData")?.value||window.Utils.agoraInputDateTime(),
litros:document.getElementById("notaLitros")?.value?.replace(",", ".")||"",
valorTotal:document.getElementById("notaValorTotal")?.value?.replace(",", ".")||"",
valorLitro:document.getElementById("notaValorLitro")?.value?.replace(",", ".")||""
}
window.preencherAbastecimentoPorNota?.(dados)
}
window.addEventListener("beforeunload",fecharCamera)
})()
