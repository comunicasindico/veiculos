/* ====================================================001 – CONFIG==================================================== */
window.SUPABASE_URL="https://gspdlrenyrzbkxlvyugc.supabase.co"
window.SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzcGRscmVueXJ6Ymt4bHZ5dWdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4ODU0NzAsImV4cCI6MjA5MDQ2MTQ3MH0.UWfkWvOh4qMDEcByVL-KZ6ejJ80V7wJlDOFH76TywaI"

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
