// App Principal

const pages = {
    lancamento: renderLancamentoPage,
    contas: renderContasPage,
    fundos: renderFundosPage,
    relatorios: renderRelatoriosPage,
    config: renderConfigPage
};

const pageInits = {
    lancamento: initLancamentos,
    contas: initContas,
    fundos: initFundos,
    relatorios: initRelatorios,
    config: () => {} // Sem configuração necessária
};

let appIniciado = false;

// Chamado pelo js/auth.js assim que houver uma sessão autenticada
function iniciarApp() {
    if (appIniciado) return;
    appIniciado = true;

    loadPage('lancamento');
    registerServiceWorker();
}

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
        <h2>Configurações e Informações</h2>

        <div id="alertConfig"></div>

        <div class="config-section">
            <h3>Status da Conexão</h3>
            <p>Teste a conexão com o Supabase:</p>
            <button class="btn btn-success" onclick="testarConexaoAPI()">Testar Conexão</button>
            <div id="statusConexao" style="margin-top:15px;"></div>
        </div>

        <div class="config-section">
            <h3>Sobre o Sistema</h3>
            <p><strong>Versão:</strong> 3.0.0 (Supabase + Mobile-First)</p>
            <p><strong>Backend:</strong> Supabase (Postgres)</p>
            <p><strong>Frontend:</strong> PWA (Progressive Web App)</p>
        </div>

        <div class="config-section">
            <h3>Conta</h3>
            <button class="btn btn-danger" onclick="sair()">Sair</button>
        </div>

        <div class="config-section">
            <h3>Recursos</h3>
            <ul style="line-height:2;">
                <li>✅ Lançamento de contas individuais e recorrentes</li>
                <li>✅ Filtros avançados por status, tipo e período</li>
                <li>✅ Relatórios e dashboard financeiro</li>
                <li>✅ Interface otimizada para mobile (touch-friendly)</li>
                <li>✅ Funciona offline (PWA com cache)</li>
            </ul>
        </div>

    `;
}

async function testarConexaoAPI() {
    const status = document.getElementById('statusConexao');
    status.innerHTML = '<p>Testando conexão...</p>';

    try {
        const result = await api.testarConexao();

        if (result.success) {
            status.innerHTML = '<div class="alert alert-success">✅ Conexão estabelecida com sucesso!</div>';
        } else {
            status.innerHTML = `<div class="alert alert-danger">❌ Erro na conexão: ${result.error}</div>`;
        }
    } catch (error) {
        status.innerHTML = `<div class="alert alert-danger">❌ Erro ao testar: ${error.message}<br><br><small>Verifique se o backend está configurado corretamente.</small></div>`;
    }
}
