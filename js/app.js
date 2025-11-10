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
    config: () => {} // Sem configuração necessária
};

document.addEventListener('DOMContentLoaded', function() {
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
        <h2>Configurações e Informações</h2>

        <div id="alertConfig"></div>

        <div class="config-section">
            <h3>Status da Conexão</h3>
            <p>Teste a conexão com o backend PHP/MySQL:</p>
            <button class="btn btn-success" onclick="testarConexaoAPI()">Testar Conexão API</button>
            <div id="statusConexao" style="margin-top:15px;"></div>
        </div>

        <div class="config-section">
            <h3>Sobre o Sistema</h3>
            <p><strong>Versão:</strong> 2.0.0 (MySQL + Mobile-First)</p>
            <p><strong>Backend:</strong> PHP + MySQL</p>
            <p><strong>Frontend:</strong> PWA (Progressive Web App)</p>
            <p><strong>Última atualização:</strong> Novembro 2025</p>
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

        <div class="config-section">
            <h3>Instruções</h3>
            <ol>
                <li>Configure o banco MySQL executando <code>setup-mysql.sql</code></li>
                <li>Edite as credenciais em <code>/api/config.php</code></li>
                <li>Acesse o sistema e comece a usar!</li>
                <li>Consulte o <code>README.md</code> para mais informações</li>
            </ol>
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
