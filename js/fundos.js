// Módulo de Prestação de Contas (Fundos / Caixas)

// Guarda o fundo atualmente aberto no detalhe (com saídas) para editar/exportar sem nova consulta
let fundoAtualDetalhe = null;

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

        fundoAtualDetalhe = fundo;

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

            <div id="alertFundoDetalhe"></div>

            <div class="conta-item">
                <span class="status-badge ${fundo.status === 'encerrado' ? 'status-pago' : 'status-pendente'}">${fundo.status === 'encerrado' ? 'Encerrado' : 'Aberto'}</span>

                <div id="fundoInfoView">
                    <div class="conta-info-item" style="margin-top:10px;"><strong>Descrição:</strong> ${fundo.descricao}</div>
                    <div class="conta-info-item"><strong>Fonte:</strong> ${fundo.fonte}</div>
                    <div class="conta-info-item"><strong>Data da entrada:</strong> ${formatarData(fundo.data_entrada)}</div>
                    <div class="conta-info-item"><strong>Total pago:</strong> R$ ${formatarValor(fundo.total_pago)}</div>
                    ${fundo.categoria ? `<div class="conta-info-item"><strong>Categoria:</strong> ${fundo.categoria}</div>` : ''}
                    ${fundo.observacoes ? `<div class="conta-info-item"><strong>Obs:</strong> ${fundo.observacoes}</div>` : ''}
                </div>
                <div id="fundoEditForm" class="hidden"></div>

                <div class="conta-actions" style="margin-top:15px;">
                    <button class="btn" id="btnEditarFundo" onclick="abrirEdicaoFundo(${fundo.id})">Editar</button>
                    <button class="btn" onclick="alternarStatusFundo(${fundo.id}, '${fundo.status}')">${fundo.status === 'encerrado' ? 'Reabrir Fundo' : 'Encerrar Fundo'}</button>
                    <button class="btn" onclick="exportarPrestacaoContas(${fundo.id})">Exportar Prestação (CSV)</button>
                    <button class="btn btn-danger" onclick="excluirFundoAtual(${fundo.id})">Excluir Fundo</button>
                </div>
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

// ============================================
// EDITAR FUNDO
// ============================================

function abrirEdicaoFundo(id) {
    const fundo = fundoAtualDetalhe;
    if (!fundo || fundo.id !== id) return;

    document.getElementById('fundoInfoView').classList.add('hidden');
    document.getElementById('btnEditarFundo').classList.add('hidden');

    const editForm = document.getElementById('fundoEditForm');
    editForm.classList.remove('hidden');
    editForm.innerHTML = `
        <form id="formEditarFundo" style="margin-top:10px;">
            <div class="form-group">
                <label for="editDescricao">Descrição *</label>
                <input type="text" id="editDescricao" required value="${escaparAtributo(fundo.descricao)}">
            </div>
            <div class="form-group">
                <label for="editFonte">Fonte (de quem veio) *</label>
                <input type="text" id="editFonte" required value="${escaparAtributo(fundo.fonte)}">
            </div>
            <div class="form-group">
                <label for="editValor">Valor Recebido (R$) *</label>
                <input type="number" id="editValor" step="0.01" min="0" required value="${fundo.valor_entrada}">
            </div>
            <div class="form-group">
                <label for="editData">Data da Entrada *</label>
                <input type="date" id="editData" required value="${fundo.data_entrada}">
            </div>
            <div class="form-group">
                <label for="editCategoria">Categoria</label>
                <input type="text" id="editCategoria" value="${escaparAtributo(fundo.categoria || '')}">
            </div>
            <div class="form-group">
                <label for="editObservacoes">Observações</label>
                <textarea id="editObservacoes" rows="3">${fundo.observacoes || ''}</textarea>
            </div>
            <div class="conta-actions">
                <button type="submit" class="btn">Salvar</button>
                <button type="button" class="btn" onclick="cancelarEdicaoFundo()">Cancelar</button>
            </div>
        </form>
    `;

    document.getElementById('formEditarFundo').addEventListener('submit', (e) => salvarEdicaoFundo(e, id));
}

function cancelarEdicaoFundo() {
    document.getElementById('fundoInfoView').classList.remove('hidden');
    document.getElementById('btnEditarFundo').classList.remove('hidden');
    const editForm = document.getElementById('fundoEditForm');
    editForm.classList.add('hidden');
    editForm.innerHTML = '';
}

