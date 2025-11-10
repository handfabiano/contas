// Módulo de Lançamentos

function renderLancamentoPage() {
    return `
        <h2>Novo Lançamento</h2>
        <div id="alertLancamento"></div>
        
        <form id="formLancamento">
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

            <button type="submit" class="btn">Salvar Lançamento</button>
        </form>
    `;
}

function initLancamentos() {
    document.querySelectorAll('input[name="tipoLancamento"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const recorrenteOptions = document.getElementById('recorrenteOptions');
            recorrenteOptions.classList.toggle('hidden', this.value === 'individual');
        });
    });

    document.querySelectorAll('input[name="tipoRecorrencia"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const numParcelasGroup = document.getElementById('numParcelasGroup');
            numParcelasGroup.classList.toggle('hidden', this.value === 'indefinido');
        });
    });

    document.getElementById('formLancamento').addEventListener('submit', salvarLancamento);
    setDataAtual();
}

async function salvarLancamento(e) {
    e.preventDefault();

    if (!supabase) {
        mostrarAlerta('alertLancamento', 'Configure o Supabase primeiro na aba Configurações!', 'warning');
        return;
    }

    const tipoLancamento = document.querySelector('input[name="tipoLancamento"]:checked').value;
    const descricao = document.getElementById('descricao').value;
    const valor = parseFloat(document.getElementById('valor').value);
    const credor = document.getElementById('credor').value;
    const tipoDespesa = document.getElementById('tipoDespesa').value;
    const dataVencimento = document.getElementById('dataVencimento').value;
    const observacoes = document.getElementById('observacoes').value;

    try {
        if (tipoLancamento === 'individual') {
            await salvarContaIndividual(descricao, valor, credor, tipoDespesa, dataVencimento, observacoes);
        } else {
            await salvarContaRecorrente(descricao, valor, credor, tipoDespesa, dataVencimento, observacoes);
        }

        mostrarAlerta('alertLancamento', 'Lançamento salvo com sucesso! ✅', 'success');
        document.getElementById('formLancamento').reset();
        setDataAtual();
    } catch (error) {
        console.error('Erro ao salvar:', error);
        mostrarAlerta('alertLancamento', 'Erro ao salvar: ' + error.message, 'danger');
    }
}

async function salvarContaIndividual(descricao, valor, credor, tipoDespesa, dataVencimento, observacoes) {
    const { data, error } = await supabase
        .from('contas_pagar')
        .insert([{
            descricao,
            valor,
            credor,
            tipo_despesa: tipoDespesa,
            data_vencimento: dataVencimento,
            observacoes,
            tipo_lancamento: 'individual',
            status: 'pendente'
        }]);

    if (error) throw error;
}

async function salvarContaRecorrente(descricao, valor, credor, tipoDespesa, dataVencimento, observacoes) {
    const tipoRecorrencia = document.querySelector('input[name="tipoRecorrencia"]:checked').value;
    const periodicidade = document.getElementById('periodicidade').value;
    const numParcelas = tipoRecorrencia === 'parcelas' ? parseInt(document.getElementById('numParcelas').value) : null;
    
    const recorrenciaId = crypto.randomUUID();
    const contas = [];
    
    const dataBase = new Date(dataVencimento);
    const totalParcelas = numParcelas || 999;

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
            descricao: `${descricao} ${numParcelas ? `(${i}/${numParcelas})` : `(#${i})`}`,
            valor,
            credor,
            tipo_despesa: tipoDespesa,
            data_vencimento: dataVenc.toISOString().split('T')[0],
            observacoes,
            tipo_lancamento: 'recorrente',
            recorrencia_id: recorrenciaId,
            parcela_atual: i,
            total_parcelas: numParcelas,
            periodicidade,
            status: 'pendente'
        });

        if (!numParcelas && i >= 12) break;
    }

    const { data, error } = await supabase
        .from('contas_pagar')
        .insert(contas);

    if (error) throw error;
}
