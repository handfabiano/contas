// Módulo de Contas

function renderContasPage() {
    return `
        <h2>Minhas Contas a Pagar</h2>
        
        <div class="filtros">
            <h3>Filtros</h3>
            <div class="filtros-group">
                <div class="form-group">
                    <label for="filtroStatus">Status</label>
                    <select id="filtroStatus" onchange="carregarContas()">
                        <option value="">Todos</option>
                        <option value="pendente">Pendente</option>
                        <option value="pago">Pago</option>
                        <option value="atrasado">Atrasado</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="filtroTipo">Tipo de Despesa</label>
                    <select id="filtroTipo" onchange="carregarContas()">
                        <option value="">Todos</option>
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
                    <label for="filtroMes">Mês</label>
                    <input type="month" id="filtroMes" onchange="carregarContas()">
                </div>
            </div>
        </div>

        <div id="contasLoading" class="loading hidden">Carregando contas...</div>
        <div id="contasList" class="contas-list"></div>
    `;
}

function initContas() {
    setMesAtual();
    carregarContas();
}

async function carregarContas() {
    if (!supabase) return;

    const loading = document.getElementById('contasLoading');
    const list = document.getElementById('contasList');
    
    loading.classList.remove('hidden');
    list.innerHTML = '';

    try {
        let query = supabase
            .from('contas_pagar')
            .select('*')
            .order('data_vencimento', { ascending: true });

        const filtroStatus = document.getElementById('filtroStatus').value;
        const filtroTipo = document.getElementById('filtroTipo').value;
        const filtroMes = document.getElementById('filtroMes').value;

        if (filtroStatus) {
            query = query.eq('status', filtroStatus);
        }

        if (filtroTipo) {
            query = query.eq('tipo_despesa', filtroTipo);
        }

        if (filtroMes) {
            const [ano, mes] = filtroMes.split('-');
            const dataInicio = `${ano}-${mes}-01`;
            const dataFim = `${ano}-${mes}-31`;
            query = query.gte('data_vencimento', dataInicio).lte('data_vencimento', dataFim);
        }

        const { data: contas, error } = await query;

        if (error) throw error;

        if (contas.length === 0) {
            list.innerHTML = '<p style="text-align:center;color:#666;padding:40px;">Nenhuma conta encontrada.</p>';
        } else {
            contas.forEach(conta => {
                list.innerHTML += renderizarConta(conta);
            });
        }
    } catch (error) {
        console.error('Erro ao carregar contas:', error);
        list.innerHTML = '<p style="text-align:center;color:red;">Erro ao carregar contas.</p>';
    } finally {
        loading.classList.add('hidden');
    }
}

function renderizarConta(conta) {
    const status = calcularStatus(conta);
    const statusClass = status === 'pago' ? 'status-pago' : 
                       status === 'atrasado' ? 'status-atrasado' : 'status-pendente';

    return `
        <div class="conta-item">
            <div class="conta-header">
                <div class="conta-descricao">${conta.descricao}</div>
                <div class="conta-valor">R$ ${formatarValor(conta.valor)}</div>
            </div>
            <span class="status-badge ${statusClass}">${status.toUpperCase()}</span>
            <div class="conta-info">
                <div class="conta-info-item"><strong>Credor:</strong> ${conta.credor}</div>
                <div class="conta-info-item"><strong>Tipo:</strong> ${formatarTipoDespesa(conta.tipo_despesa)}</div>
                <div class="conta-info-item"><strong>Vencimento:</strong> ${formatarData(conta.data_vencimento)}</div>
                <div class="conta-info-item"><strong>Lançamento:</strong> ${conta.tipo_lancamento === 'recorrente' ? 'Recorrente' : 'Individual'}</div>
            </div>
            ${conta.observacoes ? `<div class="conta-info-item" style="margin-top:10px;"><strong>Obs:</strong> ${conta.observacoes}</div>` : ''}
            <div class="conta-actions">
                ${conta.status !== 'pago' ? `<button class="btn btn-success" onclick="marcarComoPago('${conta.id}')">Marcar como Pago</button>` : ''}
                <button class="btn btn-danger" onclick="excluirConta('${conta.id}')">Excluir</button>
            </div>
        </div>
    `;
}

async function marcarComoPago(id) {
    if (!confirm('Deseja marcar esta conta como paga?')) return;

    try {
        const { error } = await supabase
            .from('contas_pagar')
            .update({ status: 'pago' })
            .eq('id', id);

        if (error) throw error;

        carregarContas();
    } catch (error) {
        alert('Erro ao marcar como pago: ' + error.message);
    }
}

async function excluirConta(id) {
    if (!confirm('Deseja realmente excluir esta conta?')) return;

    try {
        const { error } = await supabase
            .from('contas_pagar')
            .delete()
            .eq('id', id);

        if (error) throw error;

        carregarContas();
    } catch (error) {
        alert('Erro ao excluir: ' + error.message);
    }
}
