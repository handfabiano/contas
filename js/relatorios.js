// Módulo de Relatórios

function renderRelatoriosPage() {
    return `
        <h2>Relatórios Financeiros</h2>
        
        <div class="filtros">
            <div class="filtros-group">
                <div class="form-group">
                    <label for="relMesInicio">Período - Início</label>
                    <input type="month" id="relMesInicio" onchange="gerarRelatorios()">
                </div>
                <div class="form-group">
                    <label for="relMesFim">Período - Fim</label>
                    <input type="month" id="relMesFim" onchange="gerarRelatorios()">
                </div>
                <div class="form-group">
                    <button class="btn" onclick="exportarRelatorio()">Exportar CSV</button>
                </div>
            </div>
        </div>

        <div class="relatorio-grid">
            <div class="relatorio-card">
                <h3>Total a Pagar</h3>
                <div class="valor" id="relTotalPagar">R$ 0,00</div>
                <small id="relQtdPagar" style="opacity:0.8"></small>
            </div>
            <div class="relatorio-card">
                <h3>Total Pago</h3>
                <div class="valor" id="relTotalPago">R$ 0,00</div>
                <small id="relQtdPago" style="opacity:0.8"></small>
            </div>
            <div class="relatorio-card">
                <h3>Total em Atraso</h3>
                <div class="valor" id="relTotalAtraso">R$ 0,00</div>
                <small id="relQtdAtraso" style="opacity:0.8"></small>
            </div>
            <div class="relatorio-card">
                <h3>Ticket Médio</h3>
                <div class="valor" id="relTicketMedio">R$ 0,00</div>
                <small id="relTotalContas" style="opacity:0.8"></small>
            </div>
        </div>

        <div class="relatorio-grid" style="grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));">
            <div class="config-section">
                <h3>Despesas por Categoria</h3>
                <div id="relPorCategoria"></div>
            </div>

            <div class="config-section">
                <h3>Maiores Despesas</h3>
                <div id="relMaioresDespesas"></div>
            </div>
        </div>

        <div class="config-section">
            <h3>Evolução Mensal</h3>
            <div id="relEvolucaoMensal"></div>
        </div>

        <div class="config-section">
            <h3>Contas Recorrentes Ativas</h3>
            <div id="relRecorrentes"></div>
        </div>

        <div class="config-section">
            <h3>Credores com Mais Contas</h3>
            <div id="relCredores"></div>
        </div>

        <div class="config-section">
            <h3>Análise de Vencimentos</h3>
            <div id="relVencimentos"></div>
        </div>
    `;
}

function initRelatorios() {
    setMesAtual();
    gerarRelatorios();
}

async function gerarRelatorios() {
    if (!supabase) return;

    const mesInicio = document.getElementById('relMesInicio').value;
    const mesFim = document.getElementById('relMesFim').value;

    if (!mesInicio || !mesFim) {
        return;
    }

    try {
        const dataInicio = `${mesInicio}-01`;
        const [anoFim, mesFimNum] = mesFim.split('-');
        const dataFim = `${anoFim}-${mesFimNum}-31`;

        const { data: contas, error } = await supabase
            .from('contas_pagar')
            .select('*')
            .gte('data_vencimento', dataInicio)
            .lte('data_vencimento', dataFim);

        if (error) throw error;

        calcularResumo(contas);
        gerarRelatorioCategorias(contas);
        gerarMaioresDespesas(contas);
        gerarEvolucaoMensal(contas);
        gerarRelatorioRecorrentes(contas);
        gerarRelatorioCredores(contas);
        gerarRelatorioVencimentos(contas);
    } catch (error) {
        console.error('Erro ao gerar relatórios:', error);
    }
}

