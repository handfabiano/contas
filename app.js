/**
 * Sistema de Contas a Pagar
 * JavaScript puro - sem dependencias
 */

// Config
const API_URL = 'api.php';
let mesAtual = new Date();
let filtroAtual = 'todos';

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    atualizarMesDisplay();
    carregarDashboard();
    carregarContas();

    // Form submit
    document.getElementById('form-conta').addEventListener('submit', (e) => {
        e.preventDefault();
        criarConta();
    });
});

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
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
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

    lista.innerHTML = contas.map(conta => `
        <div class="conta-card ${conta.status}">
            <div class="conta-header">
                <h3>${conta.descricao}</h3>
                <span class="valor">${formatarMoeda(conta.valor)}</span>
            </div>
            <div class="conta-info">
                <span class="categoria">${conta.categoria || 'Sem categoria'}</span>
                <span class="vencimento">Vence: ${formatarData(conta.data_vencimento)}</span>
            </div>
            ${conta.observacoes ? `<p class="observacoes">${conta.observacoes}</p>` : ''}
            <div class="conta-acoes">
                ${conta.status === 'pendente' ?
                    `<button onclick="marcarPago(${conta.id})">✓ Pagar</button>` : ''}
                ${conta.status === 'pago' ?
                    `<span class="data-pagamento">Pago em: ${formatarData(conta.data_pagamento)}</span>` : ''}
                <button onclick="editarConta(${conta.id})" class="btn-secundario">✏️</button>
                <button onclick="excluirConta(${conta.id})" class="btn-perigo">🗑️</button>
            </div>
        </div>
    `).join('');
}

// Filtrar
function filtrar(status) {
    filtroAtual = status;

    // Atualizar botoes
    document.querySelectorAll('.filtros button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    carregarContas();
}

// Criar conta
async function criarConta() {
    const descricao = document.getElementById('descricao').value;
    const valor = document.getElementById('valor').value;
    const data_vencimento = document.getElementById('data_vencimento').value;
    const categoria = document.getElementById('categoria').value;
    const observacoes = document.getElementById('observacoes').value;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                descricao,
                valor,
                data_vencimento,
                categoria,
                observacoes
            })
        });

        const data = await response.json();

        if (data.sucesso) {
            // Limpar form
            document.getElementById('form-conta').reset();

            // Recarregar
            carregarDashboard();
            carregarContas();

            alert('Conta criada com sucesso!');
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
            body: JSON.stringify({
                status: 'pago',
                data_pagamento: new Date().toISOString().split('T')[0]
            })
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

// Editar conta (simplificado)
function editarConta(id) {
    alert('Função de edição em desenvolvimento. Use excluir e criar novamente por enquanto.');
}
