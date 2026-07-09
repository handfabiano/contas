/**
 * Cliente de dados - Supabase (Postgres)
 * Mesma interface pública do antigo cliente REST (PHP), agora
 * implementada sobre supabaseClient (ver js/supabase-config.js).
 */

function proximoMesISO(mes) {
    const [ano, m] = mes.split('-').map(Number);
    const data = new Date(Date.UTC(ano, m, 1));
    return `${data.getUTCFullYear()}-${String(data.getUTCMonth() + 1).padStart(2, '0')}-01`;
}

function somarValores(linhas) {
    return linhas.reduce((total, linha) => total + Number(linha.valor), 0);
}

class APIClient {
    // ============================================
    // CONTAS (saídas)
    // ============================================

    async listarContas(filtros = {}) {
        try {
            let query = supabaseClient.from('contas_pagar').select('*', { count: 'exact' });

            if (filtros.status) query = query.eq('status', filtros.status);
            if (filtros.tipo_despesa) query = query.eq('tipo_despesa', filtros.tipo_despesa);
            if (filtros.fundo_id) query = query.eq('fundo_id', filtros.fundo_id);
            if (filtros.mes) {
                query = query.gte('data_vencimento', `${filtros.mes}-01`).lt('data_vencimento', proximoMesISO(filtros.mes));
            }
            if (filtros.data_inicio) query = query.gte('data_vencimento', filtros.data_inicio);
            if (filtros.data_fim) query = query.lte('data_vencimento', filtros.data_fim);

            const page = Math.max(1, parseInt(filtros.page) || 1);
            const limit = Math.min(100, Math.max(1, parseInt(filtros.limit) || 50));
            const offset = (page - 1) * limit;

            query = query.order('data_vencimento', { ascending: true }).range(offset, offset + limit - 1);

            const { data, error, count } = await query;
            if (error) throw error;

            return {
                success: true,
                message: 'Sucesso',
                data: {
                    contas: data,
                    pagination: {
                        page,
                        limit,
                        total: count || 0,
                        pages: Math.ceil((count || 0) / limit)
                    }
                }
            };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async buscarConta(id) {
        try {
            const { data, error } = await supabaseClient.from('contas_pagar').select('*').eq('id', id).single();
            if (error) throw error;
            return { success: true, message: 'Sucesso', data };
        } catch (error) {
            return { success: false, message: 'Conta não encontrada' };
        }
    }

    async criarConta(dados) {
        try {
            if (!dados.fundo_id) {
                return { success: false, message: 'Selecione o fundo de onde sai o dinheiro' };
            }

            const payload = {
                fundo_id: dados.fundo_id,
                descricao: (dados.descricao || '').trim(),
                valor: dados.valor,
                credor: (dados.credor || '').trim(),
                tipo_despesa: dados.tipo_despesa,
                data_vencimento: dados.data_vencimento,
                observacoes: dados.observacoes ?? null,
                status: dados.status || 'pendente',
                tipo_lancamento: dados.tipo_lancamento || 'individual',
                recorrencia_id: dados.recorrencia_id ?? null,
                parcela_atual: dados.parcela_atual ?? null,
                total_parcelas: dados.total_parcelas ?? null,
                periodicidade: dados.periodicidade ?? null
            };

            const { data, error } = await supabaseClient.from('contas_pagar').insert(payload).select().single();
            if (error) throw error;

            return { success: true, message: 'Conta criada com sucesso', data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async criarContasRecorrentes(contas) {
        return Promise.all(contas.map(conta => this.criarConta(conta)));
    }

    async atualizarConta(id, dados) {
        try {
            const permitidos = ['fundo_id', 'descricao', 'valor', 'credor', 'tipo_despesa', 'data_vencimento', 'observacoes', 'status', 'parcela_atual', 'total_parcelas'];
            const payload = {};
            permitidos.forEach(campo => {
                if (dados[campo] !== undefined) payload[campo] = dados[campo];
            });

            const { data, error } = await supabaseClient.from('contas_pagar').update(payload).eq('id', id).select().single();
            if (error) throw error;

            return { success: true, message: 'Conta atualizada com sucesso', data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async marcarComoPago(id) {
        try {
            const { data, error } = await supabaseClient.from('contas_pagar').update({ status: 'pago' }).eq('id', id).select().single();
            if (error) throw error;
            return { success: true, message: 'Conta marcada como paga', data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async excluirConta(id) {
        try {
            const { error } = await supabaseClient.from('contas_pagar').delete().eq('id', id);
            if (error) throw error;
            return { success: true, message: 'Conta excluída com sucesso', data: null };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // ============================================
    // FUNDOS (Entradas / Prestação de Contas)
    // ============================================

    async _comAgregados(fundos) {
        if (fundos.length === 0) return [];

        const ids = fundos.map(f => f.id);
        const { data: saidas, error } = await supabaseClient
            .from('contas_pagar')
            .select('id, fundo_id, valor, status')
            .in('fundo_id', ids);
        if (error) throw error;

        return fundos.map(fundo => {
            const doFundo = saidas.filter(s => s.fundo_id === fundo.id);
            const total_saidas = somarValores(doFundo);
            const total_pago = somarValores(doFundo.filter(s => s.status === 'pago'));

            return {
                ...fundo,
                total_saidas,
                total_pago,
                saldo: Number(fundo.valor_entrada) - total_saidas,
                qtd_saidas: doFundo.length
            };
        });
    }

    async listarFundos(filtros = {}) {
        try {
            let query = supabaseClient.from('fundos').select('*').order('data_entrada', { ascending: false });

            if (filtros.status) query = query.eq('status', filtros.status);
            if (filtros.mes) {
                query = query.gte('data_entrada', `${filtros.mes}-01`).lt('data_entrada', proximoMesISO(filtros.mes));
            }

            const { data: fundos, error } = await query;
            if (error) throw error;

            const fundosComAgregados = await this._comAgregados(fundos);
            return { success: true, message: 'Sucesso', data: { fundos: fundosComAgregados } };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async buscarFundo(id) {
        try {
            const { data: fundo, error } = await supabaseClient.from('fundos').select('*').eq('id', id).single();
            if (error) throw error;

            const { data: saidas, error: errSaidas } = await supabaseClient
                .from('contas_pagar')
                .select('*')
                .eq('fundo_id', id)
                .order('data_vencimento', { ascending: true });
            if (errSaidas) throw errSaidas;

            const total_saidas = somarValores(saidas);
            const total_pago = somarValores(saidas.filter(s => s.status === 'pago'));

            return {
                success: true,
                message: 'Sucesso',
                data: {
                    ...fundo,
                    total_saidas,
                    total_pago,
                    saldo: Number(fundo.valor_entrada) - total_saidas,
                    qtd_saidas: saidas.length,
                    saidas
                }
            };
        } catch (error) {
            return { success: false, message: 'Fundo não encontrado' };
        }
    }

    async criarFundo(dados) {
        try {
            if (!dados.descricao || !dados.fonte || !dados.valor_entrada || !dados.data_entrada) {
                return { success: false, message: 'Preencha os campos obrigatórios' };
            }
            if (Number(dados.valor_entrada) <= 0) {
                return { success: false, message: 'Valor deve ser maior que zero' };
            }

            const payload = {
                descricao: dados.descricao.trim(),
                fonte: dados.fonte.trim(),
                valor_entrada: Number(dados.valor_entrada),
                data_entrada: dados.data_entrada,
                categoria: dados.categoria ?? null,
                observacoes: dados.observacoes ?? null,
                status: dados.status || 'aberto'
            };

            const { data, error } = await supabaseClient.from('fundos').insert(payload).select().single();
            if (error) throw error;

            return { success: true, message: 'Entrada registrada com sucesso', data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async atualizarFundo(id, dados) {
        try {
            const permitidos = ['descricao', 'fonte', 'valor_entrada', 'data_entrada', 'categoria', 'observacoes', 'status'];
            const payload = {};
            permitidos.forEach(campo => {
                if (dados[campo] !== undefined) payload[campo] = dados[campo];
            });

            const { data, error } = await supabaseClient.from('fundos').update(payload).eq('id', id).select().single();
            if (error) throw error;

            return { success: true, message: 'Fundo atualizado com sucesso', data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async excluirFundo(id) {
        try {
            const { count, error: errCount } = await supabaseClient
                .from('contas_pagar')
                .select('id', { count: 'exact', head: true })
                .eq('fundo_id', id);
            if (errCount) throw errCount;

            if (count > 0) {
                return { success: false, message: `Não é possível excluir: este fundo possui ${count} saída(s) vinculada(s). Exclua as saídas primeiro.` };
            }

            const { error } = await supabaseClient.from('fundos').delete().eq('id', id);
            if (error) throw error;

            return { success: true, message: 'Fundo excluído com sucesso', data: null };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // ============================================
    // RELATÓRIOS
    // ============================================

    async _contasNoPeriodo({ mes, data_inicio, data_fim } = {}) {
        let query = supabaseClient.from('contas_pagar').select('*');
        if (mes) {
            query = query.gte('data_vencimento', `${mes}-01`).lt('data_vencimento', proximoMesISO(mes));
        } else if (data_inicio && data_fim) {
            query = query.gte('data_vencimento', data_inicio).lte('data_vencimento', data_fim);
        }
        const { data, error } = await query;
        if (error) throw error;
        return data;
    }

    async relatorioResumo(filtros = {}) {
        try {
            const contas = await this._contasNoPeriodo(filtros);
            const hoje = new Date().toISOString().split('T')[0];
            const em7dias = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

            const porStatusMap = {};
            contas.forEach(c => {
                if (!porStatusMap[c.status]) porStatusMap[c.status] = { status: c.status, quantidade: 0, total: 0 };
                porStatusMap[c.status].quantidade++;
                porStatusMap[c.status].total += Number(c.valor);
            });

            const atrasadas = contas.filter(c => c.status === 'pendente' && c.data_vencimento < hoje);
            const proximos7Dias = contas.filter(c => c.status === 'pendente' && c.data_vencimento >= hoje && c.data_vencimento <= em7dias);

            return {
                success: true,
                message: 'Sucesso',
                data: {
                    resumo: {
                        total_contas: contas.length,
                        valor_total: somarValores(contas),
                        valor_medio: contas.length ? somarValores(contas) / contas.length : 0
                    },
                    por_status: Object.values(porStatusMap),
                    atrasadas: { quantidade: atrasadas.length, total: somarValores(atrasadas) },
                    proximos_7_dias: { quantidade: proximos7Dias.length, total: somarValores(proximos7Dias) }
                }
            };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async relatorioPorStatus(filtros = {}) {
        try {
            const contas = await this._contasNoPeriodo(filtros);
            const mapa = {};
            contas.forEach(c => {
                if (!mapa[c.status]) mapa[c.status] = { status: c.status, quantidade: 0, total: 0 };
                mapa[c.status].quantidade++;
                mapa[c.status].total += Number(c.valor);
            });
            const dados = Object.values(mapa)
                .map(item => ({ ...item, media: item.quantidade ? item.total / item.quantidade : 0 }))
                .sort((a, b) => b.total - a.total);

            return { success: true, message: 'Sucesso', data: dados };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async relatorioPorTipo(filtros = {}) {
        try {
            const contas = await this._contasNoPeriodo(filtros);
            const totalGeral = somarValores(contas);
            const mapa = {};
            contas.forEach(c => {
                if (!mapa[c.tipo_despesa]) mapa[c.tipo_despesa] = { tipo_despesa: c.tipo_despesa, quantidade: 0, total: 0 };
                mapa[c.tipo_despesa].quantidade++;
                mapa[c.tipo_despesa].total += Number(c.valor);
            });
            const dados = Object.values(mapa)
                .map(item => ({
                    ...item,
                    media: item.quantidade ? item.total / item.quantidade : 0,
                    percentual: totalGeral ? Math.round((item.total * 100 / totalGeral) * 100) / 100 : 0
                }))
                .sort((a, b) => b.total - a.total);

            return { success: true, message: 'Sucesso', data: dados };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async relatorioMensal(meses = 6) {
        try {
            const qtdMeses = Math.min(24, Math.max(1, parseInt(meses) || 6));
            const desde = new Date();
            desde.setMonth(desde.getMonth() - qtdMeses);
            const desdeISO = desde.toISOString().split('T')[0];

            const { data: contas, error } = await supabaseClient
                .from('contas_pagar')
                .select('*')
                .gte('data_vencimento', desdeISO);
            if (error) throw error;

            const mapa = {};
            contas.forEach(c => {
                const mes = c.data_vencimento.substring(0, 7);
                if (!mapa[mes]) {
                    mapa[mes] = { mes, data_mes: `${mes}-01`, quantidade: 0, total: 0, total_pago: 0, total_pendente: 0, total_atrasado: 0 };
                }
                mapa[mes].quantidade++;
                mapa[mes].total += Number(c.valor);
                if (c.status === 'pago') mapa[mes].total_pago += Number(c.valor);
                if (c.status === 'pendente') mapa[mes].total_pendente += Number(c.valor);
                if (c.status === 'atrasado') mapa[mes].total_atrasado += Number(c.valor);
            });

            const dados = Object.values(mapa).sort((a, b) => a.mes.localeCompare(b.mes));
            return { success: true, message: 'Sucesso', data: dados };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async proximosVencimentos(dias = 30) {
        try {
            const qtdDias = Math.min(90, Math.max(1, parseInt(dias) || 30));
            const hoje = new Date();
            const limite = new Date(Date.now() + qtdDias * 86400000);
            const hojeISO = hoje.toISOString().split('T')[0];
            const limiteISO = limite.toISOString().split('T')[0];

            const { data, error } = await supabaseClient
                .from('contas_pagar')
                .select('*')
                .eq('status', 'pendente')
                .gte('data_vencimento', hojeISO)
                .lte('data_vencimento', limiteISO)
                .order('data_vencimento', { ascending: true })
                .limit(50);
            if (error) throw error;

            const dados = data.map(c => ({
                ...c,
                dias_restantes: Math.round((new Date(c.data_vencimento) - new Date(hojeISO)) / 86400000)
            }));

            return { success: true, message: 'Sucesso', data: dados };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async dashboard(mes = null) {
        try {
            const mesRef = mes || new Date().toISOString().substring(0, 7);
            const hojeISO = new Date().toISOString().split('T')[0];

            const { data: doMes, error } = await supabaseClient
                .from('contas_pagar')
                .select('*')
                .gte('data_vencimento', `${mesRef}-01`)
                .lt('data_vencimento', proximoMesISO(mesRef));
            if (error) throw error;

            const { data: atrasadasRows, error: errAtraso } = await supabaseClient
                .from('contas_pagar')
                .select('valor')
                .eq('status', 'pendente')
                .lt('data_vencimento', hojeISO);
            if (errAtraso) throw errAtraso;

            const total_pendente = somarValores(doMes.filter(c => c.status === 'pendente'));
            const total_pago = somarValores(doMes.filter(c => c.status === 'pago'));
            const total_atrasado = somarValores(atrasadasRows);

            const porTipoMap = {};
            doMes.forEach(c => {
                porTipoMap[c.tipo_despesa] = (porTipoMap[c.tipo_despesa] || 0) + Number(c.valor);
            });
            const por_tipo = Object.entries(porTipoMap)
                .map(([tipo_despesa, total]) => ({ tipo_despesa, total }))
                .sort((a, b) => b.total - a.total)
                .slice(0, 5);

            return {
                success: true,
                message: 'Sucesso',
                data: {
                    mes: mesRef,
                    total_pendente,
                    total_pago,
                    total_atrasado,
                    total_mes: total_pendente + total_pago,
                    por_tipo
                }
            };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async testarConexao() {
        try {
            const { error } = await supabaseClient.from('contas_pagar').select('id', { count: 'exact', head: true });
            if (error) throw error;
            return { success: true, data: { message: 'Conexão com o Supabase estabelecida' } };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

// Instância global
const api = new APIClient();
