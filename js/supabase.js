/* ====================================================001 – CONFIG==================================================== */
window.SUPABASE_URL="https://gspdlrenyrzbkxlvyugc.supabase.co"
window.SUPABASE_KEY="sb_publishable_MQRr8O1saGmGz3nsMg1g-Q_8ZIK6yrw"

/* ====================================================002 – INIT CLIENT==================================================== */
(function(){

if(window.db){
console.log("Supabase já inicializado")
return
}

if(!window.supabase){
console.warn("Supabase não carregado – modo offline ativado")
window.db=null
return
}

try{

window.db=window.supabase.createClient(
window.SUPABASE_URL,
window.SUPABASE_KEY,
{
auth:{persistSession:false},
global:{headers:{"x-app":"veiculos-saas"}}
}
)

console.log("Supabase conectado")

}catch(e){

console.error("Erro ao iniciar Supabase:",e)
window.db=null

}

})()
