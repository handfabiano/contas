// Módulo de Relatórios Simplificado - Usando API PHP

function renderRelatoriosPage() {
    return `
        <h2>Relatórios Financeiros</h2>

        <div class="filtros">
            <h3>Filtros</h3>
            <div class="filtros-group">
                <div class="form-group">
                    <label for="relatorioMes">Mês</label>
                    <input type="month" id="relatorioMes" onchange="carregarRelatorios()">
                </div>
            </div>
        </div>

        <div id="relatoriosLoading" class="loading hidden">Carregando relatórios...</div>
        <div id="relatoriosContent"></div>
    `;
}

function initRelatorios() {
    setMesAtual();
    carregarRelatorios();
}

async function carregarRelatorios() {
    const loading = document.getElementById('relatoriosLoading');
    const content = document.getElementById('relatoriosContent');

    loading.classList.remove('hidden');
    content.innerHTML = '';

    try {
        const mes = document.getElementById('relatorioMes')?.value || null;
        const filtros = mes ? { mes } : {};

        // Busca dados do dashboard
        const response = await api.dashboard(mes);

        if (!response.success) {
            throw new Error(response.message || 'Erro ao carregar relatórios');
        }

        const dados = response.data;

        content.innerHTML = `
            <div class="relatorio-grid">
                <div class="relatorio-card">
                    <h3>Total Pendente</h3>
                    <div class="valor">R$ ${formatarValor(dados.total_pendente || 0)}</div>
                </div>

                <div class="relatorio-card" style="background: linear-gradient(135deg, #00d084 0%, #00a86b 100%);">
                    <h3>Total Pago</h3>
                    <div class="valor">R$ ${formatarValor(dados.total_pago || 0)}</div>
                </div>

                <div class="relatorio-card" style="background: linear-gradient(135deg, #f5576c 0%, #d63447 100%);">
                    <h3>Total Atrasado</h3>
                    <div class="valor">R$ ${formatarValor(dados.total_atrasado || 0)}</div>
                </div>
            </div>

            ${dados.por_tipo && dados.por_tipo.length > 0 ? `
                <h3>Por Tipo de Despesa</h3>
                <div class="contas-list">
                    ${dados.por_tipo.map(tipo => `
                        <div class="conta-item">
                            <div class="conta-header">
                                <div class="conta-descricao">${formatarTipoDespesa(tipo.tipo_despesa)}</div>
                                <div class="conta-valor">R$ ${formatarValor(tipo.total)}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        `;
    } catch (error) {
        console.error('Erro ao carregar relatórios:', error);
        content.innerHTML = `<p style="text-align:center;color:red;padding:20px;">Erro ao carregar relatórios: ${error.message}</p>`;
    } finally {
        loading.classList.add('hidden');
    }
}
