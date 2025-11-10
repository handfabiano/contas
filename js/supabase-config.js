// Configuração e gerenciamento do Supabase

let supabase = null;

function carregarConfiguracao() {
    const url = localStorage.getItem('https://supabase.zenithcompete.com');
    const key = localStorage.getItem('eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc2MDcyNDYwMCwiZXhwIjo0OTE2Mzk4MjAwLCJyb2xlIjoiYW5vbiJ9.zxgH9t9aSDmd8Ltu6NBiXq_v2bo7tumvr4QwZKzlDYU');
    
    if (url && key) {
        const urlInput = document.getElementById('supabaseUrl');
        const keyInput = document.getElementById('supabaseKey');
        if (urlInput) urlInput.value = url;
        if (keyInput) keyInput.value = key;
        inicializarSupabase(url, key);
    }
}

function salvarConfig() {
    const url = document.getElementById('supabaseUrl').value.trim();
    const key = document.getElementById('supabaseKey').value.trim();
    
    if (!url || !key) {
        mostrarAlerta('alertConfig', 'Por favor, preencha todos os campos.', 'danger');
        return;
    }
    
    localStorage.setItem('supabaseUrl', url);
    localStorage.setItem('supabaseKey', key);
    
    inicializarSupabase(url, key);
    mostrarAlerta('alertConfig', 'Configurações salvas com sucesso!', 'success');
}

function inicializarSupabase(url, key) {
    try {
        supabase = window.supabase.createClient(url, key);
        console.log('Supabase inicializado com sucesso');
    } catch (error) {
        console.error('Erro ao inicializar Supabase:', error);
        mostrarAlerta('alertConfig', 'Erro ao conectar com Supabase: ' + error.message, 'danger');
    }
}

async function testarConexao() {
    if (!supabase) {
        mostrarAlerta('alertConfig', 'Configure o Supabase primeiro!', 'warning');
        return;
    }

    try {
        const { data, error } = await supabase.from('contas_pagar').select('count');
        if (error) throw error;
        mostrarAlerta('alertConfig', 'Conexão realizada com sucesso! ✅', 'success');
    } catch (error) {
        mostrarAlerta('alertConfig', 'Erro na conexão: ' + error.message, 'danger');
    }
}

function criarTabela() {
    const sql = `
-- Criar tabela de contas a pagar
CREATE TABLE IF NOT EXISTS contas_pagar (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    descricao TEXT NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    credor TEXT NOT NULL,
    tipo_despesa TEXT NOT NULL,
    data_vencimento DATE NOT NULL,
    observacoes TEXT,
    status TEXT DEFAULT 'pendente',
    tipo_lancamento TEXT DEFAULT 'individual',
    recorrencia_id UUID,
    parcela_atual INTEGER,
    total_parcelas INTEGER,
    periodicidade TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_contas_pagar_status ON contas_pagar(status);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_data_vencimento ON contas_pagar(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_tipo_despesa ON contas_pagar(tipo_despesa);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_recorrencia ON contas_pagar(recorrencia_id);

-- Habilitar RLS
ALTER TABLE contas_pagar ENABLE ROW LEVEL SECURITY;

-- Criar política
DROP POLICY IF EXISTS "Permitir acesso total" ON contas_pagar;
CREATE POLICY "Permitir acesso total" ON contas_pagar FOR ALL USING (true) WITH CHECK (true);
    `;

    mostrarAlerta('alertConfig', 
        'Execute o SQL abaixo no SQL Editor do Supabase:<br><br>' +
        '<textarea readonly style="width:100%;height:300px;font-family:monospace;font-size:12px;">' + 
        sql + 
        '</textarea><br><br>' +
        'Ou copie e execute manualmente no seu projeto Supabase.', 
        'warning');
}
