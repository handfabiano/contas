// Módulo de Lançamentos - Entrada (Fundo) x Saída (Despesa)

// Cache dos fundos carregados (para mostrar saldo disponível na saída)
let fundosCache = [];

function renderLancamentoPage() {
    return `
        <h2>Novo Lançamento</h2>
        <div id="alertLancamento"></div>

        <div class="lancamento-tipo">
            <div class="radio-group">
                <div class="radio-option">
                    <input type="radio" id="lancEntrada" name="direcao" value="entrada" checked>
                    <label for="lancEntrada">⬆️ Entrada (recebi dinheiro)</label>
                </div>
                <div class="radio-option">
                    <input type="radio" id="lancSaida" name="direcao" value="saida">
                    <label for="lancSaida">⬇️ Saída (paguei / vou pagar)</label>
                </div>
            </div>
        </div>

        <!-- ENTRADA: cria um Fundo / Caixa -->
        <form id="formEntrada">
            <p class="info-text">Cada entrada cria um <strong>Fundo / Caixa</strong> com prestação de contas própria. As saídas são abatidas do dinheiro deste fundo.</p>

            <div class="form-group">
                <label for="entradaDescricao">Descrição *</label>
                <input type="text" id="entradaDescricao" required placeholder="Ex: Doação festa junina, Verba do projeto X">
            </div>

            <div class="form-group">
                <label for="entradaFonte">Fonte (de quem veio) *</label>
                <input type="text" id="entradaFonte" required placeholder="Ex: Prefeitura, Rifa, Doador João">
            </div>

            <div class="form-group">
                <label for="entradaValor">Valor Recebido (R$) *</label>
                <input type="number" id="entradaValor" step="0.01" min="0" required placeholder="0.00">
            </div>

            <div class="form-group">
                <label for="entradaData">Data da Entrada *</label>
                <input type="date" id="entradaData" required>
            </div>

            <div class="form-group">
                <label for="entradaCategoria">Categoria</label>
                <input type="text" id="entradaCategoria" placeholder="Opcional (ex: Doação, Evento, Venda)">
            </div>

            <div class="form-group">
                <label for="entradaObservacoes">Observações</label>
                <textarea id="entradaObservacoes" rows="3" placeholder="Observações adicionais (opcional)"></textarea>
            </div>

            <button type="submit" class="btn" id="btnSalvarEntrada">Registrar Entrada</button>
        </form>

        <!-- SAÍDA: despesa vinculada a um fundo -->
        <form id="formSaida" class="hidden">
            <div class="form-group">
                <label for="saidaFundo">Fundo (de qual dinheiro sai?) *</label>
                <select id="saidaFundo" required>
                    <option value="">Carregando fundos...</option>
                </select>
                <p class="info-text" id="saidaSaldoInfo"></p>
            </div>

            <div class="form-group">
                <label>Tipo de Lançamento</label>
                <div class="radio-group">
                    <div class="radio-option">
                        <input type="radio" id="individual" name="tipoLancamento" value="individual" checked>
                        <label for="individual">Individual</label>
                    </div>
                    <div class="radio-option">
                        <input type="radio" id="recorrente" name="tipoLancamento" value="recorrente">
                        <label for="recorrente">Recorrente</label>
                    </div>
                </div>
            </div>

            <div id="recorrenteOptions" class="hidden">
                <div class="form-group">
                    <label>Tipo de Recorrência</label>
                    <div class="radio-group">
                        <div class="radio-option">
                            <input type="radio" id="comParcelas" name="tipoRecorrencia" value="parcelas" checked>
                            <label for="comParcelas">Com Número de Parcelas</label>
                        </div>
                        <div class="radio-option">
                            <input type="radio" id="indefinido" name="tipoRecorrencia" value="indefinido">
                            <label for="indefinido">Indefinido</label>
                        </div>
                    </div>
                </div>

                <div class="form-group" id="numParcelasGroup">
                    <label for="numParcelas">Número de Parcelas</label>
                    <input type="number" id="numParcelas" min="2" max="120" value="12">
                </div>

                <div class="form-group">
                    <label for="periodicidade">Periodicidade</label>
                    <select id="periodicidade">
                        <option value="mensal">Mensal</option>
                        <option value="semanal">Semanal</option>
                        <option value="quinzenal">Quinzenal</option>
                        <option value="anual">Anual</option>
                    </select>
                </div>
            </div>

            <div class="form-group">
                <label for="descricao">Descrição *</label>
                <input type="text" id="descricao" required placeholder="Ex: Aluguel, Conta de luz, etc.">
            </div>

            <div class="form-group">
                <label for="valor">Valor (R$) *</label>
                <input type="number" id="valor" step="0.01" min="0" required placeholder="0.00">
            </div>

            <div class="form-group">
                <label for="credor">Credor *</label>
                <input type="text" id="credor" required placeholder="Ex: Imobiliária, Companhia de Energia, etc.">
            </div>

            <div class="form-group">
                <label for="tipoDespesa">Tipo de Despesa *</label>
                <select id="tipoDespesa" required>
                    <option value="">Selecione...</option>
                    <option value="moradia">Moradia</option>
                    <option value="alimentacao">Alimentação</option>
                    <option value="transporte">Transporte</option>
                    <option value="saude">Saúde</option>
                    <option value="educacao">Educação</option>
                    <option value="lazer">Lazer</option>
                    <option value="contas">Contas e Serviços</option>
                    <option value="outros">Outros</option>
                </select>
            </div>

            <div class="form-group">
                <label for="dataVencimento">Data de Vencimento *</label>
                <input type="date" id="dataVencimento" required>
            </div>

            <div class="form-group">
                <label for="observacoes">Observações</label>
                <textarea id="observacoes" rows="3" placeholder="Observações adicionais (opcional)"></textarea>
            </div>

            <button type="submit" class="btn" id="btnSalvar">Salvar Saída</button>
        </form>
    `;
}

