-- ============================================
-- DADOS DE TESTE PARA DEMONSTRAÇÃO
-- ============================================
-- Execute este SQL no Supabase para popular o banco com dados de exemplo
-- Útil para testar o sistema e ver como funciona com dados reais

-- IMPORTANTE: Este script irá inserir dados fictícios no seu banco de dados
-- Use apenas para testes ou demonstrações

-- ============================================
-- INSERIR CONTAS INDIVIDUAIS
-- ============================================

-- Contas de Moradia
INSERT INTO contas_pagar (descricao, valor, credor, tipo_despesa, data_vencimento, status) VALUES
('Aluguel - Novembro 2025', 1500.00, 'Imobiliária São Paulo', 'Moradia', '2025-11-05', 'pendente'),
('Condomínio - Novembro 2025', 350.00, 'Condomínio Residencial', 'Moradia', '2025-11-10', 'pendente'),
('Conta de Luz - Outubro 2025', 180.50, 'CPFL Energia', 'Moradia', '2025-10-15', 'pago'),
('Conta de Água - Outubro 2025', 85.30, 'SABESP', 'Moradia', '2025-10-12', 'pago'),
('Internet - Novembro 2025', 99.90, 'Vivo Fibra', 'Serviços', '2025-11-08', 'pendente');

-- Contas de Transporte
INSERT INTO contas_pagar (descricao, valor, credor, tipo_despesa, data_vencimento, status) VALUES
('Seguro do Carro - Parcela', 450.00, 'Porto Seguro', 'Transporte', '2025-11-15', 'pendente'),
('IPVA 2025 - Parcela 3/3', 380.00, 'Detran SP', 'Impostos', '2025-10-25', 'atrasado'),
('Manutenção Veículo', 650.00, 'Auto Center Silva', 'Transporte', '2025-10-20', 'pago');

-- Contas de Saúde
INSERT INTO contas_pagar (descricao, valor, credor, tipo_despesa, data_vencimento, status) VALUES
('Plano de Saúde - Novembro', 520.00, 'Unimed', 'Saúde', '2025-11-01', 'pendente'),
('Dentista - Tratamento Canal', 800.00, 'Clínica Odontológica', 'Saúde', '2025-10-28', 'atrasado'),
('Farmácia - Medicamentos', 150.00, 'Drogaria São Paulo', 'Saúde', '2025-10-18', 'pago');

-- Contas de Alimentação
INSERT INTO contas_pagar (descricao, valor, credor, tipo_despesa, data_vencimento, status) VALUES
('Supermercado - Compra Mensal', 650.00, 'Carrefour', 'Alimentação', '2025-10-22', 'pago'),
('Feira Semanal', 120.00, 'Mercado Municipal', 'Alimentação', '2025-10-19', 'pago'),
('Cartão Refeição', 400.00, 'Alelo', 'Alimentação', '2025-11-05', 'pendente');

-- Contas de Educação
INSERT INTO contas_pagar (descricao, valor, credor, tipo_despesa, data_vencimento, status) VALUES
('Mensalidade Faculdade', 850.00, 'Universidade XYZ', 'Educação', '2025-11-07', 'pendente'),
('Curso de Inglês', 320.00, 'Wizard', 'Educação', '2025-11-12', 'pendente'),
('Material Escolar', 180.00, 'Livraria Cultura', 'Educação', '2025-10-16', 'pago');

-- Contas de Lazer
INSERT INTO contas_pagar (descricao, valor, credor, tipo_despesa, data_vencimento, status) VALUES
('Academia - Mensalidade', 89.90, 'Smart Fit', 'Lazer', '2025-11-03', 'pendente'),
('Netflix', 55.90, 'Netflix Brasil', 'Lazer', '2025-11-01', 'pendente'),
('Spotify Premium', 21.90, 'Spotify', 'Lazer', '2025-11-01', 'pendente'),
('Cinema - Ingressos', 80.00, 'Cinemark', 'Lazer', '2025-10-21', 'pago');

-- Outras Despesas
INSERT INTO contas_pagar (descricao, valor, credor, tipo_despesa, data_vencimento, status) VALUES
('Celular - Conta', 79.90, 'Claro', 'Serviços', '2025-11-05', 'pendente'),
('Seguro Residencial', 45.00, 'Porto Seguro Residencial', 'Serviços', '2025-11-10', 'pendente'),
('Cartão de Crédito', 1250.00, 'Banco Itaú', 'Outros', '2025-11-20', 'pendente');

-- ============================================
-- INSERIR CONTAS RECORRENTES (Exemplo: 6 meses)
-- ============================================

-- Aluguel Recorrente
INSERT INTO contas_pagar (descricao, valor, credor, tipo_despesa, data_vencimento, status, recorrente, parcela_atual, total_parcelas) VALUES
('Aluguel - Dezembro 2025 (1/6)', 1500.00, 'Imobiliária São Paulo', 'Moradia', '2025-12-05', 'pendente', true, 1, 6),
('Aluguel - Janeiro 2026 (2/6)', 1500.00, 'Imobiliária São Paulo', 'Moradia', '2026-01-05', 'pendente', true, 2, 6),
('Aluguel - Fevereiro 2026 (3/6)', 1500.00, 'Imobiliária São Paulo', 'Moradia', '2026-02-05', 'pendente', true, 3, 6),
('Aluguel - Março 2026 (4/6)', 1500.00, 'Imobiliária São Paulo', 'Moradia', '2026-03-05', 'pendente', true, 4, 6),
('Aluguel - Abril 2026 (5/6)', 1500.00, 'Imobiliária São Paulo', 'Moradia', '2026-04-05', 'pendente', true, 5, 6),
('Aluguel - Maio 2026 (6/6)', 1500.00, 'Imobiliária São Paulo', 'Moradia', '2026-05-05', 'pendente', true, 6, 6);

