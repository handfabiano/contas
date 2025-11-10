-- ============================================
-- QUERIES ÚTEIS PARA O SUPABASE
-- ============================================

-- 1. VISUALIZAR TODAS AS CONTAS
SELECT * FROM contas_pagar ORDER BY data_vencimento DESC;

-- 2. CONTAS PENDENTES
SELECT * FROM contas_pagar 
WHERE status = 'pendente' 
ORDER BY data_vencimento;

-- 3. CONTAS ATRASADAS
SELECT * FROM contas_pagar 
WHERE status = 'pendente' 
AND data_vencimento < CURRENT_DATE
ORDER BY data_vencimento;

-- 4. CONTAS DO MÊS ATUAL
SELECT * FROM contas_pagar 
WHERE EXTRACT(MONTH FROM data_vencimento) = EXTRACT(MONTH FROM CURRENT_DATE)
AND EXTRACT(YEAR FROM data_vencimento) = EXTRACT(YEAR FROM CURRENT_DATE)
ORDER BY data_vencimento;

-- 5. TOTAL DE DESPESAS POR TIPO
SELECT 
    tipo_despesa,
    COUNT(*) as quantidade,
    SUM(valor) as total,
    AVG(valor) as media
FROM contas_pagar
GROUP BY tipo_despesa
ORDER BY total DESC;

-- 6. TOTAL POR STATUS
SELECT 
    status,
    COUNT(*) as quantidade,
    SUM(valor) as total
FROM contas_pagar
GROUP BY status;

-- 7. MAIORES CREDORES
SELECT 
    credor,
    COUNT(*) as quantidade_contas,
    SUM(valor) as total_devido
FROM contas_pagar
WHERE status = 'pendente'
GROUP BY credor
ORDER BY total_devido DESC
LIMIT 10;

-- 8. CONTAS RECORRENTES
SELECT * FROM contas_pagar 
WHERE recorrente = TRUE
ORDER BY data_vencimento;

-- 9. RELATÓRIO MENSAL
SELECT 
    TO_CHAR(data_vencimento, 'YYYY-MM') as mes,
    COUNT(*) as quantidade,
    SUM(valor) as total,
    SUM(CASE WHEN status = 'pago' THEN valor ELSE 0 END) as pago,
    SUM(CASE WHEN status = 'pendente' THEN valor ELSE 0 END) as pendente
FROM contas_pagar
GROUP BY TO_CHAR(data_vencimento, 'YYYY-MM')
ORDER BY mes DESC;

-- 10. DESPESAS DOS ÚLTIMOS 6 MESES
SELECT 
    tipo_despesa,
    TO_CHAR(data_vencimento, 'YYYY-MM') as mes,
    SUM(valor) as total
FROM contas_pagar
WHERE data_vencimento >= CURRENT_DATE - INTERVAL '6 months'
GROUP BY tipo_despesa, TO_CHAR(data_vencimento, 'YYYY-MM')
ORDER BY mes DESC, total DESC;

-- ============================================
-- QUERIES DE MANUTENÇÃO
-- ============================================

-- 11. LIMPAR CONTAS PAGAS ANTIGAS (mais de 2 anos)
DELETE FROM contas_pagar 
WHERE status = 'pago' 
AND data_pagamento < CURRENT_DATE - INTERVAL '2 years';

-- 12. ATUALIZAR STATUS DE CONTAS ATRASADAS (executar manualmente se necessário)
UPDATE contas_pagar 
SET status = 'atrasado' 
WHERE status = 'pendente' 
AND data_vencimento < CURRENT_DATE;

-- 13. BACKUP DE DADOS (exportar para outra tabela)
CREATE TABLE contas_pagar_backup AS 
SELECT * FROM contas_pagar;

-- ============================================
-- QUERIES AVANÇADAS
-- ============================================

-- 14. PROJEÇÃO DE GASTOS FUTUROS (próximos 3 meses)
SELECT 
    TO_CHAR(data_vencimento, 'YYYY-MM') as mes,
    tipo_despesa,
    SUM(valor) as total_projetado
FROM contas_pagar
WHERE status = 'pendente'
AND data_vencimento BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '3 months'
GROUP BY TO_CHAR(data_vencimento, 'YYYY-MM'), tipo_despesa
ORDER BY mes, total_projetado DESC;

