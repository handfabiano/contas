/**
 * Cliente da API REST - Substitui Supabase
 * Gerencia todas as chamadas HTTP para o backend PHP
 */

class APIClient {
    constructor() {
        // Detecta automaticamente o base URL
        const path = window.location.pathname;
        const dir = path.substring(0, path.lastIndexOf('/'));

        // Se está em subdiretório, adiciona ao caminho
        if (dir && dir !== '/') {
            this.baseURL = window.location.origin + dir + '/api';
        } else {
            this.baseURL = window.location.origin + '/api';
        }

        this.timeout = 30000; // 30 segundos

        // Debug: mostra URL base no console
        console.log('🔗 API Base URL:', this.baseURL);
    }

    /**
     * Faz requisição HTTP genérica
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}/${endpoint}`;

        const config = {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // Adiciona body se necessário
        if (options.body && typeof options.body === 'object') {
            config.body = JSON.stringify(options.body);
        }

        try {
            console.log('📡 Requisição:', method || 'GET', url);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);

            const response = await fetch(url, {
                ...config,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            console.log('📥 Resposta:', response.status, response.statusText);

            // Pega o texto bruto primeiro
            const textData = await response.text();
            console.log('📄 Resposta bruta (primeiros 200 chars):', textData.substring(0, 200));

            // Tenta parsear JSON
            let data;
            const contentType = response.headers.get('content-type');

            if (contentType && contentType.includes('application/json')) {
                try {
                    data = JSON.parse(textData);
                } catch (e) {
                    console.error('❌ Erro ao parsear JSON:', e);
                    console.error('📄 Resposta completa:', textData);
                    throw new Error('API retornou resposta inválida. Verifique o console para detalhes.');
                }
            } else {
                // Se não for JSON, mostra o HTML/texto retornado
                console.error('⚠️ API não retornou JSON! Content-Type:', contentType);
                console.error('📄 Conteúdo:', textData);
                throw new Error('API retornou ' + contentType + ' ao invés de JSON. Verifique o console.');
            }

            // Verifica se houve erro HTTP
            if (!response.ok) {
                throw new Error(data.message || `Erro HTTP ${response.status}`);
            }

            return data;

        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('Requisição timeout - verifique sua conexão');
            }
            console.error('❌ Erro na requisição:', error);
            throw error;
        }
    }

    /**
     * GET request
     */
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url, { method: 'GET' });
    }

    /**
     * POST request
     */
    async post(endpoint, body = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body
        });
    }

    /**
     * PUT request
     */
    async put(endpoint, body = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body
        });
    }

    /**
     * PATCH request
     */
    async patch(endpoint, body = {}) {
        return this.request(endpoint, {
            method: 'PATCH',
            body
        });
    }

    /**
     * DELETE request
     */
    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }

    // ============================================
    // MÉTODOS ESPECÍFICOS DA API
    // ============================================

    /**
     * Contas - Listar com filtros
     */
    async listarContas(filtros = {}) {
        return this.get('contas.php', filtros);
    }

    /**
     * Contas - Buscar por ID
     */
    async buscarConta(id) {
        return this.get('contas.php', { id });
    }

    /**
     * Contas - Criar nova
     */
    async criarConta(dados) {
        return this.post('contas.php', dados);
    }

    /**
     * Contas - Criar múltiplas (para recorrentes)
     */
    async criarContasRecorrentes(contas) {
        // Cria cada conta individualmente
        const promises = contas.map(conta => this.criarConta(conta));
        return Promise.all(promises);
    }

    /**
     * Contas - Atualizar
     */
    async atualizarConta(id, dados) {
        return this.put(`contas.php?id=${id}`, dados);
    }

    /**
     * Contas - Marcar como pago
     */
    async marcarComoPago(id) {
        return this.patch(`contas.php?id=${id}&pagar=1`);
    }

    /**
     * Contas - Excluir
     */
    async excluirConta(id) {
        return this.delete(`contas.php?id=${id}`);
    }

    /**
     * Relatórios - Resumo geral
     */
    async relatorioResumo(filtros = {}) {
        return this.get('relatorios.php', { tipo: 'resumo', ...filtros });
    }

    /**
     * Relatórios - Por status
     */
    async relatorioPorStatus(filtros = {}) {
        return this.get('relatorios.php', { tipo: 'por_status', ...filtros });
    }

    /**
     * Relatórios - Por tipo de despesa
     */
    async relatorioPorTipo(filtros = {}) {
        return this.get('relatorios.php', { tipo: 'por_tipo', ...filtros });
    }

    /**
     * Relatórios - Mensal
     */
    async relatorioMensal(meses = 6) {
        return this.get('relatorios.php', { tipo: 'mensal', meses });
    }

    /**
     * Relatórios - Próximos vencimentos
     */
    async proximosVencimentos(dias = 30) {
        return this.get('relatorios.php', { tipo: 'vencimentos', dias });
    }

    /**
     * Relatórios - Dashboard
     */
    async dashboard(mes = null) {
        const params = { tipo: 'dashboard' };
        if (mes) params.mes = mes;
        return this.get('relatorios.php', params);
    }

    /**
     * Testa conexão com a API
     */
    async testarConexao() {
        try {
            const response = await this.get('contas.php', { limit: 1 });
            return { success: true, data: response };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

// Instância global
const api = new APIClient();