function calcularResumo(contas) {
    let totalPagar = 0;
    let totalPago = 0;
    let totalAtraso = 0;
    let qtdPagar = 0;
    let qtdPago = 0;
    let qtdAtraso = 0;

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    contas.forEach(conta => {
        const valor = parseFloat(conta.valor);
        const vencimento = new Date(conta.data_vencimento);
        vencimento.setHours(0, 0, 0, 0);

        if (conta.status === 'pago') {
            totalPago += valor;
            qtdPago++;
        } else {
            totalPagar += valor;
            qtdPagar++;
            if (vencimento < hoje) {
                totalAtraso += valor;
                qtdAtraso++;
            }
        }
    });

    const totalGeral = totalPagar + totalPago;
    const ticketMedio = contas.length > 0 ? totalGeral / contas.length : 0;

    document.getElementById('relTotalPagar').textContent = `R$ ${formatarValor(totalPagar)}`;
    document.getElementById('relQtdPagar').textContent = `${qtdPagar} conta(s)`;
    
    document.getElementById('relTotalPago').textContent = `R$ ${formatarValor(totalPago)}`;
    document.getElementById('relQtdPago').textContent = `${qtdPago} conta(s)`;
    
    document.getElementById('relTotalAtraso').textContent = `R$ ${formatarValor(totalAtraso)}`;
    document.getElementById('relQtdAtraso').textContent = `${qtdAtraso} conta(s)`;
    
    document.getElementById('relTicketMedio').textContent = `R$ ${formatarValor(ticketMedio)}`;
    document.getElementById('relTotalContas').textContent = `${contas.length} conta(s) total`;
}

function gerarRelatorioCategorias(contas) {
    const categorias = {};

    contas.forEach(conta => {
        if (!categorias[conta.tipo_despesa]) {
            categorias[conta.tipo_despesa] = 0;
        }
        if (conta.status === 'pago') {
            categorias[conta.tipo_despesa] += parseFloat(conta.valor);
        }
    });

    let html = '<table style="width:100%;border-collapse:collapse;">';
    html += '<tr style="background:#f5f5f5;"><th style="padding:10px;text-align:left;">Categoria</th><th style="padding:10px;text-align:right;">Total Gasto</th></tr>';

    Object.entries(categorias).sort((a, b) => b[1] - a[1]).forEach(([cat, valor]) => {
        html += `<tr style="border-bottom:1px solid #eee;">
            <td style="padding:10px;">${formatarTipoDespesa(cat)}</td>
            <td style="padding:10px;text-align:right;font-weight:600;">R$ ${formatarValor(valor)}</td>
        </tr>`;
    });

    html += '</table>';

    if (Object.keys(categorias).length === 0) {
        html = '<p style="text-align:center;color:#666;">Nenhuma despesa paga no período selecionado.</p>';
    }

    document.getElementById('relPorCategoria').innerHTML = html;
}

function gerarRelatorioRecorrentes(contas) {
    const recorrentes = contas.filter(c => c.tipo_lancamento === 'recorrente');
    const grupos = {};

    recorrentes.forEach(conta => {
        if (!grupos[conta.recorrencia_id]) {
            grupos[conta.recorrencia_id] = {
                descricao: conta.descricao.split('(')[0].trim(),
                valor: conta.valor,
                periodicidade: conta.periodicidade,
                total: conta.total_parcelas || 'Indefinido',
                quantidade: 0
            };
        }
        grupos[conta.recorrencia_id].quantidade++;
    });

    let html = '<table style="width:100%;border-collapse:collapse;">';
    html += '<tr style="background:#f5f5f5;"><th style="padding:10px;text-align:left;">Descrição</th><th style="padding:10px;">Valor</th><th style="padding:10px;">Periodicidade</th><th style="padding:10px;">Parcelas</th></tr>';

    Object.values(grupos).forEach(grupo => {
        html += `<tr style="border-bottom:1px solid #eee;">
            <td style="padding:10px;">${grupo.descricao}</td>
            <td style="padding:10px;text-align:center;">R$ ${formatarValor(grupo.valor)}</td>
            <td style="padding:10px;text-align:center;">${grupo.periodicidade}</td>
            <td style="padding:10px;text-align:center;">${grupo.total}</td>
        </tr>`;
    });

    html += '</table>';

    if (Object.keys(grupos).length === 0) {
        html = '<p style="text-align:center;color:#666;">Nenhuma conta recorrente ativa.</p>';
    }

    document.getElementById('relRecorrentes').innerHTML = html;
}

