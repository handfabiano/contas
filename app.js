/**
 * Sistema de Contas a Pagar
 * Com suporte a parcelas e recorrencia
 */

const API_URL = 'api.php';
let mesAtual = new Date();
let filtroAtual = 'todos';

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    atualizarMesDisplay();
    carregarDashboard();
    carregarContas();

    document.getElementById('form-conta').addEventListener('submit', (e) => {
        e.preventDefault();
        criarConta();
    });
});

// Mudar tipo de lancamento
function mudarTipoLancamento(tipo) {
    // Atualizar campo hidden
    document.getElementById('tipo_lancamento').value = tipo;

    // Atualizar botoes
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // Mostrar/ocultar campos
    document.getElementById('campos-parcelado').style.display = tipo === 'parcelado' ? 'block' : 'none';
    document.getElementById('campos-recorrente').style.display = tipo === 'recorrente' ? 'block' : 'none';
}

// Formatar moeda
function formatarMoeda(valor) {
    const numero = typeof valor === 'string' ? parseFloat(valor) : valor;
    return 'R$ ' + numero.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Formatar data
function formatarData(data) {
    if (!data) return '-';
    const d = new Date(data + 'T00:00:00');
    return d.toLocaleDateString('pt-BR');
}

// Atualizar display do mes
function atualizarMesDisplay() {
    const meses = ['Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
                   'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    document.getElementById('mes-atual').textContent =
        `${meses[mesAtual.getMonth()]} ${mesAtual.getFullYear()}`;
}

// Mudar mes
function mudarMes(direcao) {
    mesAtual.setMonth(mesAtual.getMonth() + direcao);
    atualizarMesDisplay();
    carregarDashboard();
    carregarContas();
}

// Obter mes no formato YYYY-MM
function getMesFormatado() {
    const ano = mesAtual.getFullYear();
    const mes = String(mesAtual.getMonth() + 1).padStart(2, '0');
    return `${ano}-${mes}`;
}

// Carregar dashboard
async function carregarDashboard() {
    try {
        const response = await fetch(`${API_URL}?acao=dashboard&mes=${getMesFormatado()}`);
        const data = await response.json();

        if (data.sucesso) {
            document.getElementById('total-pendente').textContent =
                formatarMoeda(data.totais.pendente || 0);
            document.getElementById('total-pago').textContent =
                formatarMoeda(data.totais.pago || 0);
            document.getElementById('total-atrasado').textContent =
                formatarMoeda(data.totais.atrasado || 0);
        }
    } catch (erro) {
        console.error('Erro ao carregar dashboard:', erro);
    }
}

// Carregar contas
async function carregarContas() {
    try {
        let url = `${API_URL}?acao=listar&mes=${getMesFormatado()}`;

        if (filtroAtual !== 'todos') {
            url += `&status=${filtroAtual}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (data.sucesso) {
            renderizarContas(data.contas);
        }
    } catch (erro) {
        console.error('Erro ao carregar contas:', erro);
        document.getElementById('lista-contas').innerHTML =
            '<p class="erro">Erro ao carregar contas</p>';
    }
}

// Renderizar contas
function renderizarContas(contas) {
    const lista = document.getElementById('lista-contas');

    if (!contas || contas.length === 0) {
        lista.innerHTML = '<p class="vazio">Nenhuma conta encontrada</p>';
        return;
    }

    lista.innerHTML = contas.map(conta => {
        // Verificar se e parcela
        let badgeParcela = '';
        if (conta.parcela_atual && conta.total_parcelas) {
            badgeParcela = `<span class="badge-parcela">${conta.parcela_atual}/${conta.total_parcelas}</span>`;
        }

        // Verificar se e recorrente
        let badgeRecorrente = '';
        if (conta.tipo_lancamento === 'recorrente' && conta.periodicidade) {
            badgeRecorrente = `<span class="badge-recorrente">${conta.periodicidade}</span>`;
        }

        return `
        <div class="conta-card ${conta.status}">
            <div class="conta-header">
                <div>
                    <h3>${conta.descricao}</h3>
                    <span class="credor">${conta.credor}</span>
                </div>
                <span class="valor">${formatarMoeda(conta.valor)}</span>
            </div>
            <div class="conta-info">
                <span class="categoria">${conta.tipo_despesa}</span>
                <span class="vencimento">Vence: ${formatarData(conta.data_vencimento)}</span>
            </div>
            <div class="badges">
                ${badgeParcela}
                ${badgeRecorrente}
            </div>
            ${conta.observacoes ? `<p class="observacoes">${conta.observacoes}</p>` : ''}
            <div class="conta-acoes">
                ${conta.status === 'pendente' ?
                    `<button onclick="marcarPago(${conta.id})">✓ Pagar</button>` : ''}
                ${conta.status === 'pago' ?
                    `<span class="data-pagamento">Pago</span>` : ''}
                <button onclick="excluirConta(${conta.id})" class="btn-perigo">🗑️</button>
            </div>
        </div>
    `;
    }).join('');
}

// Filtrar
function filtrar(status) {
    filtroAtual = status;

    document.querySelectorAll('.filtros button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    carregarContas();
}

// Criar conta
async function criarConta() {
    const tipo_lancamento = document.getElementById('tipo_lancamento').value;
    const descricao = document.getElementById('descricao').value;
    const credor = document.getElementById('credor').value;
    const valor = document.getElementById('valor').value;
    const data_vencimento = document.getElementById('data_vencimento').value;
    const tipo_despesa = document.getElementById('tipo_despesa').value;
    const observacoes = document.getElementById('observacoes').value;

    const payload = {
        descricao,
        credor,
        valor,
        data_vencimento,
        tipo_despesa,
        observacoes,
        tipo_lancamento
    };

    // Se for parcelado
    if (tipo_lancamento === 'parcelado') {
        const total_parcelas = document.getElementById('total_parcelas').value;
        if (!total_parcelas || total_parcelas < 2) {
            alert('Informe o numero de parcelas (minimo 2)');
            return;
        }
        payload.total_parcelas = parseInt(total_parcelas);
    }

    // Se for recorrente
    if (tipo_lancamento === 'recorrente') {
        const periodicidade = document.getElementById('periodicidade').value;
        const quantidade = document.getElementById('quantidade').value;
        if (!quantidade || quantidade < 2) {
            alert('Informe a quantidade de repeticoes (minimo 2)');
            return;
        }
        payload.periodicidade = periodicidade;
        payload.quantidade = parseInt(quantidade);
    }

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.sucesso) {
            document.getElementById('form-conta').reset();
            document.getElementById('tipo_lancamento').value = 'individual';
            mudarTipoLancamento('individual');

            carregarDashboard();
            carregarContas();

            alert(data.mensagem);
        } else {
            alert('Erro: ' + data.erro);
        }
    } catch (erro) {
        console.error('Erro ao criar conta:', erro);
        alert('Erro ao criar conta');
    }
}

// Marcar como pago
async function marcarPago(id) {
    if (!confirm('Marcar esta conta como paga?')) return;

    try {
        const response = await fetch(`${API_URL}?id=${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'pago' })
        });

        const data = await response.json();

        if (data.sucesso) {
            carregarDashboard();
            carregarContas();
        } else {
            alert('Erro: ' + data.erro);
        }
    } catch (erro) {
        console.error('Erro ao marcar como pago:', erro);
        alert('Erro ao marcar como pago');
    }
}

// Excluir conta
async function excluirConta(id) {
    if (!confirm('Tem certeza que deseja excluir esta conta?')) return;

    try {
        const response = await fetch(`${API_URL}?id=${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.sucesso) {
            carregarDashboard();
            carregarContas();
        } else {
            alert('Erro: ' + data.erro);
        }
    } catch (erro) {
        console.error('Erro ao excluir conta:', erro);
        alert('Erro ao excluir conta');
    }
}