-- Plano de Saúde Recorrente
INSERT INTO contas_pagar (descricao, valor, credor, tipo_despesa, data_vencimento, status, recorrente, parcela_atual, total_parcelas) VALUES
('Plano de Saúde - Dezembro 2025 (1/6)', 520.00, 'Unimed', 'Saúde', '2025-12-01', 'pendente', true, 1, 6),
('Plano de Saúde - Janeiro 2026 (2/6)', 520.00, 'Unimed', 'Saúde', '2026-01-01', 'pendente', true, 2, 6),
('Plano de Saúde - Fevereiro 2026 (3/6)', 520.00, 'Unimed', 'Saúde', '2026-02-01', 'pendente', true, 3, 6),
('Plano de Saúde - Março 2026 (4/6)', 520.00, 'Unimed', 'Saúde', '2026-03-01', 'pendente', true, 4, 6),
('Plano de Saúde - Abril 2026 (5/6)', 520.00, 'Unimed', 'Saúde', '2026-04-01', 'pendente', true, 5, 6),
('Plano de Saúde - Maio 2026 (6/6)', 520.00, 'Unimed', 'Saúde', '2026-05-01', 'pendente', true, 6, 6);

-- Financiamento Carro (12 parcelas)
INSERT INTO contas_pagar (descricao, valor, credor, tipo_despesa, data_vencimento, status, recorrente, parcela_atual, total_parcelas) VALUES
('Financiamento Carro - Novembro 2025 (1/12)', 890.00, 'Banco Bradesco', 'Transporte', '2025-11-15', 'pendente', true, 1, 12),
('Financiamento Carro - Dezembro 2025 (2/12)', 890.00, 'Banco Bradesco', 'Transporte', '2025-12-15', 'pendente', true, 2, 12),
('Financiamento Carro - Janeiro 2026 (3/12)', 890.00, 'Banco Bradesco', 'Transporte', '2026-01-15', 'pendente', true, 3, 12),
('Financiamento Carro - Fevereiro 2026 (4/12)', 890.00, 'Banco Bradesco', 'Transporte', '2026-02-15', 'pendente', true, 4, 12),
('Financiamento Carro - Março 2026 (5/12)', 890.00, 'Banco Bradesco', 'Transporte', '2026-03-15', 'pendente', true, 5, 12),
('Financiamento Carro - Abril 2026 (6/12)', 890.00, 'Banco Bradesco', 'Transporte', '2026-04-15', 'pendente', true, 6, 12),
('Financiamento Carro - Maio 2026 (7/12)', 890.00, 'Banco Bradesco', 'Transporte', '2026-05-15', 'pendente', true, 7, 12),
('Financiamento Carro - Junho 2026 (8/12)', 890.00, 'Banco Bradesco', 'Transporte', '2026-06-15', 'pendente', true, 8, 12),
('Financiamento Carro - Julho 2026 (9/12)', 890.00, 'Banco Bradesco', 'Transporte', '2026-07-15', 'pendente', true, 9, 12),
('Financiamento Carro - Agosto 2026 (10/12)', 890.00, 'Banco Bradesco', 'Transporte', '2026-08-15', 'pendente', true, 10, 12),
('Financiamento Carro - Setembro 2026 (11/12)', 890.00, 'Banco Bradesco', 'Transporte', '2026-09-15', 'pendente', true, 11, 12),
('Financiamento Carro - Outubro 2026 (12/12)', 890.00, 'Banco Bradesco', 'Transporte', '2026-10-15', 'pendente', true, 12, 12);

-- ============================================
-- VERIFICAR DADOS INSERIDOS
-- ============================================

-- Contar total de contas
SELECT COUNT(*) as total_contas FROM contas_pagar;

-- Resumo por status
SELECT status, COUNT(*) as quantidade, SUM(valor) as total 
FROM contas_pagar 
GROUP BY status;

-- Resumo por tipo de despesa
SELECT tipo_despesa, COUNT(*) as quantidade, SUM(valor) as total 
FROM contas_pagar 
GROUP BY tipo_despesa 
ORDER BY total DESC;

-- Contas recorrentes
SELECT COUNT(*) as total_recorrentes 
FROM contas_pagar 
WHERE recorrente = true;

-- ============================================
-- LIMPAR DADOS DE TESTE (SE NECESSÁRIO)
-- ============================================

-- ATENÇÃO: Este comando apaga TODOS os dados da tabela!
-- Use apenas se quiser remover os dados de teste
-- DELETE FROM contas_pagar;

-- Para apagar apenas dados de teste específicos:
-- DELETE FROM contas_pagar WHERE credor LIKE '%Teste%';

-- ============================================
-- ESTATÍSTICAS DOS DADOS DE TESTE
-- ============================================

-- Total geral
SELECT 
    COUNT(*) as total_contas,
    SUM(valor) as valor_total,
    AVG(valor) as valor_medio,
    MIN(valor) as menor_valor,
    MAX(valor) as maior_valor
FROM contas_pagar;

-- Por mês
SELECT 
    TO_CHAR(data_vencimento, 'YYYY-MM') as mes,
    COUNT(*) as quantidade,
    SUM(valor) as total
FROM contas_pagar
GROUP BY TO_CHAR(data_vencimento, 'YYYY-MM')
ORDER BY mes;
