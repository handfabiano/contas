// Configuração do cliente Supabase
// Schema aplicado via supabase/migrations/20260709120000_contas_pagar_schema.sql

const SUPABASE_URL = 'https://effrfbdwumayweycfuid.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_GFTCjJtdbkGoACBNjrBh-Q_aHa9FKzN';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
