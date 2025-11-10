// App Principal

const pages = {
    lancamento: renderLancamentoPage,
    contas: renderContasPage,
    relatorios: renderRelatoriosPage,
    config: renderConfigPage
};

const pageInits = {
    lancamento: initLancamentos,
    contas: initContas,
    relatorios: initRelatorios,
    config: initConfig
};

document.addEventListener('DOMContentLoaded', function() {
    carregarConfiguracao();
    loadPage('lancamento');
    registerServiceWorker();
});

function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
            .then(() => console.log('Service Worker registrado'))
            .catch(err => console.log('Erro ao registrar Service Worker:', err));
    }
}

function openTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');

    loadPage(tabName);
}

function loadPage(pageName) {
    const container = document.getElementById(pageName);
    
    if (pages[pageName]) {
        container.innerHTML = pages[pageName]();
        
        if (pageInits[pageName]) {
            pageInits[pageName]();
        }
    }
}

function renderConfigPage() {
    return `
        <h2>Configurações do Supabase</h2>
        
        <div id="alertConfig"></div>
        
        <div class="config-section">
            <h3>Conexão com Banco de Dados</h3>
            <p>Configure suas credenciais do Supabase abaixo:</p>
            
            <div class="form-group">
                <label for="supabaseUrl">Supabase URL</label>
                <input type="text" id="supabaseUrl" placeholder="https://supabase.zenithcompete.com">
            </div>

            <div class="form-group">
                <label for="supabaseKey">Supabase Anon Key</label>
                <input type="text" id="supabaseKey" placeholder="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc2MDcyNDYwMCwiZXhwIjo0OTE2Mzk4MjAwLCJyb2xlIjoiYW5vbiJ9.zxgH9t9aSDmd8Ltu6NBiXq_v2bo7tumvr4QwZKzlDYU">
            </div>

            <button class="btn" onclick="salvarConfig()">Salvar Configurações</button>
            <button class="btn btn-success" onclick="testarConexao()">Testar Conexão</button>
        </div>

        <div class="config-section">
            <h3>Instruções de Configuração</h3>
            <ol>
                <li>Acesse <a href="https://supabase.com" target="_blank">supabase.com</a> e crie uma conta</li>
                <li>Crie um novo projeto</li>
                <li>Vá em Settings → API</li>
                <li>Copie a URL e a anon/public key</li>
                <li>Cole as credenciais acima e clique em "Salvar Configurações"</li>
                <li>Clique em "Criar Tabela" para criar a estrutura no banco</li>
            </ol>
            
            <button class="btn btn-success" onclick="criarTabela()">Criar Tabela no Banco</button>
        </div>
    `;
}

function initConfig() {
    // Configurações já são carregadas automaticamente
}