function gerarMaioresDespesas(contas) {
    const maiores = contas
        .sort((a, b) => parseFloat(b.valor) - parseFloat(a.valor))
        .slice(0, 5);

    let html = '<table style="width:100%;border-collapse:collapse;">';
    html += '<tr style="background:#f5f5f5;"><th style="padding:10px;text-align:left;">Descrição</th><th style="padding:10px;text-align:right;">Valor</th></tr>';

    maiores.forEach(conta => {
        html += `<tr style="border-bottom:1px solid #eee;">
            <td style="padding:10px;">${conta.descricao}</td>
            <td style="padding:10px;text-align:right;font-weight:600;">R$ ${formatarValor(conta.valor)}</td>
        </tr>`;
    });

    html += '</table>';

    if (maiores.length === 0) {
        html = '<p style="text-align:center;color:#666;">Nenhuma despesa no período.</p>';
    }

    document.getElementById('relMaioresDespesas').innerHTML = html;
}

function gerarEvolucaoMensal(contas) {
    const meses = {};

    contas.forEach(conta => {
        const mes = conta.data_vencimento.substring(0, 7);
        if (!meses[mes]) {
            meses[mes] = { total: 0, pago: 0, pendente: 0, qtd: 0 };
        }
        const valor = parseFloat(conta.valor);
        meses[mes].total += valor;
        meses[mes].qtd++;
        if (conta.status === 'pago') {
            meses[mes].pago += valor;
        } else {
            meses[mes].pendente += valor;
        }
    });

    let html = '<table style="width:100%;border-collapse:collapse;">';
    html += '<tr style="background:#f5f5f5;">';
    html += '<th style="padding:10px;text-align:left;">Mês</th>';
    html += '<th style="padding:10px;text-align:right;">Contas</th>';
    html += '<th style="padding:10px;text-align:right;">Total</th>';
    html += '<th style="padding:10px;text-align:right;">Pago</th>';
    html += '<th style="padding:10px;text-align:right;">Pendente</th>';
    html += '</tr>';

    Object.entries(meses).sort().reverse().forEach(([mes, dados]) => {
        const [ano, mesNum] = mes.split('-');
        const mesNome = new Date(ano, mesNum - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        
        html += `<tr style="border-bottom:1px solid #eee;">
            <td style="padding:10px;">${mesNome}</td>
            <td style="padding:10px;text-align:right;">${dados.qtd}</td>
            <td style="padding:10px;text-align:right;font-weight:600;">R$ ${formatarValor(dados.total)}</td>
            <td style="padding:10px;text-align:right;color:#155724;">R$ ${formatarValor(dados.pago)}</td>
            <td style="padding:10px;text-align:right;color:#856404;">R$ ${formatarValor(dados.pendente)}</td>
        </tr>`;
    });

    html += '</table>';

    if (Object.keys(meses).length === 0) {
        html = '<p style="text-align:center;color:#666;">Nenhum dado no período.</p>';
    }

    document.getElementById('relEvolucaoMensal').innerHTML = html;
}

function gerarRelatorioCredores(contas) {
    const credores = {};

    contas.forEach(conta => {
        if (!credores[conta.credor]) {
            credores[conta.credor] = { qtd: 0, total: 0 };
        }
        credores[conta.credor].qtd++;
        credores[conta.credor].total += parseFloat(conta.valor);
    });

    const sorted = Object.entries(credores)
        .sort((a, b) => b[1].total - a[1].total)
        .slice(0, 10);

    let html = '<table style="width:100%;border-collapse:collapse;">';
    html += '<tr style="background:#f5f5f5;"><th style="padding:10px;text-align:left;">Credor</th><th style="padding:10px;text-align:center;">Contas</th><th style="padding:10px;text-align:right;">Total</th></tr>';

    sorted.forEach(([credor, dados]) => {
        html += `<tr style="border-bottom:1px solid #eee;">
            <td style="padding:10px;">${credor}</td>
            <td style="padding:10px;text-align:center;">${dados.qtd}</td>
            <td style="padding:10px;text-align:right;font-weight:600;">R$ ${formatarValor(dados.total)}</td>
        </tr>`;
    });

    html += '</table>';

    if (sorted.length === 0) {
        html = '<p style="text-align:center;color:#666;">Nenhum credor no período.</p>';
    }

    document.getElementById('relCredores').innerHTML = html;
}

function gerarRelatorioVencimentos(contas) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const vencendo7dias = contas.filter(c => {
        const venc = new Date(c.data_vencimento);
        venc.setHours(0, 0, 0, 0);
        const diff = (venc - hoje) / (1000 * 60 * 60 * 24);
        return c.status === 'pendente' && diff >= 0 && diff <= 7;
    });

    const vencidas = contas.filter(c => {
        const venc = new Date(c.data_vencimento);
        venc.setHours(0, 0, 0, 0);
        return c.status === 'pendente' && venc < hoje;
    });

    let html = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">';
    
    html += '<div>';
    html += '<h4 style="margin-bottom:10px;color:#856404;">Vencendo em 7 dias (' + vencendo7dias.length + ')</h4>';
    if (vencendo7dias.length > 0) {
        html += '<div style="max-height:200px;overflow-y:auto;">';
        vencendo7dias.forEach(c => {
            const dias = Math.ceil((new Date(c.data_vencimento) - hoje) / (1000 * 60 * 60 * 24));
            html += `<div style="padding:8px;border-bottom:1px solid #eee;">
                <strong>${c.descricao}</strong><br>
                <small>R$ ${formatarValor(c.valor)} - ${dias} dia(s)</small>
            </div>`;
        });
        html += '</div>';
    } else {
        html += '<p style="color:#666;">Nenhuma conta vencendo</p>';
    }
    html += '</div>';

    html += '<div>';
    html += '<h4 style="margin-bottom:10px;color:#721c24;">Vencidas (' + vencidas.length + ')</h4>';
    if (vencidas.length > 0) {
        html += '<div style="max-height:200px;overflow-y:auto;">';
        vencidas.forEach(c => {
            const dias = Math.floor((hoje - new Date(c.data_vencimento)) / (1000 * 60 * 60 * 24));
            html += `<div style="padding:8px;border-bottom:1px solid #eee;">
                <strong>${c.descricao}</strong><br>
                <small>R$ ${formatarValor(c.valor)} - ${dias} dia(s) atraso</small>
            </div>`;
        });
        html += '</div>';
    } else {
        html += '<p style="color:#666;">Nenhuma conta vencida</p>';
    }
    html += '</div>';

    html += '</div>';

    document.getElementById('relVencimentos').innerHTML = html;
}