function initLancamentos() {
    // Alternância Entrada x Saída
    document.querySelectorAll('input[name="direcao"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const isEntrada = this.value === 'entrada';
            document.getElementById('formEntrada').classList.toggle('hidden', !isEntrada);
            document.getElementById('formSaida').classList.toggle('hidden', isEntrada);
        });
    });

    // Recorrência
    document.querySelectorAll('input[name="tipoLancamento"]').forEach(radio => {
        radio.addEventListener('change', function() {
            document.getElementById('recorrenteOptions').classList.toggle('hidden', this.value === 'individual');
        });
    });

    document.querySelectorAll('input[name="tipoRecorrencia"]').forEach(radio => {
        radio.addEventListener('change', function() {
            document.getElementById('numParcelasGroup').classList.toggle('hidden', this.value === 'indefinido');
        });
    });

    // Mostra saldo do fundo selecionado
    document.getElementById('saidaFundo').addEventListener('change', atualizarSaldoInfo);

    document.getElementById('formEntrada').addEventListener('submit', salvarEntrada);
    document.getElementById('formSaida').addEventListener('submit', salvarLancamento);

    // Datas iniciais
    const hoje = new Date().toISOString().split('T')[0];
    const entradaData = document.getElementById('entradaData');
    if (entradaData) entradaData.value = hoje;
    setDataAtual();

    carregarFundosSelect();
}

// ============================================
// ENTRADA (Fundo)
// ============================================

async function salvarEntrada(e) {
    e.preventDefault();

    const btn = document.getElementById('btnSalvarEntrada');
    btn.disabled = true;
    btn.textContent = 'Salvando...';

    const dados = {
        descricao: document.getElementById('entradaDescricao').value,
        fonte: document.getElementById('entradaFonte').value,
        valor_entrada: parseFloat(document.getElementById('entradaValor').value),
        data_entrada: document.getElementById('entradaData').value,
        categoria: document.getElementById('entradaCategoria').value || null,
        observacoes: document.getElementById('entradaObservacoes').value || null
    };

    try {
        const response = await api.criarFundo(dados);
        if (!response.success) {
            throw new Error(response.message || 'Erro ao registrar entrada');
        }

        mostrarAlerta('alertLancamento', 'Entrada registrada! Um novo fundo foi criado. ✅', 'success');
        document.getElementById('formEntrada').reset();
        document.getElementById('entradaData').value = new Date().toISOString().split('T')[0];

        // Atualiza o select de fundos para uso imediato nas saídas
        carregarFundosSelect();
    } catch (error) {
        console.error('Erro ao registrar entrada:', error);
        mostrarAlerta('alertLancamento', 'Erro ao registrar entrada: ' + error.message, 'danger');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Registrar Entrada';
    }
}

// ============================================
// SAÍDA (Despesa vinculada a um fundo)
// ============================================

async function carregarFundosSelect() {
    const select = document.getElementById('saidaFundo');
    if (!select) return;

    try {
        const response = await api.listarFundos();
        const fundos = (response.success && response.data && response.data.fundos) ? response.data.fundos : [];
        fundosCache = fundos;

        if (fundos.length === 0) {
            select.innerHTML = '<option value="">Nenhum fundo — registre uma entrada primeiro</option>';
        } else {
            select.innerHTML = '<option value="">Selecione o fundo...</option>' +
                fundos.map(f =>
                    `<option value="${f.id}">${f.descricao} (saldo R$ ${formatarValor(f.saldo)})</option>`
                ).join('');
        }
        atualizarSaldoInfo();
    } catch (error) {
        console.error('Erro ao carregar fundos:', error);
        select.innerHTML = '<option value="">Erro ao carregar fundos</option>';
    }
}

function atualizarSaldoInfo() {
    const info = document.getElementById('saidaSaldoInfo');
    const select = document.getElementById('saidaFundo');
    if (!info || !select) return;

    const fundo = fundosCache.find(f => String(f.id) === select.value);
    if (!fundo) {
        info.textContent = '';
        return;
    }

    const saldo = parseFloat(fundo.saldo);
    info.innerHTML = `Saldo disponível neste fundo: <strong style="color:${saldo < 0 ? '#d63447' : '#00a86b'}">R$ ${formatarValor(saldo)}</strong>`;
}

