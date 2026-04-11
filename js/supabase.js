/* ====================================================001 – CONFIG==================================================== */
window.SUPABASE_URL="https://gspdlrenyrzbkxlvyugc.supabase.co"
window.SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzcGRscmVueXJ6Ymt4bHZ5dWdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4ODU0NzAsImV4cCI6MjA5MDQ2MTQ3MH0.UWfkWvOh4qMDEcByVL-KZ6ejJ80V7wJlDOFH76TywaI"

/* 🔥 CRIA CLIENTE CORRETAMENTE */
window.db=supabase.createClient(
window.SUPABASE_URL,
window.SUPABASE_KEY
)