-- 15. ANÁLISE DE SAZONALIDADE (média por mês do ano)
SELECT 
    EXTRACT(MONTH FROM data_vencimento) as mes_numero,
    TO_CHAR(data_vencimento, 'Month') as mes_nome,
    COUNT(*) as quantidade,
    AVG(valor) as valor_medio,
    SUM(valor) as total
FROM contas_pagar
GROUP BY EXTRACT(MONTH FROM data_vencimento), TO_CHAR(data_vencimento, 'Month')
ORDER BY mes_numero;

-- 16. CONTAS COM MAIOR IMPACTO NO ORÇAMENTO
SELECT 
    descricao,
    valor,
    credor,
    tipo_despesa,
    (valor / (SELECT SUM(valor) FROM contas_pagar WHERE status = 'pendente')) * 100 as percentual_orcamento
FROM contas_pagar
WHERE status = 'pendente'
ORDER BY valor DESC
LIMIT 10;

-- 17. HISTÓRICO DE PAGAMENTOS
SELECT 
    TO_CHAR(data_pagamento, 'YYYY-MM') as mes,
    COUNT(*) as contas_pagas,
    SUM(valor) as total_pago,
    AVG(valor) as ticket_medio
FROM contas_pagar
WHERE status = 'pago'
AND data_pagamento IS NOT NULL
GROUP BY TO_CHAR(data_pagamento, 'YYYY-MM')
ORDER BY mes DESC;

-- 18. ANÁLISE DE PONTUALIDADE (contas pagas vs prazo)
SELECT 
    CASE 
        WHEN data_pagamento <= data_vencimento THEN 'No Prazo'
        WHEN data_pagamento > data_vencimento THEN 'Atrasado'
        ELSE 'Pendente'
    END as situacao,
    COUNT(*) as quantidade,
    SUM(valor) as total
FROM contas_pagar
GROUP BY 
    CASE 
        WHEN data_pagamento <= data_vencimento THEN 'No Prazo'
        WHEN data_pagamento > data_vencimento THEN 'Atrasado'
        ELSE 'Pendente'
    END;

-- 19. CREDORES MAIS FREQUENTES
SELECT 
    credor,
    COUNT(*) as numero_transacoes,
    AVG(valor) as valor_medio,
    MIN(data_vencimento) as primeira_transacao,
    MAX(data_vencimento) as ultima_transacao
FROM contas_pagar
GROUP BY credor
HAVING COUNT(*) >= 3
ORDER BY numero_transacoes DESC;

-- 20. ESTATÍSTICAS GERAIS
SELECT 
    COUNT(*) as total_contas,
    COUNT(DISTINCT credor) as total_credores,
    COUNT(DISTINCT tipo_despesa) as tipos_diferentes,
    SUM(valor) as valor_total,
    AVG(valor) as valor_medio,
    MIN(valor) as menor_conta,
    MAX(valor) as maior_conta,
    SUM(CASE WHEN recorrente = TRUE THEN 1 ELSE 0 END) as contas_recorrentes
FROM contas_pagar;

-- ============================================
-- CRIAÇÃO DE VIEWS ÚTEIS
-- ============================================

-- View para Dashboard
CREATE OR REPLACE VIEW vw_dashboard AS
SELECT 
    COUNT(*) as total_contas,
    SUM(CASE WHEN status = 'pendente' THEN 1 ELSE 0 END) as pendentes,
    SUM(CASE WHEN status = 'pago' THEN 1 ELSE 0 END) as pagas,
    SUM(CASE WHEN status = 'pendente' AND data_vencimento < CURRENT_DATE THEN 1 ELSE 0 END) as atrasadas,
    SUM(valor) as valor_total,
    SUM(CASE WHEN status = 'pendente' THEN valor ELSE 0 END) as valor_pendente,
    SUM(CASE WHEN status = 'pago' THEN valor ELSE 0 END) as valor_pago
FROM contas_pagar;

-- View para Contas Vencendo Hoje
CREATE OR REPLACE VIEW vw_contas_hoje AS
SELECT * FROM contas_pagar
WHERE data_vencimento = CURRENT_DATE
AND status = 'pendente';

-- View para Contas da Semana
CREATE OR REPLACE VIEW vw_contas_semana AS
SELECT * FROM contas_pagar
WHERE data_vencimento BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
AND status = 'pendente'
ORDER BY data_vencimento;