async function salvarLancamento(e) {
    e.preventDefault();

    const fundoId = document.getElementById('saidaFundo').value;
    if (!fundoId) {
        mostrarAlerta('alertLancamento', 'Selecione o fundo de onde sai o dinheiro.', 'warning');
        return;
    }

    const btnSalvar = document.getElementById('btnSalvar');
    btnSalvar.disabled = true;
    btnSalvar.textContent = 'Salvando...';

    const tipoLancamento = document.querySelector('input[name="tipoLancamento"]:checked').value;
    const descricao = document.getElementById('descricao').value;
    const valor = parseFloat(document.getElementById('valor').value);
    const credor = document.getElementById('credor').value;
    const tipoDespesa = document.getElementById('tipoDespesa').value;
    const dataVencimento = document.getElementById('dataVencimento').value;
    const observacoes = document.getElementById('observacoes').value || null;

    // Aviso suave se a saída for maior que o saldo disponível (não bloqueia)
    const fundo = fundosCache.find(f => String(f.id) === fundoId);
    if (fundo && valor > parseFloat(fundo.saldo)) {
        const ok = confirm(`Atenção: esta saída (R$ ${formatarValor(valor)}) é maior que o saldo disponível do fundo (R$ ${formatarValor(fundo.saldo)}). O saldo ficará negativo. Deseja continuar?`);
        if (!ok) {
            btnSalvar.disabled = false;
            btnSalvar.textContent = 'Salvar Saída';
            return;
        }
    }

    try {
        if (tipoLancamento === 'individual') {
            await salvarContaIndividual(fundoId, descricao, valor, credor, tipoDespesa, dataVencimento, observacoes);
        } else {
            await salvarContaRecorrente(fundoId, descricao, valor, credor, tipoDespesa, dataVencimento, observacoes);
        }

        mostrarAlerta('alertLancamento', 'Saída salva com sucesso! ✅', 'success');
        document.getElementById('formSaida').reset();
        setDataAtual();
        // Recarrega fundos para refletir o novo saldo
        carregarFundosSelect();
    } catch (error) {
        console.error('Erro ao salvar:', error);
        mostrarAlerta('alertLancamento', 'Erro ao salvar: ' + error.message, 'danger');
    } finally {
        btnSalvar.disabled = false;
        btnSalvar.textContent = 'Salvar Saída';
    }
}

async function salvarContaIndividual(fundoId, descricao, valor, credor, tipoDespesa, dataVencimento, observacoes) {
    const dados = {
        fundo_id: parseInt(fundoId),
        descricao,
        valor,
        credor,
        tipo_despesa: tipoDespesa,
        data_vencimento: dataVencimento,
        observacoes,
        tipo_lancamento: 'individual',
        status: 'pendente'
    };

    const response = await api.criarConta(dados);

    if (!response.success) {
        throw new Error(response.message || 'Erro ao criar conta');
    }

    return response;
}

async function salvarContaRecorrente(fundoId, descricao, valor, credor, tipoDespesa, dataVencimento, observacoes) {
    const tipoRecorrencia = document.querySelector('input[name="tipoRecorrencia"]:checked').value;
    const periodicidade = document.getElementById('periodicidade').value;
    const numParcelas = tipoRecorrencia === 'parcelas' ? parseInt(document.getElementById('numParcelas').value) : null;

    // Gera ID único para o grupo de recorrências
    const recorrenciaId = generateUUID();
    const contas = [];

    const dataBase = new Date(dataVencimento + 'T00:00:00');
    const totalParcelas = numParcelas || 12; // Se indefinido, cria 12 parcelas iniciais

    for (let i = 1; i <= totalParcelas; i++) {
        const dataVenc = new Date(dataBase);

        switch(periodicidade) {
            case 'semanal':
                dataVenc.setDate(dataVenc.getDate() + (7 * (i - 1)));
                break;
            case 'quinzenal':
                dataVenc.setDate(dataVenc.getDate() + (15 * (i - 1)));
                break;
            case 'mensal':
                dataVenc.setMonth(dataVenc.getMonth() + (i - 1));
                break;
            case 'anual':
                dataVenc.setFullYear(dataVenc.getFullYear() + (i - 1));
                break;
        }

        contas.push({
            fundo_id: parseInt(fundoId),
            descricao: `${descricao} ${numParcelas ? `(${i}/${numParcelas})` : `(#${i})`}`,
            valor: valor,
            credor: credor,
            tipo_despesa: tipoDespesa,
            data_vencimento: formatarDataISO(dataVenc),
            observacoes: observacoes,
            tipo_lancamento: 'recorrente',
            recorrencia_id: recorrenciaId,
            parcela_atual: i,
            total_parcelas: numParcelas,
            periodicidade: periodicidade,
            status: 'pendente'
        });
    }

    // Cria todas as contas
    const response = await api.criarContasRecorrentes(contas);

    if (response.some(r => !r.success)) {
        throw new Error('Erro ao criar algumas contas recorrentes');
    }

    return response;
}

// Função auxiliar para gerar UUID
function generateUUID() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback para navegadores antigos
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Função auxiliar para formatar data no formato ISO (YYYY-MM-DD)
function formatarDataISO(data) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
}
