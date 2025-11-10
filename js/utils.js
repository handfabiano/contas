// Funções utilitárias

function formatarData(data) {
    const d = new Date(data + 'T00:00:00');
    return d.toLocaleDateString('pt-BR');
}

function formatarValor(valor) {
    // Converte para número (MySQL retorna DECIMAL como string)
    const num = typeof valor === 'string' ? parseFloat(valor) : valor;
    return num.toFixed(2).replace('.', ',');
}

function formatarTipoDespesa(tipo) {
    const tipos = {
        'moradia': 'Moradia',
        'alimentacao': 'Alimentação',
        'transporte': 'Transporte',
        'saude': 'Saúde',
        'educacao': 'Educação',
        'lazer': 'Lazer',
        'contas': 'Contas e Serviços',
        'outros': 'Outros'
    };
    return tipos[tipo] || tipo;
}

function calcularStatus(conta) {
    if (conta.status === 'pago') return 'pago';
    
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const vencimento = new Date(conta.data_vencimento);
    vencimento.setHours(0, 0, 0, 0);
    
    return vencimento < hoje ? 'atrasado' : 'pendente';
}

function mostrarAlerta(elementoId, mensagem, tipo) {
    const elemento = document.getElementById(elementoId);
    elemento.innerHTML = `<div class="alert alert-${tipo}">${mensagem}</div>`;
    setTimeout(() => {
        elemento.innerHTML = '';
    }, 5000);
}

function setDataAtual() {
    const hoje = new Date().toISOString().split('T')[0];
    const elem = document.getElementById('dataVencimento');
    if (elem) elem.value = hoje;
}

function setMesAtual() {
    const hoje = new Date();
    const mesAtual = hoje.toISOString().substring(0, 7);
    
    const filtroMes = document.getElementById('filtroMes');
    const relMesInicio = document.getElementById('relMesInicio');
    const relMesFim = document.getElementById('relMesFim');
    
    if (filtroMes) filtroMes.value = mesAtual;
    if (relMesInicio) relMesInicio.value = mesAtual;
    if (relMesFim) relMesFim.value = mesAtual;
}