function exportarRelatorio() {
    if (!supabase) {
        alert('Configure o Supabase primeiro!');
        return;
    }

    const mesInicio = document.getElementById('relMesInicio').value;
    const mesFim = document.getElementById('relMesFim').value;

    if (!mesInicio || !mesFim) {
        alert('Selecione o período!');
        return;
    }

    const dataInicio = `${mesInicio}-01`;
    const [anoFim, mesFimNum] = mesFim.split('-');
    const dataFim = `${anoFim}-${mesFimNum}-31`;

    supabase
        .from('contas_pagar')
        .select('*')
        .gte('data_vencimento', dataInicio)
        .lte('data_vencimento', dataFim)
        .order('data_vencimento', { ascending: true })
        .then(({ data, error }) => {
            if (error) throw error;

            let csv = 'Descrição,Valor,Credor,Tipo,Vencimento,Status,Tipo Lançamento\n';
            data.forEach(conta => {
                csv += `"${conta.descricao}",${conta.valor},"${conta.credor}","${conta.tipo_despesa}",${conta.data_vencimento},${conta.status},${conta.tipo_lancamento}\n`;
            });

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `relatorio_${mesInicio}_a_${mesFim}.csv`;
            link.click();
        })
        .catch(error => {
            alert('Erro ao exportar: ' + error.message);
        });
}