async function salvarEdicaoFundo(e, id) {
    e.preventDefault();

    const dados = {
        descricao: document.getElementById('editDescricao').value,
        fonte: document.getElementById('editFonte').value,
        valor_entrada: parseFloat(document.getElementById('editValor').value),
        data_entrada: document.getElementById('editData').value,
        categoria: document.getElementById('editCategoria').value || null,
        observacoes: document.getElementById('editObservacoes').value || null
    };

    try {
        const response = await api.atualizarFundo(id, dados);
        if (!response.success) {
            throw new Error(response.message || 'Erro ao salvar fundo');
        }

        mostrarAlerta('alertFundos', 'Fundo atualizado com sucesso! ✅', 'success');
        abrirFundo(id);
    } catch (error) {
        console.error('Erro ao atualizar fundo:', error);
        mostrarAlerta('alertFundoDetalhe', 'Erro ao salvar: ' + error.message, 'danger');
    }
}

// ============================================
// ENCERRAR / REABRIR FUNDO
// ============================================

async function alternarStatusFundo(id, statusAtual) {
    const novoStatus = statusAtual === 'encerrado' ? 'aberto' : 'encerrado';
    const mensagem = novoStatus === 'encerrado'
        ? 'Encerrar este fundo? A prestação de contas ficará marcada como concluída.'
        : 'Reabrir este fundo?';

    if (!confirm(mensagem)) return;

    try {
        const response = await api.atualizarFundo(id, { status: novoStatus });
        if (!response.success) {
            throw new Error(response.message || 'Erro ao atualizar status do fundo');
        }

        mostrarAlerta('alertFundos', novoStatus === 'encerrado' ? 'Fundo encerrado. ✅' : 'Fundo reaberto. ✅', 'success');
        abrirFundo(id);
    } catch (error) {
        console.error('Erro ao atualizar status do fundo:', error);
        mostrarAlerta('alertFundoDetalhe', 'Erro: ' + error.message, 'danger');
    }
}

// ============================================
// EXCLUIR FUNDO
// ============================================

async function excluirFundoAtual(id) {
    if (!confirm('Deseja realmente excluir este fundo? Essa ação não pode ser desfeita.')) return;

    try {
        const response = await api.excluirFundo(id);
        if (!response.success) {
            throw new Error(response.message || 'Erro ao excluir fundo');
        }

        mostrarAlerta('alertFundos', 'Fundo excluído com sucesso. ✅', 'success');
        carregarFundos();
    } catch (error) {
        console.error('Erro ao excluir fundo:', error);
        mostrarAlerta('alertFundoDetalhe', 'Erro ao excluir: ' + error.message, 'danger');
    }
}

// ============================================
// EXPORTAR PRESTAÇÃO DE CONTAS (CSV)
// ============================================

function exportarPrestacaoContas(id) {
    const fundo = fundoAtualDetalhe;
    if (!fundo || fundo.id !== id) return;

    const saidas = fundo.saidas || [];
    const saldo = Number(fundo.valor_entrada) - Number(fundo.total_saidas);

    const linhas = [];
    linhas.push(['Prestação de Contas']);
    linhas.push(['Fundo', fundo.descricao]);
    linhas.push(['Fonte', fundo.fonte]);
    linhas.push(['Data da entrada', formatarData(fundo.data_entrada)]);
    linhas.push(['Valor recebido', formatarValor(fundo.valor_entrada)]);
    linhas.push(['Total gasto', formatarValor(fundo.total_saidas)]);
    linhas.push(['Saldo', formatarValor(saldo)]);
    linhas.push(['Status', fundo.status === 'encerrado' ? 'Encerrado' : 'Aberto']);
    linhas.push([]);
    linhas.push(['Saídas']);
    linhas.push(['Descrição', 'Valor', 'Credor', 'Tipo de Despesa', 'Vencimento', 'Status']);

    saidas.forEach(saida => {
        linhas.push([
            saida.descricao,
            formatarValor(saida.valor),
            saida.credor,
            formatarTipoDespesa(saida.tipo_despesa),
            formatarData(saida.data_vencimento),
            calcularStatus(saida).toUpperCase()
        ]);
    });

    const csv = linhas.map(linha => linha.map(escaparCampoCSV).join(';')).join('\r\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const nomeArquivo = `prestacao-contas-${slugify(fundo.descricao)}-${fundo.data_entrada}.csv`;
    const link = document.createElement('a');
    link.href = url;
    link.download = nomeArquivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function escaparCampoCSV(campo) {
    const texto = String(campo ?? '');
    if (/[;"\r\n]/.test(texto)) {
        return '"' + texto.replace(/"/g, '""') + '"';
    }
    return texto;
}

function escaparAtributo(texto) {
    return String(texto ?? '').replace(/"/g, '&quot;');
}

function slugify(texto) {
    return String(texto)
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || 'fundo';
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
