// Módulo de Prestação de Contas (Fundos / Caixas)

function renderFundosPage() {
    return `
        <h2>Prestação de Contas</h2>
        <p class="info-text">Cada fundo é um dinheiro específico que você recebeu. Abra um fundo para ver a entrada, as saídas e o saldo.</p>

        <div id="alertFundos"></div>

        <div class="filtros">
            <div class="filtros-group">
                <div class="form-group">
                    <label for="fundoFiltroStatus">Status</label>
                    <select id="fundoFiltroStatus" onchange="carregarFundos()">
                        <option value="">Todos</option>
                        <option value="aberto">Abertos</option>
                        <option value="encerrado">Encerrados</option>
                    </select>
                </div>
            </div>
        </div>

        <div id="fundosLoading" class="loading hidden">Carregando fundos...</div>
        <div id="fundosList" class="contas-list"></div>

        <!-- Detalhe da prestação de contas de um fundo -->
        <div id="fundoDetalhe" class="hidden"></div>
    `;
}

function initFundos() {
    carregarFundos();
}

async function carregarFundos() {
    const loading = document.getElementById('fundosLoading');
    const list = document.getElementById('fundosList');
    const detalhe = document.getElementById('fundoDetalhe');

    // Esconde detalhe ao voltar para a lista
    detalhe.classList.add('hidden');
    detalhe.innerHTML = '';
    list.classList.remove('hidden');
    loading.classList.remove('hidden');
    list.innerHTML = '';

    try {
        const filtros = {};
        const status = document.getElementById('fundoFiltroStatus')?.value;
        if (status) filtros.status = status;

        const response = await api.listarFundos(filtros);
        if (!response.success) {
            throw new Error(response.message || 'Erro ao carregar fundos');
        }

        const fundos = (response.data && response.data.fundos) ? response.data.fundos : [];

        if (fundos.length === 0) {
            list.innerHTML = '<p style="text-align:center;color:#666;padding:40px;">Nenhum fundo ainda. Registre uma entrada na aba "Novo Lançamento".</p>';
        } else {
            list.innerHTML = fundos.map(renderizarFundoCard).join('');
        }
    } catch (error) {
        console.error('Erro ao carregar fundos:', error);
        list.innerHTML = `<p style="text-align:center;color:red;padding:20px;">Erro ao carregar fundos: ${error.message}</p>`;
    } finally {
        loading.classList.add('hidden');
    }
}

function renderizarFundoCard(fundo) {
    const saldo = parseFloat(fundo.saldo);
    const saldoClasse = saldo < 0 ? 'status-atrasado' : 'status-pago';

    return `
        <div class="conta-item" onclick="abrirFundo(${fundo.id})" style="cursor:pointer;">
            <div class="conta-header">
                <div class="conta-descricao">${fundo.descricao}</div>
                <div class="conta-valor">R$ ${formatarValor(fundo.valor_entrada)}</div>
            </div>
            <span class="status-badge ${saldoClasse}">Saldo: R$ ${formatarValor(saldo)}</span>
            <div class="conta-info">
                <div class="conta-info-item"><strong>Fonte:</strong> ${fundo.fonte}</div>
                <div class="conta-info-item"><strong>Entrada:</strong> ${formatarData(fundo.data_entrada)}</div>
                <div class="conta-info-item"><strong>Gasto:</strong> R$ ${formatarValor(fundo.total_saidas)} (${fundo.qtd_saidas} saída${fundo.qtd_saidas == 1 ? '' : 's'})</div>
                <div class="conta-info-item"><strong>Status:</strong> ${fundo.status === 'encerrado' ? 'Encerrado' : 'Aberto'}</div>
            </div>
        </div>
    `;
}

async function abrirFundo(id) {
    const list = document.getElementById('fundosList');
    const detalhe = document.getElementById('fundoDetalhe');
    const loading = document.getElementById('fundosLoading');

    loading.classList.remove('hidden');

    try {
        const response = await api.buscarFundo(id);
        if (!response.success) {
            throw new Error(response.message || 'Erro ao carregar fundo');
        }

        const fundo = response.data;
        const saldo = parseFloat(fundo.saldo);
        const saidas = fundo.saidas || [];

        list.classList.add('hidden');
        detalhe.classList.remove('hidden');
        detalhe.innerHTML = `
            <button class="btn" onclick="carregarFundos()" style="margin-bottom:15px;">← Voltar</button>

            <div class="relatorio-grid">
                <div class="relatorio-card">
                    <h3>Entrada</h3>
                    <div class="valor">R$ ${formatarValor(fundo.valor_entrada)}</div>
                </div>
                <div class="relatorio-card" style="background: linear-gradient(135deg, #f5576c 0%, #d63447 100%);">
                    <h3>Total Gasto</h3>
                    <div class="valor">R$ ${formatarValor(fundo.total_saidas)}</div>
                </div>
                <div class="relatorio-card" style="background: linear-gradient(135deg, ${saldo < 0 ? '#f5576c 0%, #d63447' : '#00d084 0%, #00a86b'} 100%);">
                    <h3>Saldo</h3>
                    <div class="valor">R$ ${formatarValor(saldo)}</div>
                </div>
            </div>

            <div class="conta-item">
                <div class="conta-info-item"><strong>Descrição:</strong> ${fundo.descricao}</div>
                <div class="conta-info-item"><strong>Fonte:</strong> ${fundo.fonte}</div>
                <div class="conta-info-item"><strong>Data da entrada:</strong> ${formatarData(fundo.data_entrada)}</div>
                <div class="conta-info-item"><strong>Total pago:</strong> R$ ${formatarValor(fundo.total_pago)}</div>
                ${fundo.observacoes ? `<div class="conta-info-item"><strong>Obs:</strong> ${fundo.observacoes}</div>` : ''}
            </div>

            <h3 style="margin-top:20px;">Saídas deste fundo (${saidas.length})</h3>
            <div class="contas-list">
                ${saidas.length === 0
                    ? '<p style="text-align:center;color:#666;padding:20px;">Nenhuma saída lançada neste fundo ainda.</p>'
                    : saidas.map(renderizarSaidaDoFundo).join('')}
            </div>
        `;
    } catch (error) {
        console.error('Erro ao abrir fundo:', error);
        mostrarAlerta('alertFundos', 'Erro ao abrir fundo: ' + error.message, 'danger');
    } finally {
        loading.classList.add('hidden');
    }
}

function renderizarSaidaDoFundo(saida) {
    const status = calcularStatus(saida);
    const statusClass = status === 'pago' ? 'status-pago' :
                        status === 'atrasado' ? 'status-atrasado' : 'status-pendente';

    return `
        <div class="conta-item">
            <div class="conta-header">
                <div class="conta-descricao">${saida.descricao}</div>
                <div class="conta-valor">R$ ${formatarValor(saida.valor)}</div>
            </div>
            <span class="status-badge ${statusClass}">${status.toUpperCase()}</span>
            <div class="conta-info">
                <div class="conta-info-item"><strong>Credor:</strong> ${saida.credor}</div>
                <div class="conta-info-item"><strong>Tipo:</strong> ${formatarTipoDespesa(saida.tipo_despesa)}</div>
                <div class="conta-info-item"><strong>Vencimento:</strong> ${formatarData(saida.data_vencimento)}</div>
            </div>
        </div>
    `;
}
